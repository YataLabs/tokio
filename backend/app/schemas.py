import datetime
from typing import Annotated, List, Optional

from pydantic import BaseModel, EmailStr, AfterValidator

def make_utc_aware(dt: datetime.datetime) -> datetime.datetime:
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt

UTCDateTime = Annotated[datetime.datetime, AfterValidator(make_utc_aware)]


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    business_id: Optional[int] = None
    expires_at: Optional[UTCDateTime] = None

    class Config:
        from_attributes = True


# ---------- Businesses ----------
class BusinessOut(BaseModel):
    id: int
    name: str
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class BusinessCreate(BaseModel):
    name: str
    owner_name: str
    owner_email: EmailStr
    owner_password: str
    expires_at: Optional[datetime.datetime] = None


# ---------- Admin: Users ----------
class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "cashier"  # owner | cashier
    business_id: int
    expires_at: Optional[datetime.datetime] = None


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    business_id: Optional[int] = None
    expires_at: Optional[datetime.datetime] = None
    password: Optional[str] = None


# ---------- Items ----------
class ItemBase(BaseModel):
    name: str
    sku: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None
    image_url: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class ItemOut(ItemBase):
    id: int

    class Config:
        from_attributes = True


class StockAdjust(BaseModel):
    delta: int  # positive to add stock, negative to reduce


# ---------- Daily Capital (Modal Harian) ----------
class DailyCapitalCreate(BaseModel):
    date: datetime.date
    amount: float
    cashier: str
    note: Optional[str] = None


class DailyCapitalOut(DailyCapitalCreate):
    id: int
    closed: bool = False
    closed_at: Optional[UTCDateTime] = None

    class Config:
        from_attributes = True


class DailyCapitalTopup(BaseModel):
    amount: float
    note: Optional[str] = None


class DailyCapitalClose(BaseModel):
    note: Optional[str] = None


# ---------- Transactions ----------
class TransactionItemCreate(BaseModel):
    item_id: int
    quantity: int


class TransactionCreate(BaseModel):
    cashier: str
    payment_method: str
    items: List[TransactionItemCreate]
    cash_received: Optional[float] = None


class TransactionItemOut(BaseModel):
    id: int
    item_id: int
    item_name: str
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class TransactionOut(BaseModel):
    id: int
    cashier: str
    payment_method: str
    total_price: float
    cash_received: Optional[float]
    change: Optional[float]
    created_at: UTCDateTime
    items: List[TransactionItemOut]

    class Config:
        from_attributes = True
