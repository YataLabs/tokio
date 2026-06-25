import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/daily-capital", tags=["daily-capital"])


def _auto_close_past_days(db: Session, business_id: int, today: datetime.date):
    past_open = (
        db.query(models.DailyCapital)
        .filter(
            models.DailyCapital.business_id == business_id,
            models.DailyCapital.date < today,
            models.DailyCapital.closed == False,  # noqa: E712
        )
        .all()
    )
    for record in past_open:
        record.closed = True
        record.closed_at = datetime.datetime.utcnow()
    if past_open:
        db.commit()


@router.get("/today", response_model=schemas.DailyCapitalOut | None)
def get_today(
    local_date: datetime.date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    today = local_date or datetime.date.today()
    _auto_close_past_days(db, current_user.business_id, today)
    record = (
        db.query(models.DailyCapital)
        .filter(
            models.DailyCapital.business_id == current_user.business_id,
            models.DailyCapital.date == today,
            models.DailyCapital.closed == False,  # noqa: E712
        )
        .order_by(models.DailyCapital.id.desc())
        .first()
    )
    return record


@router.post("", response_model=schemas.DailyCapitalOut)
def create_or_update(payload: schemas.DailyCapitalCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    record = (
        db.query(models.DailyCapital)
        .filter(
            models.DailyCapital.business_id == current_user.business_id,
            models.DailyCapital.date == payload.date,
            models.DailyCapital.closed == False,  # noqa: E712
        )
        .order_by(models.DailyCapital.id.desc())
        .first()
    )
    if record:
        record.amount = payload.amount
        record.cashier = payload.cashier
        record.note = payload.note
    else:
        record = models.DailyCapital(**payload.model_dump(), business_id=current_user.business_id)
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/topup", response_model=schemas.DailyCapitalOut)
def topup(payload: schemas.DailyCapitalTopup, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    record = (
        db.query(models.DailyCapital)
        .filter(
            models.DailyCapital.business_id == current_user.business_id,
            models.DailyCapital.closed == False,  # noqa: E712
        )
        .order_by(models.DailyCapital.id.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="No open cashier session for today")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Top-up amount must be positive")

    record.amount += payload.amount
    if payload.note:
        record.note = f"{record.note}; {payload.note}" if record.note else payload.note
    db.commit()
    db.refresh(record)
    return record


@router.post("/close", response_model=schemas.DailyCapitalOut)
def close_day(payload: schemas.DailyCapitalClose, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Find the most recent open session — regardless of date.
    # This handles the case where a session was opened on a previous day
    # (e.g. opened on June 19, closing on June 20).
    record = (
        db.query(models.DailyCapital)
        .filter(
            models.DailyCapital.business_id == current_user.business_id,
            models.DailyCapital.closed == False,  # noqa: E712
        )
        .order_by(models.DailyCapital.id.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="No open cashier session found")

    record.closed = True
    record.closed_at = datetime.datetime.utcnow()
    if payload.note:
        record.note = f"{record.note}; {payload.note}" if record.note else payload.note
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[schemas.DailyCapitalOut])
def list_capitals(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return (
        db.query(models.DailyCapital)
        .filter(models.DailyCapital.business_id == current_user.business_id)
        .order_by(models.DailyCapital.date.desc(), models.DailyCapital.id.desc())
        .all()
    )
