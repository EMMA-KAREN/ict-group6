"""API smoke test for the KSTVET portal (Flask + MySQL).

Run with the Flask server already running:
    python tests/api_smoke_test.py | tee api_test_results.txt

It logs in as the admin, creates TEST data, checks the results and deletes the test notice.
The test complaint is deleted at the end; test request and subscriber rows stay in the database.
"""
import getpass
import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.getenv("API_URL", "http://localhost:5000/api")
USER = os.getenv("ADMIN_USERNAME", "admin")
PASSWORD = os.getenv("ADMIN_PASSWORD") or getpass.getpass(f"Password for admin '{USER}': ")


def call(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    if body is not None:
        req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw) if raw else None
        except ValueError:
            return e.code, raw
    except urllib.error.URLError:
        print("Cannot reach the API at", BASE, "- is Flask running?")
        sys.exit(1)


results = []


def check(name, ok, detail=""):
    results.append(ok)
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  ({detail})" if detail and not ok else ""))


print(f"API smoke test against {BASE}\n")

# --- public reading ---
for res in ("notices", "forms", "contacts", "faqs", "guides", "units", "fees", "course_requirements", "exam_timetable", "academic_calendar", "assignments"):
    s, d = call("GET", f"/{res}")
    check(f"GET /{res} returns a non-empty list", s == 200 and isinstance(d, list) and len(d) > 0, f"status {s}")
s, _ = call("GET", "/unknown")
check("GET /unknown returns 404", s == 404, f"status {s}")

# --- authentication and protection ---
s, _ = call("POST", "/notices", {"title": "x"})
check("POST /notices without a token is refused (401)", s == 401, f"status {s}")
s, _ = call("POST", "/login", {"username": USER, "password": "definitely-wrong"})
check("Login with a wrong password is refused (401)", s == 401, f"status {s}")
s, _ = call("POST", "/login", {"username": "x' OR '1'='1", "password": "x' OR '1'='1"})
check("Login with an SQL injection string is refused (401)", s == 401, f"status {s}")
s, d = call("POST", "/login", {"username": USER, "password": PASSWORD})
token = d.get("token") if s == 200 and isinstance(d, dict) else None
check("Login with the correct password returns a token", bool(token), f"status {s}")
if not token:
    print("\nCannot continue without a token.")
    sys.exit(1)

# --- admin create, validate, update, delete ---
note = {"title": "TEST notice", "department": "ICT", "type": "Notice", "date": "2026-10-20", "body": "Created by the smoke test."}
s, d = call("POST", "/notices", note, token)
new_id = d.get("id") if s == 201 and isinstance(d, dict) else None
check("POST /notices with a token creates a notice (201)", new_id is not None, f"status {s}")

s, _ = call("POST", "/notices", {"department": "ICT"}, token)
check("POST /notices with missing fields is rejected (400)", s == 400, f"status {s}")

if new_id:
    note["title"] = "TEST notice (edited)"
    s, d = call("PUT", f"/notices/{new_id}", note, token)
    check("PUT /notices/<id> updates the notice", s == 200 and d.get("title") == note["title"], f"status {s}")
    s, d = call("GET", "/notices")
    check("Edited notice appears in GET /notices", any(n["id"] == new_id and n["title"] == note["title"] for n in d))
    s, _ = call("DELETE", f"/notices/{new_id}", token=token)
    check("DELETE /notices/<id> removes the notice (204)", s == 204, f"status {s}")
    s, d = call("GET", "/notices")
    check("Deleted notice no longer appears", not any(n["id"] == new_id for n in d))

# --- guides (optional fields may be left empty) ---
s, d = call("POST", "/guides", {"section": "mess", "issue": "TEST guide", "steps": "Step one\nStep two"}, token)
gid = d.get("id") if s == 201 and isinstance(d, dict) else None
check("POST /guides with optional fields left empty creates a guide", gid is not None and d.get("contact_id") is None, f"status {s}")
if gid:
    s, _ = call("DELETE", f"/guides/{gid}", token=token)
    check("DELETE /guides/<id> removes the test guide (204)", s == 204, f"status {s}")

