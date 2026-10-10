import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal

def calculate_cherry_payout(gross_weight: Decimal, tare_weight: Decimal, base_rate: Decimal, brix: Decimal, floaters_pct: Decimal):
    net_weight = gross_weight - tare_weight
    if net_weight <= 0:
        raise ValueError("Net weight must be positive.")
    
    # Premium bonus: +Rs 8.00 if Brix >= 21.0 and Floaters <= 2.0%
    premium = Decimal("8.00") if brix >= Decimal("21.0") and floaters_pct <= Decimal("2.0") else Decimal("0.00")
    total_rate = base_rate + premium
    total_payout = (net_weight * total_rate).quantize(Decimal("0.01"))
    return net_weight, total_rate, total_payout

def test_cherry_payout_with_grade_a_bonus():
    net_wt, rate, payout = calculate_cherry_payout(
        gross_weight=Decimal("52.5"),
        tare_weight=Decimal("2.5"),
        base_rate=Decimal("100.00"),
        brix=Decimal("22.4"),
        floaters_pct=Decimal("1.2")
    )
    assert net_wt == Decimal("50.0")
    assert rate == Decimal("108.00")
    assert payout == Decimal("5400.00")

def test_eight_hour_pulping_cutoff_compliance():
    harvest_time = datetime.now(timezone.utc) - timedelta(hours=6)
    intake_time = datetime.now(timezone.utc)
    delta_hours = (intake_time - harvest_time).total_seconds() / 3600.0
    
    # Compliant within 8 hours
    assert delta_hours <= 8.0

def test_eight_hour_pulping_cutoff_breach():
    harvest_time = datetime.now(timezone.utc) - timedelta(hours=9, minutes=30)
    intake_time = datetime.now(timezone.utc)
    delta_hours = (intake_time - harvest_time).total_seconds() / 3600.0
    
    # Breached 8-hour window -> downgrade or QA hold
    is_breached = delta_hours > 8.0
    assert is_breached is True
