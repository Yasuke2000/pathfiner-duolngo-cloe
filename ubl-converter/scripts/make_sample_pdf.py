"""Generate a minimal text-based invoice PDF without any dependencies.

Used to (re)build examples/sample-invoice.pdf and by the test suite. The PDF
uses uncompressed content streams and the built-in Helvetica font so any
extractor (pypdf included) can read the text layer back out.
"""

from __future__ import annotations

from pathlib import Path

INVOICE_TEXT = [
    "Acme Consulting BV",
    "Stationsstraat 12, 9800 Deinze, Belgium",
    "VAT: BE 0123 456 749",
    "",
    "INVOICE",
    "Invoice number: INV-2026-0042",
    "Invoice date: 2026-07-15",
    "Due date: 2026-08-14",
    "",
    "Bill to: Gheeraert Transport NV",
    "VAT: BE 0987 654 321",
    "",
    "Description                              Qty    Unit price   VAT     Total",
    "Consultancy services July                10     95.00        21 %    950.00",
    "Software licence (annual)                1      1.200,00     21 %    1.200,00",
    "",
    "Subtotal: 2,150.00",
    "VAT (21%): 451.50",
    "Total due: EUR 2,601.50",
    "",
    "Payment to IBAN BE71 0961 2345 6769",
]


def _escape(text: str) -> str:
    return text.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def build_pdf(lines: list[str]) -> bytes:
    content_parts = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"]
    for line in lines:
        content_parts.append(f"({_escape(line)}) Tj T*")
    content_parts.append("ET")
    stream = "\n".join(content_parts).encode("latin-1")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    out = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n".encode() + obj + b"\nendobj\n"

    xref_pos = len(out)
    out += f"xref\n0 {len(objects) + 1}\n".encode()
    out += b"0000000000 65535 f \n"
    for off in offsets[1:]:
        out += f"{off:010d} 00000 n \n".encode()
    out += (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_pos}\n%%EOF\n"
    ).encode()
    return bytes(out)


def write_sample(path: Path) -> Path:
    path.write_bytes(build_pdf(INVOICE_TEXT))
    return path


if __name__ == "__main__":
    target = Path(__file__).resolve().parent.parent / "examples" / "sample-invoice.pdf"
    print(f"Wrote {write_sample(target)}")
