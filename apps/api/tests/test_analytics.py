import pytest
from apps.api.src.modules.analytics.service import AnalyticsService

def test_analytics_executive_summary_integrity():
    data = AnalyticsService.get_executive_summary()
    
    # 1. Procurement KPI validation
    proc = data["procurement"]
    assert proc["total_cherry_intake_kg"] == proc["intake_by_district"]["Gulmi"] + proc["intake_by_district"]["Palpa"]
    assert proc["eight_hour_cutoff_compliance_pct"] >= 95.0
    assert proc["average_brix"] >= 21.0

    # 2. Financial reconciliation
    fin = data["financials"]
    assert fin["currency"] == "NPR"
    assert fin["disbursed_payouts"] + fin["pending_sync_liabilities"] == fin["total_procurement_expenditure"]

    # 3. Warehouse Mass-Balance conversion presence
    wh = data["warehouse_mass_balance"]
    assert "fresh_cherry_kg" in wh
    assert "milled_green_beans_kg" in wh
    assert "packaged_drip_boxes" in wh

    # 4. EUDR Compliance
    eudr = data["eudr_compliance"]
    assert eudr["deforestation_pass_rate"] == 100.0
    assert eudr["regulation_status"] == "ARTICLE_9_VERIFIED"
