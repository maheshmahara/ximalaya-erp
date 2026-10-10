import pytest
from playwright.sync_api import sync_playwright, expect
import httpx
import time

FRONTEND_URL = "http://web:3000"
BACKEND_URL = "http://localhost:8000"

def test_api_health_and_spatial_endpoints():
    """Verify backend health and PostGIS GeoJSON endpoints with wait retry."""
    with httpx.Client(base_url=BACKEND_URL, timeout=10.0) as client:
        health_ok = False
        for _ in range(10):
            try:
                res = client.get("/healthz")
                if res.status_code == 200:
                    health_ok = True
                    break
            except Exception:
                time.sleep(1.0)
        assert health_ok, "FastAPI backend /healthz did not respond within 10s"

        # Check PostGIS GeoJSON plots
        spatial_res = client.get("/spatial/plots")
        assert spatial_res.status_code == 200
        geojson = spatial_res.json()
        assert geojson["type"] == "FeatureCollection"
        assert len(geojson["features"]) >= 4

        plot_refs = [f["properties"]["plot_ref"] for f in geojson["features"]]
        assert "PLOT-GUL-042" in plot_refs
        assert "PLOT-PAL-101" in plot_refs

def test_frontend_mobile_intake_page():
    """Test mobile intake UI rendering and client-side calculations."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # Load mobile intake page
        page.goto(f"{FRONTEND_URL}/intake/mobile", wait_until="networkidle")

        # Verify page title and header
        expect(page.locator("text=Cherry Field Intake")).to_be_visible()
        expect(page.locator("text=Ruru Sahakari")).to_be_visible()
        expect(page.locator("text=8h Window Valid")).to_be_visible()

        # Fill farmer details
        page.fill("input[placeholder='Farmer Name']", "Devi Prasad Sharma")
        page.select_option("select", value="PLOT-PAL-101")

        # Set Gross and Tare weights
        gross_input = page.locator("input[type='number']").nth(0)
        tare_input = page.locator("input[type='number']").nth(1)

        gross_input.fill("80.0")
        tare_input.fill("3.0")

        # Verify Net weight calculation: 80 - 3 = 77.00 kg
        expect(page.locator("text=77.00 kg")).to_be_visible()

        # Submit to local journal
        page.click("button:has-text('Record Intake (Save Locally)')")

        # Verify local journal entry appears
        expect(page.locator("text=Devi Prasad Sharma — PLOT-PAL-101")).to_be_visible()

        browser.close()

def test_frontend_cadastral_map_and_provenance_pages():
    """Test cadastral map loads and consumer provenance loads with correct batch info."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Test Cadastral Map
        page.goto(f"{FRONTEND_URL}/traceability/map", wait_until="networkidle")
        expect(page.locator("text=Cadastral & EUDR Provenance Mapping")).to_be_visible()
        expect(page.locator("text=Compliant (4 Plots)")).to_be_visible()
        
        # Verify sidebar attributes
        expect(page.locator("h3:has-text('PLOT-GUL-042')")).to_be_visible()
        expect(page.locator("text=Sita Gurung")).to_be_visible()
        expect(page.locator("text=1450 MASL")).to_be_visible()

        # 2. Test Consumer Provenance GS1 Story
        page.goto(f"{FRONTEND_URL}/t/PK-2083-0459", wait_until="networkidle")
        expect(page.locator("h1:has-text('Ximalaya Single Origin')")).to_be_visible()
        expect(page.locator("text=Sita Gurung in Gulmi, Nepal")).to_be_visible()
        expect(page.locator("text=Rs 108.00 / kg")).to_be_visible()
        expect(page.locator("text=PLOT-GUL-042")).to_be_visible()

        browser.close()
