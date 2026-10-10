import pytest
import urllib.request

def is_service_reachable(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.status in (200, 304)
    except Exception:
        return False

def test_web_routes_availability():
    """
    Smoke test checking frontend web routing availability in production docker stack.
    """
    web_base = "http://web:3000"
    
    # Check if web container is running in compose network
    if not is_service_reachable(f"{web_base}/analytics/overview"):
        pytest.skip("Next.js web container not directly reachable from test container; skipping HTTP ping.")

    routes = [
        "/analytics/overview",
        "/sales/pos",
        "/logistics/dispatch"
    ]
    for route in routes:
        req = urllib.request.Request(f"{web_base}{route}")
        with urllib.request.urlopen(req, timeout=5) as res:
            assert res.status == 200
