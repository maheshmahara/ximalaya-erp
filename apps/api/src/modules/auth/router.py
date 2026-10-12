from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from apps.api.src.core.database import get_db_session
from apps.api.src.core.security import create_access_token, verify_password, hash_password
from apps.api.src.modules.auth.dependencies import get_current_user, require_role, AuditLogger

router = APIRouter(prefix="/auth", tags=["Identity, RBAC & Audit Trails"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str
    full_name: str


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "OPERATOR"


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_session)
):
    query = text("SELECT id, email, hashed_password, full_name, role, is_active FROM users WHERE email = :email LIMIT 1;")
    res = await db.execute(query, {"email": form_data.username.lower()})
    user = res.mappings().first()

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login
    await db.execute(
        text("UPDATE users SET last_login_at = :now WHERE id = :id;"),
        {"now": datetime.now(timezone.utc), "id": user["id"]}
    )
    await db.commit()

    # Log successful authentication
    user_dict = dict(user)
    await AuditLogger.log_action(
        db=db,
        request=request,
        user=user_dict,
        action="AUTH_LOGIN_SUCCESS",
        resource_type="USER_SESSION",
        resource_id=str(user["id"])
    )

    token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "email": user["email"],
        "full_name": user["full_name"]
    }


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["id"]),
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"]
    }


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    req: UserCreateRequest,
    request: Request,
    current_user: dict = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db_session)
):
    if req.role not in ("OPERATOR", "MANAGER", "ADMIN"):
        raise HTTPException(status_code=400, detail="Invalid role specified")

    hashed = hash_password(req.password)
    query = text("""
        INSERT INTO users (email, hashed_password, full_name, role)
        VALUES (:email, :hashed, :name, :role::user_role)
        RETURNING id, email, full_name, role, created_at;
    """)
    try:
        res = await db.execute(query, {
            "email": req.email.lower(),
            "hashed": hashed,
            "name": req.full_name,
            "role": req.role
        })
        new_user = res.mappings().first()
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="User with this email already exists")

    await AuditLogger.log_action(
        db=db,
        request=request,
        user=current_user,
        action="USER_CREATED",
        resource_type="USER",
        resource_id=str(new_user["id"]),
        payload={"created_email": req.email, "role": req.role}
    )

    return dict(new_user)


@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    current_user: dict = Depends(require_role("MANAGER")),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Managers and Admins can query chronological audit trails.
    """
    base_query = "SELECT id, user_email, role, action, resource_type, resource_id, ip_address, created_at, payload FROM audit_logs"
    params = {"limit": limit}
    if action:
        base_query += " WHERE action = :action"
        params["action"] = action
    base_query += " ORDER BY created_at DESC LIMIT :limit;"

    res = await db.execute(text(base_query), params)
    rows = [dict(r) for r in res.mappings().all()]
    return {"count": len(rows), "logs": rows}
