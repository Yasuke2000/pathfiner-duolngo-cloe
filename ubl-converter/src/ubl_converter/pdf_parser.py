"""Extract invoice data from a (text-based) PDF and map it to the model.

Extraction is heuristic: the PDF's text layer is scanned with a set of
patterns for the usual invoice fields (number, dates, VAT ids, IBAN, totals)
and a lightweight table detector for line items. Scanned/image-only PDFs
have no text layer and are rejected with a clear error — run OCR first.
"""

from __future__ import annotations

import re
from decimal import Decimal
from pathlib import Path
from typing import Optional

from pypdf import PdfReader

from .models import Invoice, InvoiceLine, Party
from .parsing import parse_amount, parse_date


class PdfParseError(ValueError):
    pass


DATE_PATTERN = r"(\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{1,2}\s+\w+\s+\d{4})"

INVOICE_NUMBER_RE = re.compile(
    # The captured reference must contain at least one digit, so a bare
    # "INVOICE" heading is never mistaken for the number itself.
    r"(?:invoice|factuur|facture|rechnung)\s*(?:no|number|nr|nummer|num[eé]ro|#)?\s*[:.]?\s*"
    r"((?=[A-Z\-/\.]{0,12}\d)[A-Z0-9][A-Z0-9\-/\.]{2,})",
    re.IGNORECASE,
)
ISSUE_DATE_RE = re.compile(
    r"(?:invoice\s+date|issue\s+date|date|datum|factuurdatum)\s*[:.]?\s*" + DATE_PATTERN,
    re.IGNORECASE,
)
DUE_DATE_RE = re.compile(
    r"(?:due\s+date|payment\s+due|vervaldatum|[eé]ch[eé]ance)\s*[:.]?\s*" + DATE_PATTERN,
    re.IGNORECASE,
)
VAT_ID_RE = re.compile(r"\b([A-Z]{2}\s?\d{4}[\d.\s]{4,10}\d)\b")
IBAN_RE = re.compile(r"\b([A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,3})?)\b")
AMOUNT = r"(-?(?:\d{1,3}(?:[.,\s]\d{3})*|\d+)(?:[.,]\d{2})?)"
# Totals lines virtually always print cents; requiring the decimal part keeps
# these patterns from matching VAT registration numbers or quantities.
AMOUNT_CENTS = r"(-?(?:\d{1,3}(?:[.,\s]\d{3})*|\d+)[.,]\d{2})"
TOTAL_EXCL_RE = re.compile(
    r"(?:sub\s?total|total\s+excl(?:\.|usive)?(?:\s+vat)?|totaal\s+excl\S*|net\s+total|total\s+ht)"
    r"\s*[:.]?\s*(?:€|EUR|USD|\$|£|GBP)?\s*" + AMOUNT_CENTS,
    re.IGNORECASE,
)
TAX_RE = re.compile(
    r"(?:vat|btw|tva|tax)\s*(?:\(?(\d{1,2}(?:[.,]\d+)?)\s*%\)?)?\s*[:.]?\s*"
    r"(?:€|EUR|USD|\$|£|GBP)?\s*" + AMOUNT_CENTS,
    re.IGNORECASE,
)
TOTAL_INCL_RE = re.compile(
    r"\b(?:total\s+(?:incl\S*|due|amount)|grand\s+total|amount\s+due|totaal\s+incl\S*|"
    r"total\s+ttc|te\s+betalen)\s*(?:\(?\s*(?:€|EUR|USD|\$|£|GBP)\s*\)?)?\s*[:.]?\s*" + AMOUNT_CENTS,
    re.IGNORECASE,
)
CURRENCY_HINTS = (("€", "EUR"), ("EUR", "EUR"), ("£", "GBP"), ("GBP", "GBP"), ("$", "USD"), ("USD", "USD"))
# A line-item row: description, quantity, unit price, line total,
# optionally a VAT percentage in between.
LINE_ROW_RE = re.compile(
    r"^(?P<desc>.+?)\s{2,}(?P<qty>\d+(?:[.,]\d+)?)\s+" + AMOUNT.replace("(", "(?P<price>", 1)
    + r"(?:\s+(?P<vat>\d{1,2}(?:[.,]\d+)?)\s*%)?\s+" + AMOUNT.replace("(", "(?P<total>", 1) + r"\s*$"
)


