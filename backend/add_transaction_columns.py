"""
Script to add cash_received and change columns to transactions table
Run: python add_transaction_columns.py
"""
import os
from pathlib import Path

print("Current directory:", os.getcwd())
print("Looking for .env at:", Path(__file__).resolve().parents[0] / ".env")

from dotenv import load_dotenv
env_path = Path(__file__).resolve().parents[0] / ".env"
if env_path.exists():
    print("Loading .env file")
    load_dotenv(env_path, override=True)
else:
    print(".env file not found!")

from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./tokio.db")
print("Using DATABASE_URL:", DATABASE_URL[:50] + "..." if len(DATABASE_URL) > 50 else DATABASE_URL)

# Supabase returns postgres:// — SQLAlchemy needs postgresql+psycopg2://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def add_columns():
    with engine.connect() as conn:
        try:
            print("Connected to database successfully!")
            
            # Check if columns already exist (for safety)
            # For PostgreSQL/SQLite compatibility
            if DATABASE_URL.startswith("sqlite"):
                # SQLite PRAGMA to check columns
                result = conn.execute(text("PRAGMA table_info(transactions)"))
                columns = [row[1] for row in result]
                print("Current columns in transactions table:", columns)
                has_cash_received = "cash_received" in columns
                has_change = "change" in columns
            else:
                # PostgreSQL check
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name = 'transactions' AND column_name IN ('cash_received', 'change')"
                ))
                existing_cols = {row[0] for row in result}
                print("Current columns in transactions table:", existing_cols)
                has_cash_received = "cash_received" in existing_cols
                has_change = "change" in existing_cols
            
            if not has_cash_received:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN cash_received FLOAT"))
                print("✅ Added cash_received column")
            else:
                print("ℹ️  cash_received column already exists")
            
            if not has_change:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN change FLOAT"))
                print("✅ Added change column")
            else:
                print("ℹ️  change column already exists")
            
            conn.commit()
            print("\n✅ Migration complete!")
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            conn.rollback()

if __name__ == "__main__":
    add_columns()
