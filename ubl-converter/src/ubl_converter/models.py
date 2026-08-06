"""Internal invoice model shared by every input parser and the UBL writer.

Parsers (XML, PDF) normalise their input into these dataclasses; the UBL
writer only ever consumes this model, so adding a new input format never
touches the output side.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional


TWO_PLACES = Decimal("0.01")


def money(value: Decimal | float | int | str) -> Decimal:
    """Normalise any numeric input to a 2-decimal Decimal."""
    return Decimal(str(value)).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


@dataclass
class Party:
    name: str = ""
    vat_id: Optional[str] = None
    registration_id: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country_code: Optional[str] = None
    email: Optional[str] = None


@dataclass
class InvoiceLine:
    line_id: str = "1"
    description: str = ""
    quantity: Decimal = Decimal("1")
    unit_code: str = "C62"  # UN/ECE rec 20: "one" (piece)
    unit_price: Decimal = Decimal("0")
    vat_rate: Decimal = Decimal("0")  # percentage, e.g. 21
    vat_category: str = "S"  # UNCL5305: S=standard, Z=zero, E=exempt

    @property
    def line_total(self) -> Decimal:
        return money(self.quantity * self.unit_price)


@dataclass
class Invoice:
    invoice_number: str = ""
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    currency: str = "EUR"
    supplier: Party = field(default_factory=Party)
    customer: Party = field(default_factory=Party)
    lines: list[InvoiceLine] = field(default_factory=list)
    note: Optional[str] = None
    payment_iban: Optional[str] = None
    payment_reference: Optional[str] = None
    buyer_reference: Optional[str] = None
    # Totals as stated on the source document, if present. When omitted
    # they are recomputed from the lines.
    stated_total_excl: Optional[Decimal] = None
    stated_tax_amount: Optional[Decimal] = None
    stated_total_incl: Optional[Decimal] = None

    @property
    def total_excl(self) -> Decimal:
        if self.stated_total_excl is not None:
            return money(self.stated_total_excl)
        return money(sum((l.line_total for l in self.lines), Decimal("0")))

    @property
    def tax_amount(self) -> Decimal:
        if self.stated_tax_amount is not None:
            return money(self.stated_tax_amount)
        return money(
            sum(
                (l.line_total * l.vat_rate / Decimal("100") for l in self.lines),
                Decimal("0"),
            )
        )

    @property
    def total_incl(self) -> Decimal:
        if self.stated_total_incl is not None:
            return money(self.stated_total_incl)
        return money(self.total_excl + self.tax_amount)

    def tax_breakdown(self) -> list[tuple[Decimal, str, Decimal, Decimal]]:
        """Group lines by VAT rate.

        Returns a list of (rate, category, taxable_amount, tax_amount) sorted
        by rate. If the invoice has no lines, a single synthetic subtotal is
        derived from the stated totals so the UBL output stays schema-valid.
        """
        if not self.lines:
            taxable = self.total_excl
            tax = self.tax_amount
            rate = Decimal("0")
            if taxable:
                rate = (tax / taxable * Decimal("100")).quantize(Decimal("0.1"))
            category = "S" if tax else "Z"
            return [(rate, category, taxable, tax)]

        groups: dict[tuple[Decimal, str], list[InvoiceLine]] = {}
        for line in self.lines:
            groups.setdefault((line.vat_rate, line.vat_category), []).append(line)
        breakdown = []
        for (rate, category), lines in sorted(groups.items()):
            taxable = money(sum((l.line_total for l in lines), Decimal("0")))
            tax = money(taxable * rate / Decimal("100"))
            breakdown.append((rate, category, taxable, tax))
        return breakdown
