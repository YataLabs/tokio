import sys
import os

# Make sure the backend root is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.main import app  # noqa: F401  — Vercel picks up `app`
