"""Create the admin account and load the dummy sample content.

Run after schema.sql:   python seed.py
Safe to run again: it only fills empty tables. An existing admin password is kept unless ADMIN_PASSWORD is set.
"""
import getpass
import json
import os

from werkzeug.security import generate_password_hash

from config import RESOURCES
from db import execute, query

username = os.getenv("ADMIN_USERNAME", "admin")
password = os.getenv("ADMIN_PASSWORD")
existing = query("SELECT id FROM users WHERE username=%s", (username,), one=True)

if existing and not password:
    print(f"Admin account '{username}' already exists. Password unchanged.")
else:
    if not password:
        password = getpass.getpass(f"Choose a password for '{username}' (min 8 characters): ")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")
    execute(
        "INSERT INTO users (username, password_hash) VALUES (%s, %s) "
        "ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)",
        (username, generate_password_hash(password)),
    )
    print(f"Admin account '{username}' is ready.")

with open(os.path.join(os.path.dirname(__file__), "seed_data.json"), encoding="utf-8") as fh:
    seed = json.load(fh)


def id_map(table):
    return {r["name"]: r["id"] for r in query(f"SELECT id, name FROM {table}")}


def prepare(table, row):
    """Turn names in the seed file into database ids."""
    if table == "units":
        ids = id_map("contacts")
        found = [str(ids[n]) for n in row.get("trainers", []) if n in ids]
        row = {**row, "trainer_ids": ",".join(found) or None}
    if table == "guides":
        contacts, forms = id_map("contacts"), id_map("forms")
        row = {**row, "contact_id": contacts.get(row.get("contact")), "form_id": forms.get(row.get("form"))}
    return row


for table, cols in RESOURCES.items():
    if query(f"SELECT COUNT(*) AS n FROM {table}", one=True)["n"] > 0:
        print(f"{table}: already has data, skipped")
        continue
    col_sql = ", ".join(f"`{c}`" for c in cols)
    marks = ", ".join(["%s"] * len(cols))
    for row in seed.get(table, []):
        row = prepare(table, row)
        execute(f"INSERT INTO {table} ({col_sql}) VALUES ({marks})", tuple(row.get(c) for c in cols))
    print(f"{table}: added {len(seed.get(table, []))} sample rows")
