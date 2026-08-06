"""Command line interface: convert an XML or PDF invoice to UBL 2.1."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .models import Invoice
from .pdf_parser import PdfParseError, parse_invoice_pdf
from .ubl_writer import invoice_to_ubl
from .xml_parser import XmlParseError, parse_invoice_xml


def detect_format(path: Path) -> str:
    """Detect the input format from magic bytes, falling back to the extension."""
    try:
        head = path.open("rb").read(512).lstrip()
    except OSError as exc:
        raise SystemExit(f"error: cannot read {path}: {exc}")
    if head.startswith(b"%PDF"):
        return "pdf"
    if head.startswith(b"<") or head.startswith(b"\xef\xbb\xbf<"):
        return "xml"
    suffix = path.suffix.lower()
    if suffix in (".pdf", ".xml"):
        return suffix[1:]
    raise SystemExit(
        f"error: cannot determine the format of {path} — expected a PDF or XML invoice."
    )


def convert_file(
    path: Path, supplier_name: str = "", customer_name: str = ""
) -> str:
    fmt = detect_format(path)
    if fmt == "pdf":
        invoice = parse_invoice_pdf(path, supplier_name=supplier_name, customer_name=customer_name)
        if supplier_name:
            invoice.supplier.name = supplier_name
        if customer_name:
            invoice.customer.name = customer_name
        return invoice_to_ubl(invoice)

    result = parse_invoice_xml(path.read_text(encoding="utf-8-sig"))
    if isinstance(result, str):
        return result  # already UBL — passed through unchanged
    if supplier_name:
        result.supplier.name = supplier_name
    if customer_name:
        result.customer.name = customer_name
    return invoice_to_ubl(result)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="ubl-convert",
        description="Convert an XML or PDF invoice to a UBL 2.1 (EN 16931 / Peppol BIS 3.0) invoice.",
    )
    parser.add_argument("input", type=Path, help="path to the source invoice (.xml or .pdf)")
    parser.add_argument(
        "-o", "--output", type=Path, default=None,
        help="output file (default: <input>.ubl.xml next to the source)",
    )
    parser.add_argument(
        "--supplier-name", default="",
        help="override/supply the supplier name (useful for PDFs with odd letterheads)",
    )
    parser.add_argument(
        "--customer-name", default="",
        help="override/supply the customer name (PDF extraction cannot infer it reliably)",
    )
    parser.add_argument(
        "--stdout", action="store_true", help="print the UBL XML to stdout instead of a file"
    )
    args = parser.parse_args(argv)

    if not args.input.exists():
        parser.error(f"input file not found: {args.input}")

    try:
        ubl = convert_file(
            args.input, supplier_name=args.supplier_name, customer_name=args.customer_name
        )
    except (XmlParseError, PdfParseError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    if args.stdout:
        sys.stdout.write(ubl)
        return 0

    output = args.output or args.input.with_suffix(".ubl.xml")
    output.write_text(ubl, encoding="utf-8")
    print(f"Wrote {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
