# Tokio

Modern, production-ready point-of-sale system for growing businesses. Manage inventory, run cashier sessions, track transactions, and generate reports — all from one clean dashboard.

## Backend (FastAPI)

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Seeded accounts:
- Admin: `admin@Tokio.com` / `admin123`
- Owner: `owner@Tokio.com` / `Tokio123`
- Owner 2: `owner2@Tokio.com` / `Tokio123`

## Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` if the backend isn't on `http://localhost:8000`.