def extract_text(path: Path) -> str:
    try:
        reader = PdfReader(str(path))
    except Exception as exc:  # pypdf raises a mixed bag of errors
        raise PdfParseError(f"Could not open PDF: {exc}") from exc
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
    if not text.strip():
        raise PdfParseError(
            "No text layer found in this PDF (it is probably a scan). "
            "Run OCR on it first, then convert the OCR'd copy."
        )
    return text


def _detect_currency(text: str) -> str:
    for hint, code in CURRENCY_HINTS:
        if hint in text:
            return code
    return "EUR"


def _find_lines(text: str) -> list[InvoiceLine]:
    lines: list[InvoiceLine] = []
    for raw in text.splitlines():
        match = LINE_ROW_RE.match(raw.strip("\r"))
        if not match:
            continue
        desc = match.group("desc").strip()
        # Skip rows that are actually the totals block.
        if re.search(r"total|vat|btw|tva|subtotal", desc, re.IGNORECASE):
            continue
        qty = parse_amount(match.group("qty")) or Decimal("1")
        price = parse_amount(match.group("price")) or Decimal("0")
        vat = parse_amount(match.group("vat") or "0") or Decimal("0")
        lines.append(
            InvoiceLine(
                line_id=str(len(lines) + 1),
                description=desc,
                quantity=qty,
                unit_price=price,
                vat_rate=vat,
                vat_category="S" if vat > 0 else "Z",
            )
        )
    return lines


def _first_amount(match: Optional[re.Match], group: int = 1) -> Optional[Decimal]:
    return parse_amount(match.group(group)) if match else None


def parse_invoice_pdf(path: Path, supplier_name: str = "", customer_name: str = "") -> Invoice:
    text = extract_text(path)
    invoice = Invoice()

    number = INVOICE_NUMBER_RE.search(text)
    if number:
        invoice.invoice_number = number.group(1).rstrip(".")

    issue = ISSUE_DATE_RE.search(text)
    if issue:
        invoice.issue_date = parse_date(issue.group(1))
    due = DUE_DATE_RE.search(text)
    if due:
        invoice.due_date = parse_date(due.group(1))

    invoice.currency = _detect_currency(text)

    vat_ids = []
    for m in VAT_ID_RE.finditer(text):
        cleaned = re.sub(r"[\s.]", "", m.group(1))
        if cleaned not in vat_ids:
            vat_ids.append(cleaned)
    # Convention: the first VAT id on an invoice belongs to the issuer.
    invoice.supplier = Party(name=supplier_name, vat_id=vat_ids[0] if vat_ids else None)
    invoice.customer = Party(
        name=customer_name, vat_id=vat_ids[1] if len(vat_ids) > 1 else None
    )
    if not supplier_name:
        # First non-empty line of the document is usually the letterhead name.
        for raw in text.splitlines():
            candidate = raw.strip()
            if candidate and not re.search(r"invoice|factuur|facture|rechnung", candidate, re.IGNORECASE):
                invoice.supplier.name = candidate
                break

    iban = IBAN_RE.search(text)
    if iban:
        invoice.payment_iban = iban.group(1).replace(" ", "")

    invoice.lines = _find_lines(text)

    excl = _first_amount(TOTAL_EXCL_RE.search(text))
    if excl is not None:
        invoice.stated_total_excl = excl
    tax_match = TAX_RE.search(text)
    if tax_match:
        tax = parse_amount(tax_match.group(2))
        if tax is not None:
            invoice.stated_tax_amount = tax
    incl = _first_amount(TOTAL_INCL_RE.search(text))
    if incl is not None:
        invoice.stated_total_incl = incl

    if not invoice.invoice_number and not invoice.lines and invoice.total_incl == 0:
        raise PdfParseError(
            "Could not recognise any invoice data in this PDF "
            "(no invoice number, line items or totals found)."
        )
    return invoice
