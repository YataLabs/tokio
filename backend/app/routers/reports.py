import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import auth, models
from ..database import get_db

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/sales")
def sales_over_time(
    start: datetime.date = Query(...),
    end: datetime.date = Query(...),
    tz_offset: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    start_dt = datetime.datetime.combine(start, datetime.time.min)
    end_dt = datetime.datetime.combine(end, datetime.time.max)
    if tz_offset is not None:
        start_dt = start_dt + datetime.timedelta(minutes=tz_offset)
        end_dt = end_dt + datetime.timedelta(minutes=tz_offset)

    if tz_offset is not None:
        if db.bind.dialect.name == "sqlite":
            modifier = f'+{abs(tz_offset)} minutes' if tz_offset <= 0 else f'-{tz_offset} minutes'
            shifted_created_at = func.datetime(models.Transaction.created_at, modifier)
        else:
            shifted_created_at = models.Transaction.created_at - datetime.timedelta(minutes=tz_offset)
    else:
        shifted_created_at = models.Transaction.created_at

    rows = (
        db.query(
            func.date(shifted_created_at).label("date"),
            func.sum(models.Transaction.total_price).label("total"),
            func.count(models.Transaction.id).label("count"),
        )
        .filter(
            models.Transaction.business_id == current_user.business_id,
            models.Transaction.created_at >= start_dt,
            models.Transaction.created_at <= end_dt,
        )
        .group_by(func.date(shifted_created_at))
        .all()
    )
    by_date = {str(r.date): {"total": r.total, "count": r.count} for r in rows}

    result = []
    current = start
    while current <= end:
        key = current.isoformat()
        entry = by_date.get(key, {"total": 0, "count": 0})
        result.append({"date": key, "total": entry["total"] or 0, "count": entry["count"] or 0})
        current += datetime.timedelta(days=1)

    return {
        "days": result,
        "total_sales": sum(d["total"] or 0 for d in result),
        "total_transactions": sum(d["count"] or 0 for d in result),
    }


@router.get("/top-items")
def top_items(
    start: datetime.date = Query(...),
    end: datetime.date = Query(...),
    limit: int = Query(default=5, ge=1, le=50),
    tz_offset: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    start_dt = datetime.datetime.combine(start, datetime.time.min)
    end_dt = datetime.datetime.combine(end, datetime.time.max)
    if tz_offset is not None:
        start_dt = start_dt + datetime.timedelta(minutes=tz_offset)
        end_dt = end_dt + datetime.timedelta(minutes=tz_offset)

    rows = (
        db.query(
            models.TransactionItem.item_name,
            func.sum(models.TransactionItem.quantity).label("quantity"),
            func.sum(models.TransactionItem.subtotal).label("revenue"),
        )
        .join(models.Transaction, models.Transaction.id == models.TransactionItem.transaction_id)
        .filter(
            models.Transaction.business_id == current_user.business_id,
            models.Transaction.created_at >= start_dt,
            models.Transaction.created_at <= end_dt,
        )
        .group_by(models.TransactionItem.item_name)
        .order_by(func.sum(models.TransactionItem.quantity).desc())
        .limit(limit)
        .all()
    )

    return [{"name": r.item_name, "quantity": r.quantity, "revenue": r.revenue} for r in rows]


@router.get("/stock")
def stock_report(
    low_stock_threshold: int = Query(default=5, ge=0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    items = (
        db.query(models.Item)
        .filter(models.Item.business_id == current_user.business_id)
        .order_by(models.Item.name)
        .all()
    )

    return {
        "items": [
            {
                "id": i.id,
                "name": i.name,
                "category": i.category,
                "price": i.price,
                "stock": i.stock,
                "stock_value": i.price * i.stock,
                "low_stock": i.stock <= low_stock_threshold,
            }
            for i in items
        ],
        "total_stock_value": sum(i.price * i.stock for i in items),
        "low_stock_count": sum(1 for i in items if i.stock <= low_stock_threshold),
        "total_items": len(items),
    }
