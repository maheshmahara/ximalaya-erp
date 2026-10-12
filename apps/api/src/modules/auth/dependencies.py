import json
from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from apps.api.src.core.database import get_db_session
from apps.api.src.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

ROLE_HIERARCHY = {
    "OPERATOR": 1,
    "MANAGER": 2,
    "ADMIN": 3
}


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    query = text("SELECT id, email, full_name, role, is_active FROM users WHERE id = :id AND is_active = true LIMIT 1;")
    res = await db.execute(query, {"id": user_id})
    user = res.mappings().first()
    if not user:
        raise credentials_exception

    return dict(user)


def require_role(min_role: str):
    """
    Enforces minimum role privilege based on ROLE_HIERARCHY.
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_level = ROLE_HIERARCHY.get(current_user["role"], 0)
        required_level = ROLE_HIERARCHY.get(min_role, 99)
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires minimum {min_role} privilege"
            )
        return current_user
    return role_checker


class AuditLogger:
    @staticmethod
    async def log_action(
        db: AsyncSession,
        request: Request,
        user: dict,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        payload: Optional[dict] = None
    ):
        ip = request.client.host if request.client else "unknown"
        ua = request.headers.get("user-agent", "unknown")
        
        query = text("""
            INSERT INTO audit_logs (
                user_id, user_email, role, action, resource_type, resource_id, ip_address, user_agent, payload
            ) VALUES (
                :user_id, :user_email, :role, :action, :resource_type, :resource_id, :ip_address, :user_agent, :payload
            );
        """)
        await db.execute(query, {
            "user_id": user["id"],
            "user_email": user["email"],
            "role": user["role"],
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "ip_address": ip,
            "user_agent": ua,
            "payload": json.dumps(payload or {})
        })
        await db.commit()
