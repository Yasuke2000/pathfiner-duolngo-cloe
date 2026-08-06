from decimal import Decimal

import pytest

from ubl_converter.parsing import parse_amount, parse_date


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("1,234.56", Decimal("1234.56")),
        ("1.234,56", Decimal("1234.56")),
        ("1234.56", Decimal("1234.56")),
        ("1234,56", Decimal("1234.56")),
        ("1,500", Decimal("1500")),
        ("1.500", Decimal("1500")),
        ("€ 99,99", Decimal("99.99")),
        ("$ 42", Decimal("42")),
        ("-12,50", Decimal("-12.50")),
        ("abc", None),
        ("", None),
    ],
)
def test_parse_amount(text, expected):
    assert parse_amount(text) == expected


@pytest.mark.parametrize(
    ("text", "iso"),
    [
        ("2026-07-15", "2026-07-15"),
        ("15/07/2026", "2026-07-15"),
        ("15-07-2026", "2026-07-15"),
        ("15.07.2026", "2026-07-15"),
        ("15 July 2026", "2026-07-15"),
        ("July 15, 2026", "2026-07-15"),
    ],
)
def test_parse_date(text, iso):
    assert parse_date(text).isoformat() == iso


def test_parse_date_invalid():
    assert parse_date("not a date") is None
