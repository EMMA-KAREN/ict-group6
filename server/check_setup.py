"""Shows how many rows each table has and warns about common set-up mistakes.
Run:  python check_setup.py
"""
import json
import os

from config import RESOURCES
from db import query

print("Rows in each table:\n")
empty = []
for table in list(RESOURCES) + ["users", "complaints", "requests", "subscribers", "form_files"]:
    try:
        n = query(f"SELECT COUNT(*) AS n FROM {table}", one=True)["n"]
    except Exception as err:  # table missing
        print(f"  {table:22} MISSING  ({err.args[-1] if err.args else err})")
        empty.append(table)
        continue
    print(f"  {table:22} {n}")
    if n == 0 and table in RESOURCES:
        empty.append(table)

seed_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data.json")
with open(seed_file, encoding="utf-8") as fh:
    seed = json.load(fh)
missing_keys = [t for t in RESOURCES if t not in seed]

print()
if missing_keys:
    print("PROBLEM: seed_data.json is the OLD file (it has no data for: " + ", ".join(missing_keys) + ").")
    print("Copy the new server/seed_data.json from the latest zip, then run: python seed.py")
elif empty:
    print("Some tables are empty or missing: " + ", ".join(empty))
    print("Run:  mysql -u portal_user -p portal_db < schema.sql   and then   python seed.py")
else:
    print("Everything looks fine.")
