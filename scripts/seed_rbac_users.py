#!/usr/bin/env python3
"""
Seeds default administrative and warehouse operational accounts using native bcrypt.
"""
import os
import re
import sys
import uuid
import bcrypt
import psycopg2

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

def hash_pw(pw: str) -> str:
    pwd_bytes = pw.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")

def seed_users():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        for u in USERS:
            hashed = hash_pw(u["password"])
            cur.execute("""
                INSERT INTO users (email, hashed_password, full_name, role)
                VALUES (%s, %s, %s, %s::user_role)
                ON CONFLICT (email) DO UPDATE 
                SET hashed_password = EXCLUDED.hashed_password,
                    full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role;
            """, (u["email"], hashed, u["full_name"], u["role"]))
            print(f"[✓] User configured: {u['email']} [{u['role']}]")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_users()
