"""
Run manually: python -m app.seed
Seeds dev accounts. Never run in production.
"""
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)

from . import auth, models
from .database import SessionLocal


def seed_admin():
    db = SessionLocal()
    try:
        if db.query(models.User).filter(models.User.email == "admin@tokio.com").first():
            return
        db.add(models.User(
            name="Tokio Admin",
            email="admin@tokio.com",
            hashed_password=auth.hash_password("admin123"),
            role="admin",
        ))
        db.commit()
    finally:
        db.close()


def seed_owner():
    db = SessionLocal()
    try:
        if db.query(models.User).filter(models.User.email == "owner@tokio.com").first():
            return
        business = models.Business(name="Tokio Store")
        db.add(business)
        db.flush()
        db.add(models.User(
            name="Tokio Owner",
            email="owner@tokio.com",
            hashed_password=auth.hash_password("tokio123"),
            role="owner",
            business_id=business.id,
        ))
        db.add_all([
            models.Item(name="Pensil",    price=2000,  stock=100, business_id=business.id),
            models.Item(name="Penghapus", price=3000,  stock=50,  business_id=business.id),
            models.Item(name="Buku Tulis",price=5000,  stock=80,  business_id=business.id),
        ])
        db.commit()
    finally:
        db.close()


def seed_second_owner():
    db = SessionLocal()
    try:
        if db.query(models.User).filter(models.User.email == "owner2@tokio.com").first():
            return
        business = models.Business(name="Kopi Senja")
        db.add(business)
        db.flush()
        db.add(models.User(
            name="Kopi Senja Owner",
            email="owner2@tokio.com",
            hashed_password=auth.hash_password("tokio123"),
            role="owner",
            business_id=business.id,
        ))
        db.add_all([
            models.Item(name="Kopi Hitam", price=12000, stock=200, business_id=business.id),
            models.Item(name="Kopi Susu",  price=15000, stock=150, business_id=business.id),
            models.Item(name="Roti Bakar", price=18000, stock=60,  business_id=business.id),
        ])
        db.commit()
    finally:
        db.close()


def run_all():
    seed_admin()
    seed_owner()
    seed_second_owner()
    print("Seed complete.")


if __name__ == "__main__":
    run_all()
