#!/usr/bin/env python3
"""
Seeds default administrative and warehouse operational accounts.
"""
import os
import re
import sys
import psycopg2
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

RAW_DB_URL = os.getenv("DATABASE_URL", "postgresql://xcc_admin:xcc_dev_pass_2083@postgres:5432/ximalaya_erp")
DB_URL = re.sub(r"^postgresql\+[a-zA-Z0-9_-]+://", "postgresql://", RAW_DB_URL)

USERS = [
    {
        "email": "admin@ximalayacoffee.com",
        "password": "AdminProductionPass_2083!",
        "full_name": "System Administrator",
        "role": "ADMIN"
    },
    {
        "email": "manager.ruru@ximalayacoffee.com",
        "password": "ManagerPass_2083!",
        "full_name": "Anil Gurung (Estate Manager)",
        "role": "MANAGER"
    },
    {
        "email": "operator.wh1@ximalayacoffee.com",
        "password": "OperatorPass_2083!",
        "full_name": "Deepak Shrestha (Warehouse Operator)",
        "role": "OPERATOR"
    }
]

def seed_users():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        for u in USERS:
            hashed = pwd_context.hash(u["password"])
            cur.execute("""
                INSERT INTO users (email, hashed_password, full_name, role)
                VALUES (%s, %s, %s, %s::user_role)
                ON CONFLICT (email) DO UPDATE 
                SET hashed_password = EXCLUDED.hashed_password,
                    role = EXCLUDED.role;
            """, (u["email"], hashed, u["full_name"], u["role"]))
            print(f"[✓] User ready: {u['email']} [{u['role']}]")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_users()
