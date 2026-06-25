import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  QrCode,
  Receipt as ReceiptIcon,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import client from "../api/client";
import ReceiptModal from "../components/Receipt";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import { getLocalDateString } from "../utils/date";

const PAGE_SIZE = 10;

const PAYMENT_ICONS = {
  cash: Banknote,
  qris: QrCode,
  debit: CreditCard,
  credit: CreditCard,
};

function formatCurrency(value) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const today = getLocalDateString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewTransaction, setViewTransaction] = useState(null);

  async function load() {
    setLoading(true);
    const params = { start_date: startDate, end_date: endDate };
    const [txRes, summaryRes] = await Promise.all([
      client.get("/transactions", { params }),
      client.get("/transactions/summary", { params }),
    ]);
    setTransactions(txRes.data);
    setSummary(summaryRes.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (tx) =>
        tx.cashier.toLowerCase().includes(q) ||
        tx.payment_method.toLowerCase().includes(q) ||
        tx.items.some((it) => it.item_name.toLowerCase().includes(q))
    );
  }, [transactions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg bg-tokio-panel border border-tokio-border px-3 py-2 text-sm"
          />
          <span className="text-tokio-muted text-sm">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg bg-tokio-panel border border-tokio-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
            <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
              <Wallet size={14} />
              Modal Harian
            </div>
            <div className="text-lg font-bold">{formatCurrency(summary.capital)}</div>
          </div>
          <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
            <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
              <TrendingUp size={14} />
              Total Sales
            </div>
            <div className="text-lg font-bold text-tokio-blue">{formatCurrency(summary.total_sales)}</div>
          </div>
          <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
            <div className="flex items-center gap-2 text-xs text-tokio-muted mb-1">
              <ReceiptIcon size={14} />
              Transactions
            </div>
            <div className="text-lg font-bold">{summary.transaction_count}</div>
          </div>
          <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
            <div className="text-xs text-tokio-muted mb-1">By Payment Method</div>
            {Object.entries(summary.by_payment_method).length === 0 && (
              <div className="text-sm text-tokio-muted">-</div>
            )}
            {Object.entries(summary.by_payment_method).map(([method, amount]) => {
              const Icon = PAYMENT_ICONS[method] || Wallet;
              return (
                <div key={method} className="text-sm flex items-center justify-between gap-2">
                  <span className="capitalize text-tokio-muted flex items-center gap-1.5">
                    <Icon size={13} />
                    {method}
                  </span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tokio-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by cashier, item, or payment..."
            className="w-full rounded-lg bg-tokio-panel border border-tokio-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
          />
        </div>
        <span className="text-sm text-tokio-muted">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-xl border border-tokio-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-tokio-panel text-tokio-muted">
            <tr>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Cashier</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-center px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={5} />)}
            {!loading && pageTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-tokio-muted">
                  {transactions.length === 0 ? "No transactions in this date range." : "No transactions match your search."}
                </td>
              </tr>
            )}
            {!loading &&
              pageTransactions.map((tx) => {
                const Icon = PAYMENT_ICONS[tx.payment_method] || Wallet;
                return (
                  <tr key={tx.id} className="border-t border-tokio-border align-top">
                    <td className="px-4 py-3 text-tokio-muted whitespace-nowrap">
                      {(() => {
                        const d = new Date(tx.created_at);
                        const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                        const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                        return (
                          <span>
                            <span className="text-tokio-text font-medium">{time}</span>
                            <span className="block text-xs">{date}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">{tx.cashier}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon size={14} className="text-tokio-muted" />
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(tx.total_price)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setViewTransaction(tx)}
                        className="rounded border border-tokio-border p-1.5 hover:bg-tokio-panel"
                        title="View items"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!loading && filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-tokio-muted">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-lg border border-tokio-border px-3 py-1.5 hover:bg-tokio-panel transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-tokio-border px-3 py-1.5 hover:bg-tokio-panel transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {viewTransaction && (
        <ReceiptModal transaction={viewTransaction} onClose={() => setViewTransaction(null)} />
      )}
    </div>
  );
}
