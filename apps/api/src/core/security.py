import hmac
import hashlib
import base64
import json
import time
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "ximalaya-specialty-coffee-erp-super-secret-jwt-key"

security = HTTPBearer()

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(user_id: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed HS256 JWT token using Python standard library."""
    header = {"alg": "HS256", "typ": "JWT"}
    
    if expires_delta:
        exp = int((datetime.now(timezone.utc) + expires_delta).timestamp())
    else:
        exp = int((datetime.now(timezone.utc) + timedelta(hours=12)).timestamp())

    payload = {
        "sub": user_id,
        "role": role,
        "exp": exp,
        "iat": int(datetime.now(timezone.utc).timestamp())
    }

    hdr_b64 = _b64_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    pay_b64 = _b64_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{hdr_b64}.{pay_b64}".encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    sig_b64 = _b64_encode(signature)
    return f"{hdr_b64}.{pay_b64}.{sig_b64}"

def decode_token(token: str) -> dict:
    """Validate signature and decode claims."""
    parts = token.split('.')
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token structure"
        )
    
    hdr_b64, pay_b64, sig_b64 = parts
    
    # Verify cryptographic signature
    expected_sig = hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{hdr_b64}.{pay_b64}".encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    if not hmac.compare_digest(_b64_encode(expected_sig), sig_b64):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature"
        )
    
    payload = json.loads(_b64_decode(pay_b64).decode('utf-8'))
    
    # Check expiration
    if payload.get("exp") and time.time() > payload["exp"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired"
        )
    
    return payload

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
        token_data = decode_token(credentials.credentials)
        user_role = token_data.get("role")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {self.allowed_roles}, Current role: {user_role}"
            )
        return token_data
