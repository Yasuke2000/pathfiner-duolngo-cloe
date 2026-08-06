"""Tiny self-hostable web UI for the converter.

Deliberately built on the standard library only (no framework, no extra
dependencies) so it can run anywhere Python runs — an old desktop, a NAS,
a €0 VM — with:

    python -m ubl_converter.web            # listens on 0.0.0.0:8080
    UBL_PORT=9000 python -m ubl_converter.web

Intended for internal/LAN use; put it behind your reverse proxy if you need
TLS or authentication.
"""

from __future__ import annotations

import html
import os
import tempfile
from email.message import Message
from email.parser import BytesParser
from email.policy import HTTP
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .cli import convert_file
from .pdf_parser import PdfParseError
from .xml_parser import XmlParseError

MAX_UPLOAD = 20 * 1024 * 1024  # 20 MB

PAGE = """<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UBL converter</title>
<style>
  body {{ font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }}
  form {{ border: 2px dashed #999; border-radius: 8px; padding: 2rem; text-align: center; }}
  .error {{ background: #fee; border: 1px solid #c66; border-radius: 6px; padding: 1rem; }}
  button {{ font-size: 1rem; padding: .5rem 1.5rem; margin-top: 1rem; }}
</style>
<h1>Invoice &rarr; UBL 2.1 converter</h1>
<p>Upload an invoice as <strong>XML</strong> or text-based <strong>PDF</strong> and get back a
UBL 2.1 (EN&nbsp;16931 / Peppol BIS&nbsp;3.0) invoice document.</p>
{error}
<form method="post" enctype="multipart/form-data" action="/convert">
  <input type="file" name="invoice" accept=".xml,.pdf" required>
  <br>
  <button type="submit">Convert to UBL</button>
</form>
"""


def _error_page(message: str) -> str:
    return PAGE.format(error=f'<div class="error">{html.escape(message)}</div>')


def _parse_multipart(handler: BaseHTTPRequestHandler, body: bytes) -> tuple[str, bytes] | None:
    """Return (filename, content) of the uploaded file, or None."""
    header = f"Content-Type: {handler.headers.get('Content-Type', '')}\r\n\r\n".encode()
    message: Message = BytesParser(policy=HTTP).parsebytes(header + body)
    if not message.is_multipart():
        return None
    for part in message.iter_parts():
        filename = part.get_filename()
        if filename:
            return filename, part.get_payload(decode=True) or b""
    return None


class ConverterHandler(BaseHTTPRequestHandler):
    server_version = "ubl-converter"

    def _respond(self, status: int, content_type: str, body: bytes, **headers: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        for key, value in headers.items():
            self.send_header(key.replace("_", "-"), value)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 (stdlib naming)
        if self.path in ("/", "/index.html"):
            self._respond(200, "text/html; charset=utf-8", PAGE.format(error="").encode())
        elif self.path == "/health":
            self._respond(200, "text/plain", b"ok")
        else:
            self._respond(404, "text/plain", b"not found")

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/convert":
            self._respond(404, "text/plain", b"not found")
            return
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0 or length > MAX_UPLOAD:
            self._respond(413, "text/html; charset=utf-8",
                          _error_page("Upload missing or larger than 20 MB.").encode())
            return

        upload = _parse_multipart(self, self.rfile.read(length))
        if not upload or not upload[1]:
            self._respond(400, "text/html; charset=utf-8",
                          _error_page("No file received — pick an XML or PDF invoice.").encode())
            return

        filename, content = upload
        suffix = Path(filename).suffix.lower() or ".bin"
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(content)
                tmp_path = Path(tmp.name)
            try:
                ubl = convert_file(tmp_path)
            finally:
                tmp_path.unlink(missing_ok=True)
        except (XmlParseError, PdfParseError, SystemExit) as exc:
            self._respond(422, "text/html; charset=utf-8", _error_page(str(exc)).encode())
            return

        out_name = Path(filename).stem + ".ubl.xml"
        self._respond(
            200, "application/xml; charset=utf-8", ubl.encode(),
            Content_Disposition=f'attachment; filename="{out_name}"',
        )

    def log_message(self, fmt: str, *args) -> None:
        print(f"{self.address_string()} - {fmt % args}")


def main() -> None:
    host = os.environ.get("UBL_HOST", "0.0.0.0")
    port = int(os.environ.get("UBL_PORT", "8080"))
    server = ThreadingHTTPServer((host, port), ConverterHandler)
    print(f"UBL converter listening on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
