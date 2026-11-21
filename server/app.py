import datetime
import os
import re
import uuid

import pymysql
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.security import check_password_hash

load_dotenv()

from config import DATE_FIELDS, INBOX, INT_FIELDS, OPTIONAL, ORDER, RESOURCES  # noqa: E402
from db import execute, query  # noqa: E402
from files import ALLOWED_TYPES, UPLOAD_DIR, delete_files, looks_like, make_preview  # noqa: E402
from mailer import (  # noqa: E402
    build_weekly_recap, email_from_token, notify_received, notify_status, notify_welcome,
    send_to_subscribers, smtp_configured,
)

secret = os.getenv("JWT_SECRET_KEY")
if not secret:
    raise RuntimeError("JWT_SECRET_KEY is missing. Copy .env.example to .env and set it.")

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=8)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB upload limit
CORS(app, origins=os.getenv("CORS_ORIGIN", "http://localhost:5173").split(","))
JWTManager(app)


# ---------- helpers ----------
def clean(row):
    """Turn dates into 'YYYY-MM-DD' strings so React date inputs can use them."""
    if row is None:
        return None
    return {
        k: (v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v)
        for k, v in row.items()
    }


def need(data, fields):
    """Return ({field: value}, None) or (None, 'error message') if a field is missing."""
    values = {}
    for f in fields:
        v = data.get(f)
        if v is None or str(v).strip() == "":
            return None, f"'{f}' is required"
        values[f] = str(v).strip()
    return values, None


def bad(message, code=400):
    return jsonify(error=message), code


def collect(resource, data):
    """Read, check and clean the fields of one content record. Returns ({column: value}, None) or (None, error)."""
    values = {}
    optional = OPTIONAL.get(resource, set())
    for f in RESOURCES[resource]:
        v = data.get(f)
        v = None if v is None or str(v).strip() == "" else str(v).strip()
        if v is None:
            if f in optional:
                values[f] = None
                continue
            return None, f"'{f}' is required"
        if f in INT_FIELDS:
            try:
                v = int(v)
            except ValueError:
                return None, f"'{f}' must be a number"
        if f in DATE_FIELDS:
            try:
                datetime.date.fromisoformat(v)
            except ValueError:
                return None, f"'{f}' must be a date like 2026-10-31"
        values[f] = v
    return values, None


FORMS_SELECT = (
    "SELECT f.*, ff.original_name AS file_name, (ff.id IS NOT NULL) AS has_file, "
    "(ff.preview_name IS NOT NULL) AS has_preview "
    "FROM forms f LEFT JOIN form_files ff ON ff.form_id = f.id"
)


def select_all(resource):
    if resource == "forms":
        return query(FORMS_SELECT + " ORDER BY f.id")
    return query(f"SELECT * FROM {resource} ORDER BY {ORDER[resource]}")


def select_one(resource, item_id):
    if resource == "forms":
        return query(FORMS_SELECT + " WHERE f.id=%s", (item_id,), one=True)
    return query(f"SELECT * FROM {resource} WHERE id=%s", (item_id,), one=True)


def remove_form_files(form_id):
    old = query("SELECT * FROM form_files WHERE form_id=%s", (form_id,), one=True)
    if old:
        delete_files(old["stored_name"], old["preview_name"])
        execute("DELETE FROM form_files WHERE form_id=%s", (form_id,))


@app.errorhandler(RequestEntityTooLarge)
def too_large(err):
    return bad("The file is too large (the limit is 10 MB).", 413)


@app.errorhandler(pymysql.IntegrityError)
def integrity_error(err):
    app.logger.warning(err)
    return bad("That value refers to something that does not exist.", 400)


@app.errorhandler(pymysql.MySQLError)
def db_error(err):
    app.logger.exception(err)
    return bad("Database error. Check the server log.", 500)


# ---------- auth ----------
@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    user = query("SELECT * FROM users WHERE username=%s", (data.get("username", ""),), one=True)
    if not user or not check_password_hash(user["password_hash"], data.get("password", "")):
        return bad("Wrong username or password.", 401)
    return jsonify(token=create_access_token(identity=user["username"]))


# ---------- public form submissions ----------
@app.post("/api/complaints")
def create_complaint():
    data = request.get_json(silent=True) or {}
    v, err = need(data, ["email", "department", "subject", "message"])
    if err:
        return bad(err)
    if "@" not in v["email"]:
        return bad("Enter a valid email.")
    routed = "Student Affairs" if v["department"] == "Not sure" else v["department"]
    new_id = execute(
        "INSERT INTO complaints (email, department, routed_to, subject, message) VALUES (%s,%s,%s,%s,%s)",
        (v["email"], v["department"], routed, v["subject"], v["message"]),
    )
    notify_received("complaints", {"id": new_id, "email": v["email"], "subject": v["subject"], "routed_to": routed, "status": "New"})
    return jsonify(ref=f"CMP-{new_id:06d}", routed_to=routed), 201


