import * as XLSX from "xlsx";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtIDR(value) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDateOnly(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Set column widths on a worksheet */
function setCols(ws, widths) {
  ws["!cols"] = widths.map((w) => ({ wch: w }));
}

// ─── Page 1: Charts and General Information ──────────────────────────────────

function buildOverviewSheet(salesData, topItems, stockData, start, end) {
  const allRows = [];

  // Header section
  allRows.push(["📊 LAPORAN TOKIO"], []);
  allRows.push([`Periode: ${start} s/d ${end}`]);
  allRows.push([`Diekspor pada: ${new Date().toLocaleString("id-ID")}`], []);

  // Summary section - Key metrics
  allRows.push(["🔑 RINGKASAN UTAMA"]);
  allRows.push(["Total Penjualan", fmtIDR(salesData.total_sales)]);
  allRows.push(["Jumlah Transaksi", salesData.total_transactions]);
  allRows.push(["Rata-rata per Transaksi", salesData.total_transactions > 0 ? fmtIDR(salesData.total_sales / salesData.total_transactions) : "-"]);
  allRows.push(["Total Item", stockData.total_items]);
  allRows.push(["Total Nilai Stok", fmtIDR(stockData.total_stock_value)]);
  allRows.push(["Item Stok Rendah", stockData.low_stock_count], []);

  // Instructions section
  allRows.push(["📝 CARA MEMBUAT GRAFIK"]);
  allRows.push(["1. Pilih sel data di bawah (misal: kolom Tanggal & Total Penjualan)"]);
  allRows.push(["2. Klik Insert > Chart"]);
  allRows.push(["3. Pilih tipe grafik yang diinginkan (Line, Column, dll)"], []);

  // Daily Sales section (chart-ready)
  allRows.push(["📈 PENJUALAN HARIAN"]);
  allRows.push(["Tanggal", "Total Penjualan (IDR)", "Jumlah Transaksi", "Rata-rata per Transaksi (IDR)"]);
  
  salesData.days.forEach((d) => {
    const avg = d.count > 0 ? d.total / d.count : 0;
    allRows.push([fmtDateOnly(d.date), d.total, d.count, avg]);
  });
  allRows.push(["TOTAL", salesData.total_sales, salesData.total_transactions, salesData.total_transactions > 0 ? salesData.total_sales / salesData.total_transactions : 0], []);

  // Top Items section (chart-ready)
  allRows.push(["🏆 TOP 10 ITEM TERLARIS"]);
  allRows.push(["Peringkat", "Nama Item", "Total Terjual (Qty)", "Total Pendapatan (IDR)"]);
  
  topItems.slice(0, 10).forEach((item, i) => {
    allRows.push([i + 1, item.name, item.quantity, item.revenue]);
  });

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  setCols(ws, [20, 30, 25, 28]);
  return ws;
}

// ─── Page 2: Lists of Stocks ─────────────────────────────────────────────────

function buildStockSheet(stockData) {
  const { items, total_stock_value, total_items, low_stock_count } = stockData;

  const header = ["No", "Nama Item", "Kategori", "SKU", "Harga (IDR)", "Stok", "Nilai Stok (IDR)", "Status"];
  const rows = items.map((item, i) => [
    i + 1,
    item.name,
    item.category || "-",
    item.sku || "-",
    item.price,
    item.stock,
    item.price * item.stock,
    item.low_stock ? "⚠ Low Stock" : "OK",
  ]);

  // Summary rows at the bottom
  const summaryRows = [
    [],
    ["", "RINGKASAN"],
    ["", "Total Item", "", "", "", total_items],
    ["", "Total Nilai Stok", "", "", "", "", total_stock_value],
    ["", "Item Stok Rendah", "", "", "", low_stock_count],
  ];

  const allRows = [header, ...rows, ...summaryRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  setCols(ws, [5, 28, 18, 16, 16, 8, 20, 14]);
  return ws;
}

// ─── Page 3: Lists of Transactions ───────────────────────────────────────────

function buildTransactionSheet(transactions, start, end) {
  const header = [
    "No Transaksi",
    "Tanggal & Waktu",
    "Kasir",
    "Metode Bayar",
    "Nama Item",
    "Qty",
    "Harga Satuan (IDR)",
    "Subtotal (IDR)",
    "Total Transaksi (IDR)",
  ];

  const rows = [];
  let grandTotal = 0;
  let rowNum = 0;

  for (const trx of transactions) {
    grandTotal += trx.total_price;
    const itemCount = trx.items.length;

    trx.items.forEach((item, idx) => {
      rowNum++;
      rows.push([
        `TRX-${String(trx.id).padStart(4, "0")}`,
        idx === 0 ? fmtDate(trx.created_at) : "",   // only show date on first item row
        idx === 0 ? trx.cashier : "",
        idx === 0 ? trx.payment_method.toUpperCase() : "",
        item.item_name,
        item.quantity,
        item.unit_price,
        item.subtotal,
        idx === 0 ? trx.total_price : "",            // total only on first row
      ]);
    });
  }

  const summaryRows = [
    [],
    ["", "", "", "", "", "", "", "TOTAL KESELURUHAN", grandTotal],
    [],
    [`Laporan periode: ${start} s/d ${end}`],
    [`Total transaksi: ${transactions.length}`],
    [`Diekspor pada: ${new Date().toLocaleString("id-ID")}`],
  ];

  const allRows = [header, ...rows, ...summaryRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  setCols(ws, [14, 22, 16, 14, 28, 6, 20, 18, 22]);
  return ws;
}

// ─── Main export function ────────────────────────────────────────────────────

/**
 * Build and download a multi-sheet .xlsx report.
 *
 * @param {object} params
 * @param {object} params.salesData    - from /reports/sales
 * @param {Array}  params.topItems     - from /reports/top-items
 * @param {object} params.stockData    - from /reports/stock
 * @param {Array}  params.transactions - from /transactions
 * @param {string} params.start        - ISO date string "YYYY-MM-DD"
 * @param {string} params.end          - ISO date string "YYYY-MM-DD"
 */
export function downloadExcelReport({ salesData, topItems, stockData, transactions, start, end }) {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildOverviewSheet(salesData, topItems, stockData, start, end), "Ringkasan & Chart");
  XLSX.utils.book_append_sheet(wb, buildStockSheet(stockData), "Stok Barang");
  XLSX.utils.book_append_sheet(wb, buildTransactionSheet(transactions, start, end), "List Transaksi");

  const filename = `Laporan_Tokio_${start}_${end}.xlsx`;
  XLSX.writeFile(wb, filename);
}
