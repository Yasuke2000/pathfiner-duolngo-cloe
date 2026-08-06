import xml.etree.ElementTree as ET
from decimal import Decimal
from pathlib import Path

import pytest

from ubl_converter.ubl_writer import NS_CAC, NS_CBC, NS_INVOICE, invoice_to_ubl
from ubl_converter.xml_parser import XmlParseError, parse_invoice_xml

EXAMPLES = Path(__file__).resolve().parent.parent / "examples"

CBC = f"{{{NS_CBC}}}"
CAC = f"{{{NS_CAC}}}"


@pytest.fixture()
def sample_invoice():
    result = parse_invoice_xml((EXAMPLES / "sample-invoice.xml").read_text())
    assert not isinstance(result, str)
    return result


def test_parses_header_fields(sample_invoice):
    inv = sample_invoice
    assert inv.invoice_number == "INV-2026-0042"
    assert inv.issue_date.isoformat() == "2026-07-15"
    assert inv.due_date.isoformat() == "2026-08-14"
    assert inv.currency == "EUR"
    assert inv.payment_iban == "BE71096123456769"


def test_parses_parties(sample_invoice):
    inv = sample_invoice
    assert inv.supplier.name == "Acme Consulting BV"
    assert inv.supplier.vat_id == "BE0123456749"
    assert inv.supplier.city == "Deinze"
    assert inv.customer.name == "Gheeraert Transport NV"
    assert inv.customer.vat_id == "BE0987654321"


def test_parses_lines_and_totals(sample_invoice):
    inv = sample_invoice
    assert len(inv.lines) == 2
    assert inv.lines[0].quantity == Decimal("10")
    assert inv.lines[0].unit_price == Decimal("95.00")
    assert inv.total_excl == Decimal("2150.00")
    assert inv.tax_amount == Decimal("451.50")
    assert inv.total_incl == Decimal("2601.50")


def test_ubl_output_structure(sample_invoice):
    root = ET.fromstring(invoice_to_ubl(sample_invoice))
    assert root.tag == f"{{{NS_INVOICE}}}Invoice"
    assert root.findtext(f"{CBC}ID") == "INV-2026-0042"
    assert root.findtext(f"{CBC}InvoiceTypeCode") == "380"
    assert root.findtext(f"{CBC}DocumentCurrencyCode") == "EUR"

    supplier_name = root.find(
        f"{CAC}AccountingSupplierParty/{CAC}Party/{CAC}PartyName/{CBC}Name"
    )
    assert supplier_name is not None and supplier_name.text == "Acme Consulting BV"

    payable = root.find(f"{CAC}LegalMonetaryTotal/{CBC}PayableAmount")
    assert payable is not None
    assert payable.text == "2601.50"
    assert payable.get("currencyID") == "EUR"

    assert len(root.findall(f"{CAC}InvoiceLine")) == 2
    subtotals = root.findall(f"{CAC}TaxTotal/{CAC}TaxSubtotal")
    assert len(subtotals) == 1  # both lines share the 21% rate
    assert subtotals[0].findtext(f"{CAC}TaxCategory/{CBC}Percent") == "21"


def test_ubl_input_is_passed_through(sample_invoice):
    ubl = invoice_to_ubl(sample_invoice)
    assert parse_invoice_xml(ubl) == ubl


def test_unrecognisable_xml_is_rejected():
    with pytest.raises(XmlParseError):
        parse_invoice_xml("<catalog><book><title>XML in a Nutshell</title></book></catalog>")


def test_malformed_xml_is_rejected():
    with pytest.raises(XmlParseError):
        parse_invoice_xml("this is not xml")
