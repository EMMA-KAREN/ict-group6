"""Sends email to portal subscribers.

If SMTP is not configured in .env, nothing is sent: the message is printed in the
Flask terminal instead ("dry run"), so the feature can be demonstrated without a mail account.
"""
import os
import smtplib
import ssl
import threading
from email.message import EmailMessage

from itsdangerous import URLSafeSerializer

from db import query


def _serializer():
    return URLSafeSerializer(os.environ["JWT_SECRET_KEY"], salt="unsubscribe")


def unsubscribe_link(email):
    base = os.getenv("PUBLIC_API_URL", "http://localhost:5000").rstrip("/")
    return f"{base}/api/unsubscribe?t={_serializer().dumps(email)}"


def email_from_token(token):
    try:
        return _serializer().loads(token)
    except Exception:
        return None


def smtp_configured():
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))


def _connect():
    host = os.environ["SMTP_HOST"]
    port = int(os.getenv("SMTP_PORT", "587"))
    ctx = ssl.create_default_context()
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=20, context=ctx)
    else:
        server = smtplib.SMTP(host, port, timeout=20)
        server.starttls(context=ctx)
    server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
    return server


def _build(subject, body, to_email, sender):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email
    msg.set_content(
        f"{body}\n\n--\nKSTVET Student Portal\n"
        f"To stop receiving these emails, open: {unsubscribe_link(to_email)}\n"
    )
    return msg


def send_to_subscribers(subject, body):
    """Send one email per subscriber. Returns counts."""
    recipients = [r["email"] for r in query("SELECT email FROM subscribers ORDER BY id")]
    result = {"recipients": len(recipients), "sent": 0, "failed": 0, "dry_run": False}
    if not recipients:
        return result

    if not smtp_configured():
        result["dry_run"] = True
        print(f"\n[EMAIL NOT SENT - SMTP is not configured]\nSubject: {subject}\n{body}\nTo: {', '.join(recipients)}\n")
        return result

    sender = os.getenv("MAIL_FROM") or os.environ["SMTP_USER"]
    try:
        server = _connect()
    except (OSError, smtplib.SMTPException) as err:
        raise RuntimeError(f"Could not connect to the mail server: {err}")
    try:
        for to in recipients:
            try:
                server.send_message(_build(subject, body, to, sender))
                result["sent"] += 1
            except smtplib.SMTPException:
                result["failed"] += 1
    finally:
        try:
            server.quit()
        except Exception:
            pass
    return result


def build_weekly_recap():
    """Returns (subject, body) for notices of the last 7 days, or None if there are none."""
    rows = query(
        "SELECT title, department, `date` FROM notices "
        "WHERE `date` >= CURDATE() - INTERVAL 7 DAY ORDER BY `date` DESC, id DESC"
    )
    if not rows:
        return None
    lines = [f"- {r['title']} ({r['department']}, {r['date'].isoformat()})" for r in rows]
    body = "Notices from the last 7 days:\n\n" + "\n".join(lines) + "\n\nOpen the portal for the full details."
    return "KSTVET weekly recap", body


# ---------- single emails to one student ----------
RESERVED_DOMAINS = ("example.com", "example.net", "example.org")


def _reserved(email):
    """Reserved test addresses (RFC 2606) can never receive mail, so they are skipped."""
    domain = email.rsplit("@", 1)[-1].lower()
    return domain in RESERVED_DOMAINS or domain.endswith((".test", ".invalid", ".example", ".localhost"))


def portal_url(path=""):
    return os.getenv("PORTAL_URL", "http://localhost:5173").rstrip("/") + path


def send_email(to, subject, body, footer=""):
    """Send one email. Never raises: returns {'sent', 'dry_run', 'skipped', 'error'}."""
    result = {"sent": False, "dry_run": False, "skipped": None, "error": None}
    if _reserved(to):
        result["skipped"] = "test address"
        return result
    if not smtp_configured():
        result["dry_run"] = True
        print(f"\n[EMAIL NOT SENT - SMTP is not configured]\nTo: {to}\nSubject: {subject}\n{body}\n")
        return result
    try:
        server = _connect()
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = os.getenv("MAIL_FROM") or os.environ["SMTP_USER"]
            msg["To"] = to
            msg.set_content(body + (f"\n\n--\n{footer}\n" if footer else "\n"))
            server.send_message(msg)
            result["sent"] = True
        finally:
            try:
                server.quit()
            except Exception:
                pass
    except (OSError, smtplib.SMTPException) as err:
        result["error"] = str(err)
        print(f"[EMAIL FAILED] To: {to} - {err}")
    return result


def _in_background(fn, *args):
    threading.Thread(target=fn, args=args, daemon=True).start()


def _label(kind):
    return "complaint" if kind == "complaints" else "request"


def _ref(kind, row):
    return f"{'CMP' if kind == 'complaints' else 'REQ'}-{int(row['id']):06d}"


def _what(kind, row):
    return row.get("subject") if kind == "complaints" else row.get("type")


def notify_received(kind, row):
    """Confirmation email when a student sends a complaint or request (sent in the background)."""
    label, ref = _label(kind), _ref(kind, row)
    lines = [
        "Hello,",
        "",
        f"We have received your {label}.",
        "",
        f"Reference number: {ref}",
        f"About: {_what(kind, row)}",
    ]
    if kind == "complaints":
        lines.append(f"Sent to: {row['routed_to']}")
    lines += [
        "Status: New",
        "",
        f"You can check the progress at any time on the portal: {portal_url('/track')}",
        "Enter the reference number and this email address.",
        "",
        "KSTVET Student Portal",
    ]
    _in_background(send_email, row["email"], f"We received your {label}: {ref}", "\n".join(lines))


def notify_status(kind, row):
    """Email the student when the administrator changes the status. Returns the send result."""
    label, ref = _label(kind), _ref(kind, row)
    lines = [
        "Hello,",
        "",
        f"The status of your {label} {ref} ({_what(kind, row)}) has changed.",
        f"New status: {row['status']}",
        "",
        f"You can follow the progress on the portal: {portal_url('/track')}",
        "",
        "KSTVET Student Portal",
    ]
    result = send_email(row["email"], f"Update on your {label} {ref}: {row['status']}", "\n".join(lines))
    result["to"] = row["email"]
    return result


def notify_welcome(email):
    """Welcome email when someone subscribes (sent in the background)."""
    body = (
        "Hello,\n\nYou are now subscribed to KSTVET Student Portal notifications. "
        "You will receive announcements, exam changes and a weekly recap."
    )
    footer = f"If this was not you, or you want to stop the emails, open: {unsubscribe_link(email)}"
    _in_background(send_email, email, "You are subscribed to KSTVET Student Portal notifications", body, footer)
