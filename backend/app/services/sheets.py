"""
Google Sheets sync service.

Auth options (checked in order):
  A) Service account key  → credentials/sheets_sa.json
     Standard GCP service account JSON key. If your org blocks key creation,
     create the GCP project with a personal Gmail account instead.

  B) OAuth2 user credentials (Desktop app flow)
     1. GCP Console → APIs & Services → Credentials → Create → OAuth client ID
        → Application type: Desktop app → Download JSON
     2. Save it as credentials/oauth_client.json
     3. Run once to authorize:  python -m app.services.sheets_auth
        This opens a browser, you approve, and saves a token to
        credentials/oauth_token.json (gitignored).

Sheet structure:
  - Overview      gid=0
  - Item Stock    gid=1303504912
  - Transactions  gid=2030347804
"""
import os
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

WIB = timezone(timedelta(hours=7))

SPREADSHEET_ID = os.environ.get("SHEETS_SPREADSHEET_ID", "")
CREDS_DIR      = Path(__file__).resolve().parents[2] / "credentials"
SA_KEY         = CREDS_DIR / "sheets_sa.json"
OAUTH_CLIENT   = CREDS_DIR / "oauth_client.json"
OAUTH_TOKEN    = CREDS_DIR / "oauth_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

SHEET_OVERVIEW = 0
SHEET_STOCK    = 1303504912
SHEET_TX       = 2030347804


def _extract_id(url_or_id: str) -> str:
    m = re.search(r"/spreadsheets/d/([a-zA-Z0-9_-]+)", url_or_id)
    return m.group(1) if m else url_or_id


def _client(spreadsheet_id: str | None = None):
    try:
        import gspread
    except ImportError:
        raise RuntimeError("Run: pip install gspread google-auth")

    sid = _extract_id(spreadsheet_id) if spreadsheet_id else SPREADSHEET_ID
    if not sid:
        raise RuntimeError("SHEETS_SPREADSHEET_ID not set in .env")

    # ── Option A: service account key (file or base64 env var) ──────
    sa_json_b64 = os.environ.get("SHEETS_SA_JSON_BASE64")
    if sa_json_b64 or SA_KEY.exists():
        import json as _json
        import base64 as _b64
        from google.oauth2.service_account import Credentials
        if sa_json_b64:
            info = _json.loads(_b64.b64decode(sa_json_b64))
        else:
            info = _json.loads(SA_KEY.read_text())
        creds = Credentials.from_service_account_info(info, scopes=SCOPES)
        gc = gspread.authorize(creds)
        return gc, gc.open_by_key(sid)

    # ── Option B: OAuth2 user token ───────────────────────────────
    if OAUTH_TOKEN.exists():
        from google.oauth2.credentials import Credentials as OAuthCreds
        from google.auth.transport.requests import Request
        import json
        data = json.loads(OAUTH_TOKEN.read_text())
        creds = OAuthCreds(
            token=data.get("token"),
            refresh_token=data.get("refresh_token"),
            token_uri=data.get("token_uri", "https://oauth2.googleapis.com/token"),
            client_id=data.get("client_id"),
            client_secret=data.get("client_secret"),
            scopes=SCOPES,
        )
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            OAUTH_TOKEN.write_text(json.dumps({
                "token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "client_secret": creds.client_secret,
            }))
        gc = gspread.authorize(creds)
        return gc, gc.open_by_key(sid)

    raise RuntimeError(
        "No credentials found. Add credentials/sheets_sa.json (service account key) "
        "or run: python -m app.services.sheets_auth (OAuth2 flow)"
    )


def sync_stock(items: list[dict], spreadsheet_id: str | None = None) -> dict:
    """Overwrite the 'Item Stock' sheet with current inventory."""
    _, sh = _client(spreadsheet_id)
    ws = sh.get_worksheet_by_id(SHEET_STOCK)

    now = datetime.now(WIB).strftime("%Y-%m-%d %H:%M WIB")
    rows = [["ID", "Name", "SKU", "Category", "Price (Rp)", "Stock", "Stock Value (Rp)", "Last Synced"]]
    for item in items:
        rows.append([
            item.get("id"),
            item.get("name"),
            item.get("sku") or "",
            item.get("category") or "",
            item.get("price", 0),
            item.get("stock", 0),
            item.get("price", 0) * item.get("stock", 0),
            now,
        ])

    ws.clear()
    ws.update(rows, "A1")
    reqs = [{"addTable": {"table": {
        "name": "Item Stock",
        "range": {"sheetId": SHEET_STOCK, "startRowIndex": 0, "endRowIndex": len(rows),
                  "startColumnIndex": 0, "endColumnIndex": 8},
    }}}]
    try:
        sh.batch_update({"requests": reqs})
    except Exception:
        sh.batch_update({"requests": _table_requests(SHEET_STOCK, 1, len(rows) - 1, 8)})
    return {"synced": len(items), "sheet": "Item Stock"}


