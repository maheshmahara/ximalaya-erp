import os
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ximalaya-super-secret-production-key-2083-change-in-env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12  # 12-hour operator shift

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


ROLE_HIERARCHY = {
    "OPERATOR": 1,
    "MANAGER": 2,
    "ADMIN": 3
}


class RoleChecker:
    """
    Dependency checking whether user meets minimum role requirement or matches allowed roles.
    """
    def __init__(self, allowed_roles: List[str] | str):
        if isinstance(allowed_roles, str):
            self.allowed_roles = [allowed_roles]
        else:
            self.allowed_roles = allowed_roles

    def __call__(self, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            role: str = payload.get("role")
            if user_id is None or role is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        user_level = ROLE_HIERARCHY.get(role, 0)
        # Check either direct match or hierarchical minimum
        min_required = min([ROLE_HIERARCHY.get(r, 99) for r in self.allowed_roles]) if self.allowed_roles else 0

        if role not in self.allowed_roles and user_level < min_required:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {self.allowed_roles}"
            )

        return {"user_id": user_id, "role": role, "email": payload.get("email")}