@app.post("/api/requests")
def create_request():
    data = request.get_json(silent=True) or {}
    v, err = need(data, ["email", "type", "details"])
    if err:
        return bad(err)
    if "@" not in v["email"]:
        return bad("Enter a valid email.")
    new_id = execute(
        "INSERT INTO requests (email, `type`, details) VALUES (%s,%s,%s)",
        (v["email"], v["type"], v["details"]),
    )
    notify_received("requests", {"id": new_id, "email": v["email"], "type": v["type"], "status": "New"})
    return jsonify(ref=f"REQ-{new_id:06d}"), 201


@app.post("/api/subscribers")
def subscribe():
    data = request.get_json(silent=True) or {}
    v, err = need(data, ["email"])
    if err or "@" not in v["email"]:
        return bad("Enter a valid email.")
    is_new = not query("SELECT id FROM subscribers WHERE email=%s", (v["email"],), one=True)
    execute("INSERT INTO subscribers (email) VALUES (%s) ON DUPLICATE KEY UPDATE email=email", (v["email"],))
    if is_new:
        notify_welcome(v["email"])
    return jsonify(ok=True), 201


# ---------- content: anyone can read, only admins can change ----------
@app.get("/api/<resource>")
def list_items(resource):
    if resource not in RESOURCES:
        return bad("Not found", 404)
    rows = select_all(resource)
    return jsonify([clean(r) for r in rows])


@app.post("/api/<resource>")
@jwt_required()
def create_item(resource):
    if resource not in RESOURCES:
        return bad("Not found", 404)
    values, err = collect(resource, request.get_json(silent=True) or {})
    if err:
        return bad(err)
    cols = ", ".join(f"`{c}`" for c in values)
    marks = ", ".join(["%s"] * len(values))
    new_id = execute(f"INSERT INTO {resource} ({cols}) VALUES ({marks})", tuple(values.values()))
    row = select_one(resource, new_id)
    return jsonify(clean(row)), 201


@app.put("/api/<resource>/<int:item_id>")
@jwt_required()
def update_item(resource, item_id):
    if resource not in RESOURCES:
        return bad("Not found", 404)
    if not query(f"SELECT id FROM {resource} WHERE id=%s", (item_id,), one=True):
        return bad("Not found", 404)
    values, err = collect(resource, request.get_json(silent=True) or {})
    if err:
        return bad(err)
    sets = ", ".join(f"`{c}`=%s" for c in values)
    execute(f"UPDATE {resource} SET {sets} WHERE id=%s", (*values.values(), item_id))
    row = select_one(resource, item_id)
    return jsonify(clean(row))


@app.delete("/api/<resource>/<int:item_id>")
@jwt_required()
def delete_item(resource, item_id):
    if resource not in RESOURCES:
        return bad("Not found", 404)
    if resource == "forms":
        remove_form_files(item_id)
    execute(f"DELETE FROM {resource} WHERE id=%s", (item_id,))
    return "", 204


# ---------- admin inbox: complaints, requests, subscribers ----------
@app.get("/api/admin/<inbox>")
@jwt_required()
def inbox_list(inbox):
    if inbox not in INBOX:
        return bad("Not found", 404)
    rows = query(f"SELECT * FROM {inbox} ORDER BY id DESC")
    return jsonify([clean(r) for r in rows])


@app.put("/api/admin/<inbox>/<int:item_id>/status")
@jwt_required()
def inbox_status(inbox, item_id):
    if inbox not in INBOX or not INBOX[inbox]:
        return bad("Not found", 404)
    body = request.get_json(silent=True) or {}
    status = body.get("status")
    if status not in INBOX[inbox]:
        return bad("Invalid status")
    old = query(f"SELECT * FROM {inbox} WHERE id=%s", (item_id,), one=True)
    if not old:
        return bad("Not found", 404)
    execute(f"UPDATE {inbox} SET status=%s WHERE id=%s", (status, item_id))
    row = query(f"SELECT * FROM {inbox} WHERE id=%s", (item_id,), one=True)
    email = None
    if body.get("notify", True) and old["status"] != status:
        email = notify_status(inbox, row)
    return jsonify(item=clean(row), email=email)


@app.delete("/api/admin/<inbox>/<int:item_id>")
@jwt_required()
def inbox_delete(inbox, item_id):
    if inbox not in INBOX:
        return bad("Not found", 404)
    execute(f"DELETE FROM {inbox} WHERE id=%s", (item_id,))
    return "", 204


# ---------- email to subscribers ----------
@app.get("/api/admin/mail-status")
@jwt_required()
def mail_status():
    n = query("SELECT COUNT(*) AS n FROM subscribers", one=True)["n"]
    return jsonify(configured=smtp_configured(), subscribers=n)