def sync_transactions(transactions: list[dict], spreadsheet_id: str | None = None) -> dict:
    """Overwrite the 'Transactions' sheet with all transaction data."""
    _, sh = _client(spreadsheet_id)
    ws = sh.get_worksheet_by_id(SHEET_TX)

    rows = [["ID", "Date", "Cashier", "Payment Method", "Total (Rp)", "Items"]]
    for tx in transactions:
        item_summary = ", ".join(
            f"{i['item_name']} x{i['quantity']}" for i in tx.get("items", [])
        )
        rows.append([
            tx.get("id"),
            str(tx.get("created_at", ""))[:19],
            tx.get("cashier"),
            tx.get("payment_method"),
            tx.get("total_price"),
            item_summary,
        ])

    ws.clear()
    ws.update(rows, "A1")
    reqs = [{"addTable": {"table": {
        "name": "Transactions",
        "range": {"sheetId": SHEET_TX, "startRowIndex": 0, "endRowIndex": len(rows),
                  "startColumnIndex": 0, "endColumnIndex": 6},
    }}}]
    try:
        sh.batch_update({"requests": reqs})
    except Exception:
        sh.batch_update({"requests": _table_requests(SHEET_TX, 1, len(rows) - 1, 6)})
    return {"synced": len(rows) - 1, "sheet": "Transactions"}


def _color(r, g, b):
    return {"red": r / 255, "green": g / 255, "blue": b / 255}


HEADER_BG   = _color(26, 115, 232)   # Google blue
HEADER_FG   = _color(255, 255, 255)  # white
ALT_ROW_BG  = _color(232, 240, 254)  # light blue
WHITE       = _color(255, 255, 255)
BORDER_CLR  = _color(189, 189, 189)


def _table_requests(sheet_id: int, header_row: int, data_rows: int, cols: int):
    """Return batchUpdate requests for one styled table block."""
    requests = []
    end_row = header_row + data_rows  # exclusive

    # Header row: blue bg, white bold text
    requests.append({"repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": header_row - 1, "endRowIndex": header_row,
                  "startColumnIndex": 0, "endColumnIndex": cols},
        "cell": {"userEnteredFormat": {
            "backgroundColor": HEADER_BG,
            "textFormat": {"bold": True, "foregroundColor": HEADER_FG, "fontSize": 10},
            "horizontalAlignment": "LEFT",
        }},
        "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
    }})

    # Alternating data rows
    for i in range(data_rows):
        row_idx = header_row + i  # 1-indexed → 0-indexed = header_row + i - 1
        bg = ALT_ROW_BG if i % 2 == 0 else WHITE
        requests.append({"repeatCell": {
            "range": {"sheetId": sheet_id,
                      "startRowIndex": row_idx, "endRowIndex": row_idx + 1,
                      "startColumnIndex": 0, "endColumnIndex": cols},
            "cell": {"userEnteredFormat": {"backgroundColor": bg}},
            "fields": "userEnteredFormat.backgroundColor",
        }})

    # Borders around entire table
    def _border():
        return {"style": "SOLID", "color": BORDER_CLR}

    requests.append({"updateBorders": {
        "range": {"sheetId": sheet_id,
                  "startRowIndex": header_row - 1, "endRowIndex": end_row,
                  "startColumnIndex": 0, "endColumnIndex": cols},
        "top": _border(), "bottom": _border(), "left": _border(), "right": _border(),
        "innerHorizontal": _border(), "innerVertical": _border(),
    }})

    return requests


