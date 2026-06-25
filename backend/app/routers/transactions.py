import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[schemas.TransactionOut])
def list_transactions(
    start_date: datetime.date | None = Query(default=None),
    end_date: datetime.date | None = Query(default=None),
    tz_offset: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    q = db.query(models.Transaction).filter(models.Transaction.business_id == current_user.business_id)
    if start_date or end_date:
        start_date = start_date or end_date
        end_date = end_date or start_date
        start = datetime.datetime.combine(start_date, datetime.time.min)
        end = datetime.datetime.combine(end_date, datetime.time.max)
        if tz_offset is not None:
            start = start + datetime.timedelta(minutes=tz_offset)
            end = end + datetime.timedelta(minutes=tz_offset)
        q = q.filter(models.Transaction.created_at >= start, models.Transaction.created_at <= end)
    return q.order_by(models.Transaction.created_at.desc()).all()


@router.post("", response_model=schemas.TransactionOut)
def create_transaction(payload: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Transaction must include at least one item")

    transaction_items = []
    total_price = 0.0

    for entry in payload.items:
        item = db.query(models.Item).filter(models.Item.id == entry.item_id, models.Item.business_id == current_user.business_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item {entry.item_id} not found")
        if entry.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        if item.stock < entry.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {item.name}")

        subtotal = item.price * entry.quantity
        total_price += subtotal

        item.stock -= entry.quantity

        transaction_items.append(
            models.TransactionItem(
                item_id=item.id,
                item_name=item.name,
                quantity=entry.quantity,
                unit_price=item.price,
                subtotal=subtotal,
            )
        )

    # Calculate change if cash payment
    cash_received = payload.cash_received
    change = None
    if payload.payment_method == "cash" and cash_received is not None:
        change = cash_received - total_price
        if change < 0:
            raise HTTPException(status_code=400, detail="Cash received is less than total price")

    transaction = models.Transaction(
        business_id=current_user.business_id,
        cashier=payload.cashier,
        payment_method=payload.payment_method,
        total_price=total_price,
        cash_received=cash_received,
        change=change,
        items=transaction_items,
    )
    db.add(transaction)
    
    # Subtract change from daily capital if cash payment and change > 0
    if payload.payment_method == "cash" and change and change > 0:
        daily_capital = (
            db.query(models.DailyCapital)
            .filter(
                models.DailyCapital.business_id == current_user.business_id,
                models.DailyCapital.closed == False,
            )
            .order_by(models.DailyCapital.id.desc())
            .first()
        )
        if daily_capital:
            daily_capital.amount -= change

    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/summary")
def summary(
    start_date: datetime.date | None = Query(default=None),
    end_date: datetime.date | None = Query(default=None),
    tz_offset: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if tz_offset is not None:
        local_now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=tz_offset)
        today = local_now.date()
    else:
        today = datetime.date.today()
        
    start_date = start_date or end_date or today
    end_date = end_date or start_date

    start = datetime.datetime.combine(start_date, datetime.time.min)
    end = datetime.datetime.combine(end_date, datetime.time.max)

    if tz_offset is not None:
        start = start + datetime.timedelta(minutes=tz_offset)
        end = end + datetime.timedelta(minutes=tz_offset)

    transactions = (
        db.query(models.Transaction)
        .filter(
            models.Transaction.business_id == current_user.business_id,
            models.Transaction.created_at >= start,
            models.Transaction.created_at <= end,
        )
        .all()
    )

    capitals = (
        db.query(models.DailyCapital)
        .filter(
            models.DailyCapital.business_id == current_user.business_id,
            models.DailyCapital.date >= start_date,
            models.DailyCapital.date <= end_date,
        )
        .all()
    )

    total_sales = sum(t.total_price for t in transactions)
    by_payment: dict[str, float] = {}
    for t in transactions:
        by_payment[t.payment_method] = by_payment.get(t.payment_method, 0) + t.total_price

    return {
        "start_date": start_date,
        "end_date": end_date,
        "capital": sum(c.amount for c in capitals),
        "total_sales": total_sales,
        "transaction_count": len(transactions),
        "by_payment_method": by_payment,
    }
