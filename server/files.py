"""Storage for the form files (PDF / Word) that administrators upload."""
import os
import shutil
import subprocess

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.getenv("UPLOAD_DIR", "uploads"))
UPLOAD_DIR = os.path.join(UPLOAD_ROOT, "forms")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def looks_like(ext, head):
    """Check the first bytes so a renamed file of another type is refused."""
    if ext == ".pdf":
        return head.startswith(b"%PDF")
    if ext == ".docx":
        return head[:2] == b"PK"
    if ext == ".doc":
        return head[:8] == bytes.fromhex("D0CF11E0A1B11AE1")
    return False


def converter():
    return shutil.which("soffice") or shutil.which("libreoffice")


def make_preview(path):
    """Turn a Word file into a PDF so it can be viewed in the browser. Needs LibreOffice; returns None without it."""
    conv = converter()
    if not conv:
        return None
    stem = os.path.splitext(os.path.basename(path))[0]
    try:
        subprocess.run(
            [conv, "-env:UserInstallation=file:///tmp/portal_lo", "--headless", "--convert-to", "pdf", "--outdir", UPLOAD_DIR, path],
            check=True, capture_output=True, timeout=90,
        )
    except (subprocess.SubprocessError, OSError):
        return None
    out = stem + ".pdf"
    return out if os.path.exists(os.path.join(UPLOAD_DIR, out)) else None


def delete_files(*names):
    for name in {n for n in names if n}:
        try:
            os.remove(os.path.join(UPLOAD_DIR, name))
        except OSError:
            pass