def update_overview(
    items: list[dict],
    transactions: list[dict],
    spreadsheet_id: str | None = None,
) -> dict:
    """
    Populate the Overview sheet with three styled tables:
    1. KPI Summary
    2. Stock Inventory
    3. Daily Revenue
    Charts are removed; data is presented as formatted tables.
    """
    _, sh = _client(spreadsheet_id)
    ws = sh.get_worksheet_by_id(SHEET_OVERVIEW)
    ws.clear()

    now = datetime.now(WIB).strftime("%Y-%m-%d %H:%M WIB")
    total_items   = len(items)
    total_stock   = sum(i.get("stock", 0) for i in items)
    total_value   = sum(i.get("price", 0) * i.get("stock", 0) for i in items)
    total_tx      = len(transactions)
    total_revenue = sum(t.get("total_price", 0) for t in transactions)

    # ── Build all row data ────────────────────────────────────────
    # Title row
    title_rows = [
        [f"Tokio POS — Overview   |   Last updated: {now}"],
        [],
    ]

    # Table 1: KPI Summary (header at row 3)
    kpi_header_row = len(title_rows) + 1
    kpi_data = [
        ["Total Items",          total_items],
        ["Total Stock (units)",  total_stock],
        ["Inventory Value (Rp)", total_value],
        ["Total Transactions",   total_tx],
        ["Total Revenue (Rp)",   total_revenue],
    ]
    kpi_rows = [["KPI", "Value"]] + kpi_data

    # Table 2: Stock Inventory
    stock_header_row = kpi_header_row + len(kpi_rows) + 2
    stock_data = [
        [item.get("name"), item.get("sku") or "—", item.get("category") or "—",
         item.get("price", 0), item.get("stock", 0),
         item.get("price", 0) * item.get("stock", 0)]
        for item in sorted(items, key=lambda x: x.get("stock", 0), reverse=True)
    ]
    stock_rows = [["Item", "SKU", "Category", "Price (Rp)", "Stock", "Value (Rp)"]] + stock_data

    # Table 3: Daily Revenue
    daily: dict[str, float] = {}
    for tx in transactions:
        date = str(tx.get("created_at", ""))[:10]
        daily[date] = daily.get(date, 0) + tx.get("total_price", 0)
    daily_header_row = stock_header_row + len(stock_rows) + 2
    daily_data = [[d, daily[d]] for d in sorted(daily.keys())]
    daily_rows = [["Date", "Revenue (Rp)"]] + daily_data

    # ── Write all data ────────────────────────────────────────────
    # Spacer rows between tables
    gap = ["", ""]
    all_rows = (
        title_rows
        + kpi_rows
        + [gap, gap]
        + stock_rows
        + [gap, gap]
        + daily_rows
    )
    ws.update(all_rows, "A1")

    # ── Title formatting ──────────────────────────────────────────
    # Title: bold, larger, no dark background
    ws.format("A1", {"textFormat": {"bold": True, "fontSize": 14}})

    # ── Delete existing charts + tables ──────────────────────────
    batch_reqs = []
    for sheet_meta in sh.fetch_sheet_metadata().get("sheets", []):
        if sheet_meta["properties"]["sheetId"] == SHEET_OVERVIEW:
            for chart in sheet_meta.get("charts", []):
                batch_reqs.append({"deleteEmbeddedObject": {"objectId": chart["chartId"]}})
            for tbl in sheet_meta.get("tables", []):
                batch_reqs.append({"deleteTable": {"tableId": tbl["tableId"]}})

    # ── Convert to native Sheets Tables ──────────────────────────
    def _add_table(name, header_row, data_rows, cols):
        return {"addTable": {"table": {
            "name": name,
            "range": {
                "sheetId": SHEET_OVERVIEW,
                "startRowIndex": header_row - 1,
                "endRowIndex": header_row + data_rows,
                "startColumnIndex": 0,
                "endColumnIndex": cols,
            },
        }}}

    if len(kpi_data)   > 0: batch_reqs.append(_add_table("KPI Summary",    kpi_header_row,   len(kpi_data),   2))
    if len(stock_data) > 0: batch_reqs.append(_add_table("Stock Inventory", stock_header_row, len(stock_data), 6))
    if len(daily_data) > 0: batch_reqs.append(_add_table("Daily Revenue",   daily_header_row, len(daily_data), 2))

    # Section title labels above each table
    section_labels = {
        kpi_header_row   - 1: "📊  KPI Summary",
        stock_header_row - 1: "📦  Stock Inventory",
        daily_header_row - 1: "💰  Daily Revenue",
    }
    label_data = [[""] * 1] * (max(section_labels.keys()) + 1)
    for row_num, label in section_labels.items():
        idx = row_num - 1
        while len(label_data) <= idx:
            label_data.append([""])
        # Write inline via repeatCell bold grey
        batch_reqs.append({"repeatCell": {
            "range": {"sheetId": SHEET_OVERVIEW,
                      "startRowIndex": row_num - 1, "endRowIndex": row_num,
                      "startColumnIndex": 0, "endColumnIndex": 6},
            "cell": {"userEnteredFormat": {
                "textFormat": {"bold": True, "fontSize": 11,
                               "foregroundColor": _color(60, 64, 67)},
            }},
            "fields": "userEnteredFormat.textFormat",
        }})

    # Column widths (A=200, B=100, C=130, D-F=120)
    for i, px in enumerate([200, 100, 130, 120, 80, 120]):
        batch_reqs.append({"updateDimensionProperties": {
            "range": {"sheetId": SHEET_OVERVIEW, "dimension": "COLUMNS",
                      "startIndex": i, "endIndex": i + 1},
            "properties": {"pixelSize": px},
            "fields": "pixelSize",
        }})

    # ── Charts at column J (index 9) ──────────────────────────────
    COL_J = 9  # 0-indexed

    # Bar chart: stock levels (anchored J1)
    if len(stock_data) > 0:
        s_start = stock_header_row - 1   # 0-indexed header
        s_end   = stock_header_row + len(stock_data)
        batch_reqs.append({"addChart": {"chart": {
            "spec": {
                "title": "Stock Levels by Item",
                "basicChart": {
                    "chartType": "BAR",
                    "legendPosition": "NO_LEGEND",
                    "axis": [
                        {"position": "BOTTOM_AXIS", "title": "Stock (units)"},
                        {"position": "LEFT_AXIS",   "title": "Item"},
                    ],
                    "domains": [{"domain": {"sourceRange": {"sources": [{
                        "sheetId": SHEET_OVERVIEW,
                        "startRowIndex": s_start, "endRowIndex": s_end,
                        "startColumnIndex": 0, "endColumnIndex": 1,
                    }]}}}],
                    "series": [{"series": {"sourceRange": {"sources": [{
                        "sheetId": SHEET_OVERVIEW,
                        "startRowIndex": s_start, "endRowIndex": s_end,
                        "startColumnIndex": 4, "endColumnIndex": 5,   # Stock column
                    }]}}, "targetAxis": "BOTTOM_AXIS"}],
                },
            },
            "position": {"overlayPosition": {
                "anchorCell": {"sheetId": SHEET_OVERVIEW, "rowIndex": 0, "columnIndex": COL_J},
                "widthPixels": 520, "heightPixels": 320,
            }},
        }}})

    # Line chart: daily revenue (anchored J below bar chart ≈ row 18)
    if len(daily_data) > 0:
        d_start = daily_header_row - 1
        d_end   = daily_header_row + len(daily_data)
        batch_reqs.append({"addChart": {"chart": {
            "spec": {
                "title": "Daily Revenue Trend",
                "basicChart": {
                    "chartType": "LINE",
                    "legendPosition": "NO_LEGEND",
                    "axis": [
                        {"position": "BOTTOM_AXIS", "title": "Date"},
                        {"position": "LEFT_AXIS",   "title": "Revenue (Rp)"},
                    ],
                    "domains": [{"domain": {"sourceRange": {"sources": [{
                        "sheetId": SHEET_OVERVIEW,
                        "startRowIndex": d_start, "endRowIndex": d_end,
                        "startColumnIndex": 0, "endColumnIndex": 1,
                    }]}}}],
                    "series": [{"series": {"sourceRange": {"sources": [{
                        "sheetId": SHEET_OVERVIEW,
                        "startRowIndex": d_start, "endRowIndex": d_end,
                        "startColumnIndex": 1, "endColumnIndex": 2,
                    }]}}, "targetAxis": "LEFT_AXIS"}],
                },
            },
            "position": {"overlayPosition": {
                "anchorCell": {"sheetId": SHEET_OVERVIEW, "rowIndex": 18, "columnIndex": COL_J},
                "widthPixels": 520, "heightPixels": 320,
            }},
        }}})

    if batch_reqs:
        sh.batch_update({"requests": batch_reqs})

    # Write section labels after batch (gspread cell update)
    for row_num, label in section_labels.items():
        ws.update_cell(row_num, 1, label)

    charts_added = sum(1 for r in batch_reqs if "addChart" in r)
    return {
        "synced_items": len(items),
        "synced_transactions": len(transactions),
        "tables": 3,
        "charts": charts_added,
        "sheet": "Overview",
    }
