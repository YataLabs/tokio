from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import auth, models
from ..database import get_db
from ..services import sheets

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncRequest(BaseModel):
    spreadsheet_url: str | None = None


def _items_payload(db, business_id):
    return [
        {
            "id": i.id, "name": i.name, "sku": i.sku,
            "category": i.category, "price": i.price, "stock": i.stock,
        }
        for i in db.query(models.Item).filter(models.Item.business_id == business_id).all()
    ]


def _tx_payload(db, business_id):
    txs = (
        db.query(models.Transaction)
        .filter(models.Transaction.business_id == business_id)
        .order_by(models.Transaction.created_at.asc())
        .all()
    )
    return [
        {
            "id": t.id,
            "created_at": t.created_at,
            "cashier": t.cashier,
            "payment_method": t.payment_method,
            "total_price": t.total_price,
            "items": [{"item_name": ti.item_name, "quantity": ti.quantity} for ti in t.items],
        }
        for t in txs
    ]


@router.post("/stock")
def sync_stock_to_sheets(
    body: SyncRequest = SyncRequest(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        return sheets.sync_stock(_items_payload(db, current_user.business_id), body.spreadsheet_url)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/transactions")
def sync_transactions_to_sheets(
    body: SyncRequest = SyncRequest(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        return sheets.sync_transactions(_tx_payload(db, current_user.business_id), body.spreadsheet_url)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/overview")
def sync_overview_to_sheets(
    body: SyncRequest = SyncRequest(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Update Overview sheet with KPIs + stock bar chart + daily revenue line chart."""
    try:
        return sheets.update_overview(
            _items_payload(db, current_user.business_id),
            _tx_payload(db, current_user.business_id),
            body.spreadsheet_url,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
