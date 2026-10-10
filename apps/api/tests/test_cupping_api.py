import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

def test_sca_cupping_specialty_grade():
    client = TestClient(app)
    payload = {
        "batch_id": "BATCH-ESP32-001",
        "cupper_name": "Q-Grader Mahesh",
        "fragrance_aroma": 8.75,
        "flavor": 8.75,
        "aftertaste": 8.50,
        "acidity": 8.75,
        "body": 8.25,
        "balance": 8.50,
        "overall": 8.75,
        "uniformity_cups": 5,
        "clean_cup_cups": 5,
        "sweetness_cups": 5,
        "flavor_notes": ["Apricot", "Orange Blossom", "Raw Cane Sugar"]
    }
    res = client.post("/roasting/cupping/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    eval_res = data["evaluation"]
    assert eval_res["total_score"] == 90.25
    assert eval_res["classification"] == "PRESIDENTIAL_SPECIALTY"
    assert eval_res["is_specialty"] is True

def test_sca_cupping_defect_deduction():
    client = TestClient(app)
    payload = {
        "batch_id": "BATCH-ESP32-002",
        "cupper_name": "Q-Grader Mahesh",
        "fragrance_aroma": 7.50,
        "flavor": 7.50,
        "aftertaste": 7.25,
        "acidity": 7.50,
        "body": 7.25,
        "balance": 7.50,
        "overall": 7.25,
        "uniformity_cups": 4, # 1 cup lost = 8 pts
        "clean_cup_cups": 4,   # 1 cup tainted
        "sweetness_cups": 5,
        "taints_count": 1,     # -2 pts
        "faults_count": 0
    }
    res = client.post("/roasting/cupping/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    eval_res = data["evaluation"]
    assert eval_res["defect_deduction"] == 2.0
    assert eval_res["total_score"] < 80.0
    assert eval_res["classification"] == "BELOW_SPECIALTY_COMMERCIAL"
    assert eval_res["is_specialty"] is False
