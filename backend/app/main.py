import os
import uuid

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user=Depends(auth.get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, or GIF images allowed")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = os.path.join(UPLOADS_DIR, filename)
    content = await file.read()
    with open(dest, "wb") as f:
        f.write(content)
    return {"url": f"/uploads/{filename}"}


@app.get("/")
def root():
    return {"status": "ok", "service": "Tokio POS API"}