"""Simple migration to add the missing columns"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load from .env
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# Import the app's database setup
from app.database import engine
from sqlalchemy import text

def migrate():
    print("Starting migration...")
    with engine.connect() as conn:
        # Try to add columns (ignore if they exist)
        try:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cash_received FLOAT"))
            print("Added cash_received column (or already exists)")
            
            conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS change FLOAT"))
            print("Added change column (or already exists)")
            
            conn.commit()
            print("Migration successful!")
        except Exception as e:
            print(f"Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
