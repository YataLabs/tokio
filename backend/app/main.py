import os
import uuid

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Supabase Storage client (used when SUPABASE_SERVICE_KEY is set)
_supabase = None
def _get_supabase():
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
        if url and key:
            try:
                from supabase import create_client
                _supabase = create_client(url, key)
            except Exception:
                pass
    return _supabase

from . import auth
from .database import Base, engine
from sqlalchemy import text
from .routers import admin, auth as auth_router
from .routers import daily_capital, items, reports, sync, transactions

Base.metadata.create_all(bind=engine)

# Migration: Add cash_received and change columns if they don't exist
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cash_received FLOAT"))
        conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS change FLOAT"))
        conn.commit()
    except Exception:
        # Fallback for databases that don't support IF NOT EXISTS
        conn.rollback()
        try:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN cash_received FLOAT"))
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN change FLOAT"))
        except Exception:
            pass
        conn.commit()

app = FastAPI(title="Tokio POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(items.router)
app.include_router(daily_capital.router)
app.include_router(transactions.router)
app.include_router(reports.router)
app.include_router(sync.router)

# On Vercel (serverless) only /tmp is writable; fall back gracefully
_local_uploads = os.path.join(os.path.dirname(__file__), "..", "uploads")
UPLOADS_DIR = "/tmp/uploads" if os.environ.get("VERCEL") else _local_uploads
os.makedirs(UPLOADS_DIR, exist_ok=True)
try:
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
except Exception:
    pass  # directory may be empty on first cold start

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


STORAGE_BUCKET = "item-images"

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user=Depends(auth.get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, or GIF images allowed")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    content = await file.read()

    # ── Supabase Storage (preferred, persists across deploys) ─────
    sb = _get_supabase()
    if sb:
        try:
            sb.storage.from_(STORAGE_BUCKET).upload(
                path=filename,
                file=content,
                file_options={"content-type": file.content_type},
            )
            public_url = sb.storage.from_(STORAGE_BUCKET).get_public_url(filename)
            return {"url": public_url}
        except Exception:
            pass  # fall through to local storage

    # ── Local filesystem fallback ─────────────────────────────────
    dest = os.path.join(UPLOADS_DIR, filename)
    with open(dest, "wb") as f:
        f.write(content)
    return {"url": f"/uploads/{filename}"}


@app.get("/")
def root():
    return {"status": "ok", "service": "Tokio POS API"}