import sys
import xml.etree.ElementTree as ET
from decimal import Decimal
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from make_sample_pdf import build_pdf, INVOICE_TEXT  # noqa: E402

from ubl_converter.pdf_parser import PdfParseError, parse_invoice_pdf
from ubl_converter.ubl_writer import NS_INVOICE, invoice_to_ubl


@pytest.fixture()
def sample_pdf(tmp_path):
    path = tmp_path / "invoice.pdf"
    path.write_bytes(build_pdf(INVOICE_TEXT))
    return path


def test_extracts_header_fields(sample_pdf):
    inv = parse_invoice_pdf(sample_pdf)
    assert inv.invoice_number == "INV-2026-0042"
    assert inv.issue_date.isoformat() == "2026-07-15"
    assert inv.due_date.isoformat() == "2026-08-14"
    assert inv.currency == "EUR"
    assert inv.payment_iban == "BE71096123456769"
    assert inv.supplier.name == "Acme Consulting BV"
    assert inv.supplier.vat_id == "BE0123456749"
    assert inv.customer.vat_id == "BE0987654321"


def test_extracts_lines(sample_pdf):
    inv = parse_invoice_pdf(sample_pdf)
    assert len(inv.lines) == 2
    first, second = inv.lines
    assert first.description == "Consultancy services July"
    assert first.quantity == Decimal("10")
    assert first.unit_price == Decimal("95.00")
    assert first.vat_rate == Decimal("21")
    assert second.unit_price == Decimal("1200.00")  # EU "1.200,00" notation


def test_extracts_totals(sample_pdf):
    inv = parse_invoice_pdf(sample_pdf)
    assert inv.total_excl == Decimal("2150.00")
    assert inv.tax_amount == Decimal("451.50")
    assert inv.total_incl == Decimal("2601.50")


def test_produces_valid_ubl(sample_pdf):
    inv = parse_invoice_pdf(sample_pdf, customer_name="Gheeraert Transport NV")
    root = ET.fromstring(invoice_to_ubl(inv))
    assert root.tag == f"{{{NS_INVOICE}}}Invoice"


def test_rejects_pdf_without_invoice_data(tmp_path):
    path = tmp_path / "letter.pdf"
    path.write_bytes(build_pdf(["Dear Sir", "Nothing to see here", "Kind regards"]))
    with pytest.raises(PdfParseError):
        parse_invoice_pdf(path)


def test_rejects_non_pdf(tmp_path):
    path = tmp_path / "fake.pdf"
    path.write_bytes(b"not a pdf at all")
    with pytest.raises(PdfParseError):
        parse_invoice_pdf(path)
