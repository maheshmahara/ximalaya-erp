import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

def test_dispatch_manifest_pdf_endpoint():
    client = TestClient(app)
    res = client.get("/logistics/dispatch/DSP-2083-0042/manifest.pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert b"%PDF" in res.content