@app.post("/api/admin/notify")
@jwt_required()
def notify():
    v, err = need(request.get_json(silent=True) or {}, ["subject", "message"])
    if err:
        return bad(err)
    try:
        return jsonify(send_to_subscribers(v["subject"], v["message"]))
    except RuntimeError as e:
        return bad(str(e), 502)


@app.post("/api/admin/notify/weekly")
@jwt_required()
def notify_weekly():
    recap = build_weekly_recap()
    if recap is None:
        return jsonify(recipients=0, sent=0, failed=0, dry_run=not smtp_configured(), nothing_to_send=True)
    try:
        return jsonify(send_to_subscribers(*recap))
    except RuntimeError as e:
        return bad(str(e), 502)


@app.get("/api/unsubscribe")
def unsubscribe():
    email = email_from_token(request.args.get("t", ""))
    if not email:
        return "<h3>This unsubscribe link is not valid.</h3>", 400
    execute("DELETE FROM subscribers WHERE email=%s", (email,))
    return "<h3>You have been unsubscribed from KSTVET Student Portal emails.</h3>"


# ---------- form files: upload (admin), download and view (everyone) ----------
@app.post("/api/admin/forms/<int:form_id>/file")
@jwt_required()
def upload_form_file(form_id):
    if not query("SELECT id FROM forms WHERE id=%s", (form_id,), one=True):
        return bad("Not found", 404)
    f = request.files.get("file")
    if not f or not f.filename:
        return bad("Choose a file to upload.")
    original = os.path.basename(f.filename)[:200]
    ext = os.path.splitext(original)[1].lower()
    if ext not in ALLOWED_TYPES:
        return bad("Only PDF, DOC and DOCX files are allowed.")
    head = f.stream.read(8)
    f.stream.seek(0)
    if not looks_like(ext, head):
        return bad(f"This does not look like a real {ext[1:].upper()} file.")

    stored = uuid.uuid4().hex + ext
    path = os.path.join(UPLOAD_DIR, stored)
    f.save(path)
    preview = stored if ext == ".pdf" else make_preview(path)

    remove_form_files(form_id)
    execute(
        "INSERT INTO form_files (form_id, original_name, stored_name, preview_name, mime, size) VALUES (%s,%s,%s,%s,%s,%s)",
        (form_id, original, stored, preview, ALLOWED_TYPES[ext], os.path.getsize(path)),
    )
    return jsonify(clean(select_one("forms", form_id)))


@app.delete("/api/admin/forms/<int:form_id>/file")
@jwt_required()
def delete_form_file(form_id):
    remove_form_files(form_id)
    return jsonify(clean(select_one("forms", form_id)))


@app.get("/api/forms/<int:form_id>/download")
def download_form(form_id):
    row = query("SELECT * FROM form_files WHERE form_id=%s", (form_id,), one=True)
    if not row:
        return bad("This form has no file yet.", 404)
    resp = send_from_directory(UPLOAD_DIR, row["stored_name"], as_attachment=True, download_name=row["original_name"], mimetype=row["mime"])
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp


@app.get("/api/forms/<int:form_id>/view")
def view_form(form_id):
    row = query("SELECT * FROM form_files WHERE form_id=%s", (form_id,), one=True)
    if not row or not row["preview_name"]:
        return bad("A preview is not available for this form.", 404)
    resp = send_from_directory(UPLOAD_DIR, row["preview_name"], mimetype="application/pdf")
    resp.headers["Content-Disposition"] = "inline"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp


# ---------- students track their own complaint or request ----------
@app.get("/api/track")
def track():
    ref = request.args.get("ref", "").strip().upper()
    email = request.args.get("email", "").strip().lower()
    m = re.fullmatch(r"(CMP|REQ)-(\d{1,9})", ref)
    if not m or "@" not in email:
        return bad("Enter the reference number and the email address you used.")
    table = "complaints" if m.group(1) == "CMP" else "requests"
    row = query(f"SELECT * FROM {table} WHERE id=%s AND LOWER(email)=%s", (int(m.group(2)), email), one=True)
    if not row:
        return bad("No match found. Check the reference number and the email address.", 404)
    return jsonify(
        ref=ref,
        kind="complaint" if table == "complaints" else "request",
        title=row.get("subject") or row.get("type"),
        routed_to=row.get("routed_to"),
        status=row["status"],
        created_at=clean(row)["created_at"],
    )

from flask import send_from_directory as _sfd
DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def spa(path):
    if path.startswith("api/"):
        return jsonify(error="Not found"), 404
    full = os.path.join(DIST, path)
    if path and os.path.isfile(full):
        return _sfd(DIST, path)
    return _sfd(DIST, "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
