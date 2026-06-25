from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(auth.require_admin)])


# ---------- Businesses ----------
@router.get("/businesses", response_model=list[schemas.BusinessOut])
def list_businesses(db: Session = Depends(get_db)):
    return db.query(models.Business).order_by(models.Business.name).all()


@router.post("/businesses", response_model=schemas.BusinessOut)
def create_business(payload: schemas.BusinessCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.owner_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    business = models.Business(name=payload.name)
    db.add(business)
    db.flush()

    owner = models.User(
        name=payload.owner_name,
        email=payload.owner_email,
        hashed_password=auth.hash_password(payload.owner_password),
        role="owner",
        business_id=business.id,
        expires_at=payload.expires_at,
    )
    db.add(owner)
    db.commit()
    db.refresh(business)
    return business


@router.delete("/businesses/{business_id}")
def delete_business(business_id: int, db: Session = Depends(get_db)):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    db.query(models.TransactionItem).filter(
        models.TransactionItem.transaction_id.in_(
            db.query(models.Transaction.id).filter(models.Transaction.business_id == business_id)
        )
    ).delete(synchronize_session=False)
    db.query(models.Transaction).filter(models.Transaction.business_id == business_id).delete(synchronize_session=False)
    db.query(models.DailyCapital).filter(models.DailyCapital.business_id == business_id).delete(synchronize_session=False)
    db.query(models.Item).filter(models.Item.business_id == business_id).delete(synchronize_session=False)
    db.query(models.User).filter(models.User.business_id == business_id).delete(synchronize_session=False)
    db.delete(business)
    db.commit()
    return {"ok": True}


# ---------- Users ----------
@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.id).all()


@router.post("/users", response_model=schemas.UserOut)
def create_user(payload: schemas.AdminUserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    business = db.query(models.Business).filter(models.Business.id == payload.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    if payload.role not in ("owner", "cashier"):
        raise HTTPException(status_code=400, detail="Role must be 'owner' or 'cashier'")

    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        role=payload.role,
        business_id=payload.business_id,
        expires_at=payload.expires_at,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.AdminUserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    if "role" in data:
        if data["role"] not in ("admin", "owner", "cashier"):
            raise HTTPException(status_code=400, detail="Invalid role")

    if "business_id" in data and data["business_id"] is not None:
        business = db.query(models.Business).filter(models.Business.id == data["business_id"]).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

    if "password" in data:
        password = data.pop("password")
        if password:
            user.hashed_password = auth.hash_password(password)

    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"ok": True}
