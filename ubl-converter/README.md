# ubl-converter

Convert **XML** and **PDF** invoices to **UBL 2.1** invoice documents
(EN 16931 / Peppol BIS Billing 3.0 profile).

Free to run and free to host: plain Python, one dependency
([pypdf](https://pypi.org/project/pypdf/), BSD-licensed), and a built-in web UI
that uses only the standard library — no framework, no database, no paid APIs.

## What it does

| Input | How it's handled |
|---|---|
| UBL invoice XML | Detected and passed through unchanged |
| Other invoice XML | Tag-name-based mapping (understands the simple schema below and most ad-hoc export formats with recognisable English tag names) |
| Text-based PDF | Text-layer extraction + pattern matching for invoice number, dates, VAT ids, IBAN, line items and totals (EN/NL/FR/DE keywords) |
| Scanned PDF | Rejected with a clear error — run OCR first |

Output is a UBL 2.1 `Invoice` with the Peppol BIS 3.0 `CustomizationID`/
`ProfileID`, both parties, a per-rate tax breakdown, monetary totals and
invoice lines. Amounts in EU (`1.234,56`) and US (`1,234.56`) notation are
both understood.

> **Note** PDF extraction is heuristic by nature. Review the output before
> sending it to a customer or a Peppol access point, and validate it with the
> free [Peppol/EN 16931 validator](https://ecosio.com/en/peppol-and-xml-document-validator/)
> if compliance matters.

## Install

```bash
pip install .          # from this directory
pip install .[dev]     # with test dependencies
```

## CLI usage

```bash
ubl-convert invoice.pdf                       # writes invoice.ubl.xml
ubl-convert invoice.xml -o out/invoice-ubl.xml
ubl-convert invoice.pdf --customer-name "Gheeraert Transport NV"
ubl-convert invoice.pdf --stdout              # print to stdout
```

`--supplier-name` / `--customer-name` override or supply party names — useful
for PDFs, where the customer name can't be inferred reliably.

## Web UI (self-hosted, free)

```bash
python -m ubl_converter.web        # http://localhost:8080
```

Upload an XML or PDF invoice in the browser, download the UBL result.
Configure with `UBL_HOST` / `UBL_PORT` environment variables. There's a
`/health` endpoint for monitoring.

### Hosting it for your company at ~€0

* **Any internal machine** — an old desktop, a NAS, a spare VM: install
  Python 3.10+, `pip install .`, run `python -m ubl_converter.web`, done.
  It's a single threaded-HTTP-server process using a few tens of MB of RAM.
* **Docker** (recommended for something always-on):

  ```bash
  docker build -t ubl-converter .
  docker run -d --restart unless-stopped -p 8080:8080 ubl-converter
  ```

* **Free cloud tiers** — the container runs comfortably within the free tier
  of Fly.io, Google Cloud Run, or an Oracle Cloud always-free VM.

The web UI has **no authentication** — keep it on your LAN/VPN or put a
reverse proxy (nginx, Caddy, Traefik) with basic auth and TLS in front of it
if you expose it further.

## Simple XML input schema

Any XML with recognisable tag names works, but this canonical shape is
guaranteed to map fully (see `examples/sample-invoice.xml`):

```xml
<Invoice>
  <InvoiceNumber>INV-2026-0042</InvoiceNumber>
  <IssueDate>2026-07-15</IssueDate>
  <DueDate>2026-08-14</DueDate>
  <Currency>EUR</Currency>
  <Supplier>
    <Name>…</Name><VatNumber>…</VatNumber><Street>…</Street>
    <City>…</City><PostalCode>…</PostalCode><Country>BE</Country><Email>…</Email>
  </Supplier>
  <Customer>…same fields…</Customer>
  <Lines>
    <Line>
      <Description>…</Description><Quantity>10</Quantity>
      <UnitPrice>95.00</UnitPrice><VatRate>21</VatRate>
    </Line>
  </Lines>
  <Iban>BE71…</Iban>
  <PaymentReference>+++042/2026/00042+++</PaymentReference>
</Invoice>
```

Totals are recomputed from the lines; if the source states its own totals
(`Subtotal`, `VatAmount`, `GrandTotal`, …) those take precedence.

## Python API

```python
from pathlib import Path
from ubl_converter import parse_invoice_pdf, parse_invoice_xml, invoice_to_ubl

invoice = parse_invoice_pdf(Path("invoice.pdf"))
ubl_xml = invoice_to_ubl(invoice)
```

## Development

```bash
pip install -e .[dev]
pytest
python scripts/make_sample_pdf.py   # regenerate examples/sample-invoice.pdf
```

## Layout

```
src/ubl_converter/
  models.py       internal invoice model (Decimal-based, VAT breakdown)
  xml_parser.py   XML → model (+ UBL passthrough)
  pdf_parser.py   PDF → model (pypdf text layer + heuristics)
  ubl_writer.py   model → UBL 2.1 XML
  cli.py          ubl-convert command
  web.py          stdlib-only web UI
```

## License

MIT
