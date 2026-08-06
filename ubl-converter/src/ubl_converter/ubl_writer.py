"""Serialise the internal Invoice model to a UBL 2.1 Invoice document.

The output follows the EN 16931 / Peppol BIS Billing 3.0 profile: it sets the
matching CustomizationID/ProfileID and emits the mandatory business terms
(parties, tax breakdown, monetary totals, invoice lines).
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from decimal import Decimal

from .models import Invoice, InvoiceLine, Party, money

NS_INVOICE = "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
NS_CAC = "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
NS_CBC = "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"

CUSTOMIZATION_ID = (
    "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0"
)
PROFILE_ID = "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0"

ET.register_namespace("", NS_INVOICE)
ET.register_namespace("cac", NS_CAC)
ET.register_namespace("cbc", NS_CBC)


def cbc(parent: ET.Element, tag: str, text: str, **attrs: str) -> ET.Element:
    el = ET.SubElement(parent, f"{{{NS_CBC}}}{tag}", attrs)
    el.text = text
    return el


def cac(parent: ET.Element, tag: str) -> ET.Element:
    return ET.SubElement(parent, f"{{{NS_CAC}}}{tag}")


def _amount(parent: ET.Element, tag: str, value: Decimal, currency: str) -> None:
    cbc(parent, tag, f"{money(value)}", currencyID=currency)


def _party(parent: ET.Element, tag: str, party: Party) -> None:
    wrapper = cac(parent, tag)
    p = cac(wrapper, "Party")

    if party.vat_id:
        endpoint_scheme = "9925" if party.vat_id.upper().startswith("BE") else "9930"
        cbc(p, "EndpointID", party.vat_id, schemeID=endpoint_scheme)

    name_el = cac(p, "PartyName")
    cbc(name_el, "Name", party.name or "Unknown")

    address = cac(p, "PostalAddress")
    if party.street:
        cbc(address, "StreetName", party.street)
    if party.city:
        cbc(address, "CityName", party.city)
    if party.postal_code:
        cbc(address, "PostalZone", party.postal_code)
    country = cac(address, "Country")
    cbc(country, "IdentificationCode", party.country_code or "BE")

    if party.vat_id:
        tax_scheme_el = cac(p, "PartyTaxScheme")
        cbc(tax_scheme_el, "CompanyID", party.vat_id)
        scheme = cac(tax_scheme_el, "TaxScheme")
        cbc(scheme, "ID", "VAT")

    legal = cac(p, "PartyLegalEntity")
    cbc(legal, "RegistrationName", party.name or "Unknown")
    if party.registration_id:
        cbc(legal, "CompanyID", party.registration_id)

    if party.email:
        contact = cac(p, "Contact")
        cbc(contact, "ElectronicMail", party.email)


def _line(parent: ET.Element, line: InvoiceLine, currency: str) -> None:
    el = cac(parent, "InvoiceLine")
    cbc(el, "ID", line.line_id)
    cbc(el, "InvoicedQuantity", f"{line.quantity.normalize():f}", unitCode=line.unit_code)
    _amount(el, "LineExtensionAmount", line.line_total, currency)

    item = cac(el, "Item")
    cbc(item, "Name", line.description or "Item")
    tax_cat = cac(item, "ClassifiedTaxCategory")
    cbc(tax_cat, "ID", line.vat_category)
    cbc(tax_cat, "Percent", f"{line.vat_rate.normalize():f}")
    scheme = cac(tax_cat, "TaxScheme")
    cbc(scheme, "ID", "VAT")

    price = cac(el, "Price")
    _amount(price, "PriceAmount", line.unit_price, currency)


def invoice_to_ubl(invoice: Invoice) -> str:
    """Render the invoice as a pretty-printed UBL 2.1 XML string."""
    root = ET.Element(f"{{{NS_INVOICE}}}Invoice")

    cbc(root, "CustomizationID", CUSTOMIZATION_ID)
    cbc(root, "ProfileID", PROFILE_ID)
    cbc(root, "ID", invoice.invoice_number or "UNKNOWN")
    if invoice.issue_date:
        cbc(root, "IssueDate", invoice.issue_date.isoformat())
    if invoice.due_date:
        cbc(root, "DueDate", invoice.due_date.isoformat())
    cbc(root, "InvoiceTypeCode", "380")
    if invoice.note:
        cbc(root, "Note", invoice.note)
    cbc(root, "DocumentCurrencyCode", invoice.currency)
    if invoice.buyer_reference:
        cbc(root, "BuyerReference", invoice.buyer_reference)

    _party(root, "AccountingSupplierParty", invoice.supplier)
    _party(root, "AccountingCustomerParty", invoice.customer)

    if invoice.payment_iban or invoice.payment_reference:
        means = cac(root, "PaymentMeans")
        cbc(means, "PaymentMeansCode", "30")  # credit transfer
        if invoice.payment_reference:
            cbc(means, "PaymentID", invoice.payment_reference)
        if invoice.payment_iban:
            account = cac(means, "PayeeFinancialAccount")
            cbc(account, "ID", invoice.payment_iban.replace(" ", ""))

    tax_total = cac(root, "TaxTotal")
    _amount(tax_total, "TaxAmount", invoice.tax_amount, invoice.currency)
    for rate, category, taxable, tax in invoice.tax_breakdown():
        subtotal = cac(tax_total, "TaxSubtotal")
        _amount(subtotal, "TaxableAmount", taxable, invoice.currency)
        _amount(subtotal, "TaxAmount", tax, invoice.currency)
        cat_el = cac(subtotal, "TaxCategory")
        cbc(cat_el, "ID", category)
        cbc(cat_el, "Percent", f"{rate.normalize():f}")
        scheme = cac(cat_el, "TaxScheme")
        cbc(scheme, "ID", "VAT")

    totals = cac(root, "LegalMonetaryTotal")
    _amount(totals, "LineExtensionAmount", invoice.total_excl, invoice.currency)
    _amount(totals, "TaxExclusiveAmount", invoice.total_excl, invoice.currency)
    _amount(totals, "TaxInclusiveAmount", invoice.total_incl, invoice.currency)
    _amount(totals, "PayableAmount", invoice.total_incl, invoice.currency)

    if invoice.lines:
        lines = invoice.lines
    else:
        # No line detail on the source document: emit a single synthetic line
        # carrying the document totals, tagged with the derived VAT rate.
        rate, category, _, _ = invoice.tax_breakdown()[0]
        lines = [
            InvoiceLine(
                line_id="1",
                description=invoice.note or "Invoice total",
                quantity=Decimal("1"),
                unit_price=invoice.total_excl,
                vat_rate=rate,
                vat_category=category,
            )
        ]
    for line in lines:
        _line(root, line, invoice.currency)

    ET.indent(root, space="  ")
    body = ET.tostring(root, encoding="unicode")
    return f'<?xml version="1.0" encoding="UTF-8"?>\n{body}\n'
