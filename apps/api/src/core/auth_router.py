from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from apps.api.src.core.database import get_db_session
from apps.api.src.core.security import create_access_token, verify_password, RoleChecker

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str
    full_name: str


@router.post("/token", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    identifier = (req.email or req.username or "").strip().lower()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is required"
        )

    # 1. Check PostgreSQL users table
    query = text("""
        SELECT id, email, hashed_password, full_name, role, is_active 
        FROM users 
        WHERE LOWER(email) = :ident 
        LIMIT 1;
    """)
    res = await db.execute(query, {"ident": identifier})
    user = res.mappings().first()

    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    # 2. Update last login
    await db.execute(
        text("UPDATE users SET last_login_at = :now WHERE id = :id;"),
        {"now": datetime.now(timezone.utc), "id": user["id"]}
    )

    # 3. Record audit trail
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "unknown")
    try:
        await db.execute(
            text("""
                INSERT INTO audit_logs (
                    user_id, user_email, role, action, resource_type, resource_id, ip_address, user_agent, payload
                ) VALUES (
                    :uid, :email, :role, 'AUTH_LOGIN_SUCCESS', 'SESSION', :uid_str, :ip, :ua, '{}'::jsonb
                );
            """),
            {
                "uid": user["id"],
                "email": user["email"],
                "role": str(user["role"]),
                "uid_str": str(user["id"]),
                "ip": ip,
                "ua": ua
            }
        )
    except Exception:
        pass  # Continue if audit log table is unavailable

    await db.commit()

    token = create_access_token({
        "sub": str(user["id"]),
        "role": str(user["role"]),
        "email": user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": str(user["role"]),
        "email": user["email"],
        "full_name": user["full_name"]
    }


@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(RoleChecker(["MANAGER", "ADMIN"])),
    db: AsyncSession = Depends(get_db_session)
):
    query = text("""
        SELECT id, user_email, role, action, resource_type, resource_id, ip_address, created_at, payload
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT :limit;
    """)
    res = await db.execute(query, {"limit": limit})
    rows = [dict(r) for r in res.mappings().all()]
    return {"count": len(rows), "logs": rows}
