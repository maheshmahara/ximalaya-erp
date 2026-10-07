import pytest
from apps.api.src.core.security import create_access_token, decode_token, RoleChecker
from fastapi import HTTPException

def test_jwt_generation_and_decoding():
    token = create_access_token(user_id="agent_gulmi", role="FIELD_AGENT")
    claims = decode_token(token)
    assert claims["sub"] == "agent_gulmi"
    assert claims["role"] == "FIELD_AGENT"

def test_rbac_permission_allowed():
    token = create_access_token(user_id="lead_cpa", role="ACCOUNTANT")
    claims = decode_token(token)
    
    # Class mock representing FastAPI credentials container
    class MockCreds:
        credentials = token

    checker = RoleChecker(allowed_roles=["ADMIN", "ACCOUNTANT"])
    verified = checker(MockCreds())
    assert verified["role"] == "ACCOUNTANT"

def test_rbac_permission_denied():
    token = create_access_token(user_id="field_worker", role="FIELD_AGENT")
    
    class MockCreds:
        credentials = token

    checker = RoleChecker(allowed_roles=["ADMIN", "ACCOUNTANT"])
    with pytest.raises(HTTPException) as exc_info:
        checker(MockCreds())
    
    assert exc_info.value.status_code == 403
    assert "Operation not permitted" in exc_info.value.detail
