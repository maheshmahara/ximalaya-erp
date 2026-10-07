from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from apps.api.src.core.security import create_access_token, RoleChecker

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    username: str
    password: str

DEMO_USERS = {
    "agent_gulmi": {"password": "password123", "role": "FIELD_AGENT"},
    "mill_operator": {"password": "password123", "role": "MILL_OPERATOR"},
    "roastmaster": {"password": "password123", "role": "ROASTMASTER"},
    "accountant": {"password": "password123", "role": "ACCOUNTANT"},
    "admin": {"password": "password123", "role": "ADMIN"}
}

@router.post("/token")
async def login(req: LoginRequest):
    user = DEMO_USERS.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    token = create_access_token(user_id=req.username, role=user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
    }

@router.get("/protected/finance-vault")
async def get_financial_vault(user=Depends(RoleChecker(["ADMIN", "ACCOUNTANT"]))):
    return {"message": "Access granted to financial ledger", "user": user}
