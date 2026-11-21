import os

import pymysql
from dotenv import load_dotenv
from pymysql.cursors import DictCursor

load_dotenv()


def get_conn():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "portal_db"),
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
        ssl={"ca": os.getenv("DB_SSL_CA")} if os.getenv("DB_SSL_CA") else None,
    )


def query(sql, params=(), one=False):
    """Run a SELECT. Always pass user values through params, never inside the SQL string."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        if one:
            return rows[0] if rows else None
        return rows
    finally:
        conn.close()


def execute(sql, params=()):
    """Run INSERT / UPDATE / DELETE. Returns the new row id for inserts."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.lastrowid
    finally:
        conn.close()
