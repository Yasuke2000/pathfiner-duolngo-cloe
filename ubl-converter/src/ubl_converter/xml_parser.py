"""Parse invoice XML into the internal model.

Two situations are handled:

* The input is already a UBL Invoice — it is passed through untouched.
* Any other invoice-ish XML — a tag-name-based heuristic mapper pulls out
  the usual fields (number, dates, parties, lines, totals). It understands
  the documented "simple invoice" schema (see README) as well as most
  ad-hoc export formats that use recognisable English tag names.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from decimal import Decimal
from typing import Iterable, Optional

from .models import Invoice, InvoiceLine, Party
from .parsing import parse_amount, parse_date

UBL_INVOICE_NS = "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"


class XmlParseError(ValueError):
    pass


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def _find_first(root: ET.Element, names: Iterable[str]) -> Optional[ET.Element]:
    wanted = {n.lower() for n in names}
    for el in root.iter():
        if local_name(el.tag) in wanted and (el.text or "").strip():
            return el
    return None


def _text(root: ET.Element, names: Iterable[str]) -> Optional[str]:
    el = _find_first(root, names)
    return el.text.strip() if el is not None and el.text else None


def _child_by_names(root: ET.Element, names: Iterable[str]) -> Optional[ET.Element]:
    """Find the first descendant element whose local name matches (no text requirement)."""
    wanted = {n.lower() for n in names}
    for el in root.iter():
        if local_name(el.tag) in wanted:
            return el
    return None


def _parse_party(el: Optional[ET.Element]) -> Party:
    if el is None:
        return Party()
    return Party(
        name=_text(el, ("name", "companyname", "registrationname", "partyname")) or "",
        vat_id=_text(el, ("vat", "vatnumber", "vatid", "taxid", "companyid")),
        street=_text(el, ("street", "streetname", "address", "addressline", "line1")),
        city=_text(el, ("city", "cityname", "town")),
        postal_code=_text(el, ("zip", "zipcode", "postalcode", "postalzone", "postcode")),
        country_code=_text(el, ("country", "countrycode", "identificationcode")),
        email=_text(el, ("email", "electronicmail", "mail")),
    )


def _parse_line(el: ET.Element, index: int) -> InvoiceLine:
    quantity = parse_amount(_text(el, ("quantity", "qty", "invoicedquantity", "amount")) or "1")
    unit_price = parse_amount(
        _text(el, ("unitprice", "price", "priceamount", "rate", "unitcost")) or "0"
    )
    vat_rate = parse_amount(_text(el, ("vatrate", "vat", "taxrate", "percent", "taxpercent")) or "0")
    return InvoiceLine(
        line_id=_text(el, ("id", "lineid", "linenumber")) or str(index),
        description=_text(el, ("description", "name", "item", "product", "label")) or "",
        quantity=quantity or Decimal("1"),
        unit_price=unit_price or Decimal("0"),
        vat_rate=vat_rate or Decimal("0"),
        vat_category="S" if (vat_rate or Decimal("0")) > 0 else "Z",
    )


def is_ubl_invoice(root: ET.Element) -> bool:
    return root.tag == f"{{{UBL_INVOICE_NS}}}Invoice"


def parse_invoice_xml(content: str) -> Invoice | str:
    """Parse invoice XML.

    Returns the raw string unchanged when the input is already UBL, otherwise
    an :class:`Invoice` built from the recognised fields.
    """
    try:
        root = ET.fromstring(content)
    except ET.ParseError as exc:
        raise XmlParseError(f"Input is not well-formed XML: {exc}") from exc

    if is_ubl_invoice(root):
        return content

    invoice = Invoice()
    invoice.invoice_number = (
        _text(root, ("invoicenumber", "invoiceno", "invoicenr", "invoiceid", "documentnumber", "number"))
        or _text(root, ("id",))
        or ""
    )

    issue = _text(root, ("issuedate", "invoicedate", "date", "documentdate"))
    if issue:
        invoice.issue_date = parse_date(issue)
    due = _text(root, ("duedate", "paymentduedate", "expirydate"))
    if due:
        invoice.due_date = parse_date(due)

    invoice.currency = (
        _text(root, ("currency", "currencycode", "documentcurrencycode")) or "EUR"
    ).upper()
    invoice.note = _text(root, ("note", "comment", "remarks"))
    invoice.payment_iban = _text(root, ("iban", "bankaccount", "accountnumber"))
    invoice.payment_reference = _text(root, ("paymentreference", "structuredreference", "ogm"))
    invoice.buyer_reference = _text(root, ("buyerreference", "yourreference", "reference"))

    supplier_el = _child_by_names(
        root, ("supplier", "seller", "from", "vendor", "accountingsupplierparty", "issuer")
    )
    customer_el = _child_by_names(
        root, ("customer", "buyer", "to", "client", "accountingcustomerparty", "recipient")
    )
    invoice.supplier = _parse_party(supplier_el)
    invoice.customer = _parse_party(customer_el)

    line_names = {"line", "invoiceline", "item", "row", "detail", "orderline"}
    party_tags = set()
    for p in (supplier_el, customer_el):
        if p is not None:
            party_tags.update(id(e) for e in p.iter())
    index = 0
    for el in root.iter():
        if local_name(el.tag) in line_names and id(el) not in party_tags and len(el):
            index += 1
            invoice.lines.append(_parse_line(el, index))

    totals_scope = _child_by_names(root, ("totals", "legalmonetarytotal", "summary")) or root
    excl = _text(totals_scope, ("totalexcl", "totalexclvat", "subtotal", "nettotal", "taxexclusiveamount"))
    tax = _text(totals_scope, ("vatamount", "taxamount", "totalvat", "tax"))
    incl = _text(totals_scope, ("totalincl", "totalinclvat", "grandtotal", "taxinclusiveamount", "total", "payableamount"))
    if excl:
        invoice.stated_total_excl = parse_amount(excl)
    if tax:
        invoice.stated_tax_amount = parse_amount(tax)
    if incl:
        invoice.stated_total_incl = parse_amount(incl)

    if not invoice.invoice_number and not invoice.lines and invoice.total_incl == 0:
        raise XmlParseError(
            "Could not recognise any invoice data in this XML (no number, lines or totals found)."
        )
    return invoice