# --- email to subscribers (validation only: the test never sends real emails) ---
s, _ = call("POST", "/admin/notify", {"subject": "x", "message": "y"})
check("POST /admin/notify without a token is refused (401)", s == 401, f"status {s}")
s, _ = call("POST", "/admin/notify", {"subject": "only a subject"}, token)
check("POST /admin/notify without a message is rejected (400)", s == 400, f"status {s}")
s, d = call("GET", "/admin/mail-status", token=token)
check("GET /admin/mail-status returns the mail set-up status", s == 200 and isinstance(d, dict) and "configured" in d, f"status {s}")
s, _ = call("GET", "/unsubscribe?t=not-a-real-token")
check("An invalid unsubscribe link is rejected (400)", s == 400, f"status {s}")

# --- public form submissions ---
s, d = call("POST", "/complaints", {"email": "test@example.com", "department": "Not sure", "subject": "TEST", "message": "Test complaint from smoke test"})
check("POST /complaints returns a CMP reference", s == 201 and str(d.get("ref", "")).startswith("CMP-"), f"status {s}")
check("Complaint with department 'Not sure' is routed to Student Affairs", isinstance(d, dict) and d.get("routed_to") == "Student Affairs")
cid = int(d["ref"].split("-")[1]) if s == 201 and isinstance(d, dict) and "ref" in d else None

# --- administrator inbox ---
s, _ = call("GET", "/admin/complaints")
check("GET /admin/complaints without a token is refused (401)", s == 401, f"status {s}")
s, lst = call("GET", "/admin/complaints", token=token)
check("Administrator can list complaints and the test complaint is there", s == 200 and isinstance(lst, list) and any(x["id"] == cid for x in lst), f"status {s}")
if cid:
    s, d2 = call("PUT", f"/admin/complaints/{cid}/status", {"status": "In progress", "notify": False}, token)
    check("Administrator can set a complaint to 'In progress'", s == 200 and d2["item"]["status"] == "In progress", f"status {s}")
    s, d3 = call("GET", f"/track?ref=CMP-{cid:06d}&email=test@example.com")
    check("A student can track the complaint with the reference and email", s == 200 and d3.get("status") == "In progress", f"status {s}")
    s, _ = call("GET", f"/track?ref=CMP-{cid:06d}&email=someone.else@example.com")
    check("Tracking with a different email is refused (404)", s == 404, f"status {s}")
    s, _ = call("PUT", f"/admin/complaints/{cid}/status", {"status": "Bogus"}, token)
    check("An invalid complaint status is rejected (400)", s == 400, f"status {s}")
    s, _ = call("DELETE", f"/admin/complaints/{cid}", token=token)
    check("Administrator can delete the test complaint (204)", s == 204, f"status {s}")
    s, lst = call("GET", "/admin/complaints", token=token)
    check("Deleted complaint no longer appears", isinstance(lst, list) and not any(x["id"] == cid for x in lst))

s, _ = call("POST", "/complaints", {"email": "not-an-email", "department": "ICT", "subject": "TEST", "message": "Test complaint"})
check("Complaint with an invalid email is rejected (400)", s == 400, f"status {s}")
s, d = call("POST", "/requests", {"email": "test@example.com", "type": "Other", "details": "Test request from smoke test"})
check("POST /requests returns a REQ reference", s == 201 and str(d.get("ref", "")).startswith("REQ-"), f"status {s}")
s, _ = call("POST", "/subscribers", {"email": "test.subscriber@example.com"})
check("POST /subscribers accepts a valid email (201)", s == 201, f"status {s}")
s, _ = call("POST", "/subscribers", {"email": "test.subscriber@example.com"})
check("Subscribing the same email twice does not fail", s == 201, f"status {s}")
s, _ = call("POST", "/subscribers", {"email": "bad"})
check("POST /subscribers with an invalid email is rejected (400)", s == 400, f"status {s}")

passed = sum(results)
print(f"\nSummary: {passed} of {len(results)} checks passed ({round(100 * passed / len(results))}%)")
sys.exit(0 if passed == len(results) else 1)
