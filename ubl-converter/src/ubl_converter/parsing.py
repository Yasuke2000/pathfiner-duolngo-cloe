"""Shared parsing helpers for dates and amounts in European/US notations."""

from __future__ import annotations

import re
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Optional

_DATE_FORMATS = (
    "%Y-%m-%d",
    "%d-%m-%Y",
    "%d/%m/%Y",
    "%m/%d/%Y",
    "%d.%m.%Y",
    "%Y/%m/%d",
    "%d %B %Y",
    "%d %b %Y",
    "%B %d, %Y",
    "%b %d, %Y",
)


def parse_date(text: str) -> Optional[date]:
    """Parse a date in any of the common invoice notations, or None."""
    cleaned = text.strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
    return None


def parse_amount(text: str) -> Optional[Decimal]:
    """Parse a monetary amount written in EU (1.234,56) or US (1,234.56) style."""
    cleaned = re.sub(r"[^\d,.\-]", "", text.strip())
    if not cleaned or not re.search(r"\d", cleaned):
        return None

    has_comma = "," in cleaned
    has_dot = "." in cleaned
    if has_comma and has_dot:
        # The rightmost separator is the decimal mark.
        if cleaned.rfind(",") > cleaned.rfind("."):
            cleaned = cleaned.replace(".", "").replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")
    elif has_comma:
        # A single comma followed by exactly 3 digits is a thousands separator
        # ("1,500"); otherwise it is a decimal mark ("1500,50").
        if re.fullmatch(r"-?\d{1,3}(,\d{3})+", cleaned):
            cleaned = cleaned.replace(",", "")
        else:
            cleaned = cleaned.replace(",", ".")
    elif has_dot and re.fullmatch(r"-?\d{1,3}(\.\d{3})+", cleaned):
        # "1.500" style EU thousands grouping with no decimals.
        cleaned = cleaned.replace(".", "")

    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None
