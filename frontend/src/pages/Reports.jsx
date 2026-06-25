import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Download, Package, Receipt, TrendingUp } from "lucide-react";
import client from "../api/client";
import { useTheme } from "../context/ThemeContext";
import { SkeletonCard } from "../components/Skeleton";
import { getLocalDateString } from "../utils/date";

function formatCurrency(value) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

function toDateInput(date) {
  return getLocalDateString(date);
}

export default function Reports() {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#343742" : "#d7e0ec";
  const textColor = theme === "dark" ? "#9aa5b8" : "#5b6b82";

  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return toDateInput(d);
  });
  const [end, setEnd] = useState(() => toDateInput(new Date()));

  const [sales, setSales] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    const [salesRes, topRes, stockRes] = await Promise.all([
      client.get("/reports/sales", { params: { start, end } }),
      client.get("/reports/top-items", { params: { start, end, limit: 5 } }),
      client.get("/reports/stock"),
    ]);
    setSales(salesRes.data);
    setTopItems(topRes.data);
    setStock(stockRes.data);
    setLoading(false);
  }

  useEffect(() => {
    (async () => { await load(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  const chartData = (sales?.days || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={start}
            max={end}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-lg bg-tokio-panel border border-tokio-border px-3 py-2 text-sm"
          />
          <span className="text-tokio-muted text-sm">to</span>
          <input
            type="date"
            value={end}
            min={start}
            max={toDateInput(new Date())}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-lg bg-tokio-panel border border-tokio-border px-3 py-2 text-sm"
          />
          <div className="flex flex-col items-end gap-2">
            <a
              href={(() => {
                const saved = localStorage.getItem("tokio_sheets_url");
                if (saved) return saved;
                return "https://docs.google.com/spreadsheets/d/1b95FQ3AWKvXRrLmt77-l4ygjEoW_wTNXZWlbz7yQ9I4/edit";
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold transition shadow-sm shadow-emerald-500/20"
            >
              <Download size={15} />
              Open in Google Sheets
            </a>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
              <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
                <TrendingUp size={14} />
                Total Sales
              </div>
              <div className="text-lg font-bold text-tokio-blue">{formatCurrency(sales.total_sales)}</div>
            </div>
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
              <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
                <Receipt size={14} />
                Transactions
              </div>
              <div className="text-lg font-bold">{sales.total_transactions}</div>
            </div>
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
              <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
                <Package size={14} />
                Stock Value
              </div>
              <div className="text-lg font-bold">{formatCurrency(stock.total_stock_value)}</div>
            </div>
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
              <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
                <AlertTriangle size={14} />
                Low Stock Items
              </div>
              <div className={`text-lg font-bold flex items-center gap-1.5 ${stock.low_stock_count > 0 ? "text-tokio-danger" : ""}`}>
                {stock.low_stock_count > 0 && <AlertTriangle size={16} />}
                {stock.low_stock_count} / {stock.total_items}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
              <h2 className="font-bold mb-3">Sales Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke={textColor} fontSize={12} />
                  <YAxis stroke={textColor} fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ background: theme === "dark" ? "#26282d" : "#ffffff", border: `1px solid ${gridColor}`, borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#1e88e5" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
              <h2 className="font-bold mb-3">Top Selling Items</h2>
              {topItems.length === 0 ? (
                <p className="text-tokio-muted text-sm">No sales in this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topItems} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                    <XAxis type="number" stroke={textColor} fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke={textColor} fontSize={12} width={90} />
                    <Tooltip
                      formatter={(value, key) => (key === "revenue" ? formatCurrency(value) : value)}
                      contentStyle={{ background: theme === "dark" ? "#26282d" : "#ffffff", border: `1px solid ${gridColor}`, borderRadius: 8 }}
                    />
                    <Bar dataKey="quantity" fill="#29b6ff" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-tokio-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-tokio-panel text-tokio-muted">
                <tr>
                  <th className="text-left px-4 py-3">Item</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">Stock</th>
                  <th className="text-right px-4 py-3">Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {stock.items.map((item) => (
                  <tr key={item.id} className="border-t border-tokio-border">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-tokio-muted">{item.category || "-"}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={item.low_stock ? "text-tokio-danger font-semibold" : ""}>{item.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.stock_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
