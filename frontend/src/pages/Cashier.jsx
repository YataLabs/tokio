import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Package,
  Plus,
  PlusCircle,
  QrCode,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import client from "../api/client";
import NumberInput from "../components/NumberInput";
import { getItemImageUrl } from "../utils/itemImage";
import Receipt from "../components/Receipt";
import { useToast } from "../context/ToastContext";
import { SkeletonBlock } from "../components/Skeleton";
import { getLocalDateString } from "../utils/date";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "qris", label: "QRIS", icon: QrCode },
  { value: "debit", label: "Debit", icon: CreditCard },
  { value: "credit", label: "Credit Card", icon: CreditCard },
];

function formatCurrency(value) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

function ItemCard({ item, onAdd }) {
  const outOfStock = item.stock < 1;
  return (
    <div
      className={`bg-tokio-panel rounded-2xl border border-tokio-border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${outOfStock ? "opacity-50" : ""}`}
    >
      {/* Image area — light bg, object-contain so product is fully visible */}
      <div className="relative overflow-hidden" style={{ background: "#f3f4f6" }}>
        <img
          src={getItemImageUrl(item)}
          alt={item.name}
          className="w-full object-contain"
          style={{ height: "160px" }}
        />
        {/* Stock badge */}
        <span className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          {item.stock} Stock
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name */}
        <div className="font-bold text-tokio-text text-sm leading-snug mb-1">{item.name}</div>

        {/* Category / description */}
        {item.category && (
          <div className="text-[11px] text-tokio-muted leading-relaxed mb-3 line-clamp-2">
            {item.category}
          </div>
        )}

        {/* Price */}
        <div className="text-base font-bold text-tokio-text mt-auto mb-3">
          {formatCurrency(item.price)}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={() => onAdd(item)}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 border border-tokio-border rounded-xl py-2.5 text-sm font-semibold text-tokio-text hover:bg-tokio-bg active:scale-[0.98] disabled:cursor-not-allowed transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function Cashier() {
  const { showToast } = useToast();
  const [capital, setCapital] = useState(null);
  const [capitalLoading, setCapitalLoading] = useState(true);
  const [capitalForm, setCapitalForm] = useState({ amount: "", cashier: "", note: "" });

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptCash, setReceiptCash] = useState(null);

  const [showCashModal, setShowCashModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");

  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupForm, setTopupForm] = useState({ amount: "", note: "" });
  const [topupError, setTopupError] = useState("");

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const [closeError, setCloseError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  async function loadItems() {
    const res = await client.get("/items");
    setItems(res.data);
  }

  useEffect(() => {
    (async () => {
      const today = getLocalDateString();
      const [capitalRes, itemsRes] = await Promise.all([
        client.get(`/daily-capital/today?local_date=${today}`),
        client.get("/items"),
      ]);
      setItems(itemsRes.data);

      if (capitalRes.data) {
        // Active session found
        setCapital(capitalRes.data);
        localStorage.setItem("tokio_cashier", JSON.stringify({ date: today, cashier: capitalRes.data.cashier }));
        setCapitalLoading(false);
        return;
      }

      // No active session — check if we had one today (auto-reopen)
      const saved = JSON.parse(localStorage.getItem("tokio_cashier") || "{}");
      if (saved.date === today && saved.cashier) {
        try {
          const res = await client.post("/daily-capital", {
            date: today,
            amount: 0,
            cashier: saved.cashier,
            note: null,
          });
          setCapital(res.data);
        } catch {
          // Session creation failed — fall through to form
        }
      }

      setCapitalLoading(false);
    })();
  }, []);

  // Detect date change when the user switches back to this tab (e.g. left the
  // app open overnight). Re-fetch /today — if the session is from a previous
  // day the backend auto-closes it and returns null, prompting a new session.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      const today = getLocalDateString();
      const saved = JSON.parse(localStorage.getItem("tokio_cashier") || "{}");
      // Date has flipped since the session was started
      if (saved.date && saved.date !== today) {
        client.get(`/daily-capital/today?local_date=${today}`).then((res) => {
          // Backend auto-closes past sessions; if null, force the new-session form
          setCapital(res.data ?? null);
          setCart([]);
        });
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  async function handleCapitalSubmit(e) {
    e.preventDefault();
    setError("");
    const today = getLocalDateString();
    try {
      const res = await client.post("/daily-capital", {
        date: today,
        amount: parseFloat(capitalForm.amount) || 0,
        cashier: capitalForm.cashier,
        note: capitalForm.note || null,
      });
      setCapital(res.data);
      localStorage.setItem("tokio_cashier", JSON.stringify({ date: today, cashier: capitalForm.cashier }));
      showToast("Cashier session started", "success");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save modal harian");
    }
  }

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item_id === item.id);
      if (existing) {
        if (existing.quantity + 1 > item.stock) return prev;
        return prev.map((c) =>
          c.item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      if (item.stock < 1) return prev;
      return [
        ...prev,
        { item_id: item.id, name: item.name, price: item.price, stock: item.stock, quantity: 1 },
      ];
    });
  }

  function updateQuantity(item_id, quantity) {
    setCart((prev) =>
      prev
        .map((c) => (c.item_id === item_id ? { ...c, quantity } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  function removeFromCart(item_id) {
    setCart((prev) => prev.filter((c) => c.item_id !== item_id));
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const change = (parseFloat(cashReceived) || 0) - total;

  function handleCompleteClick() {
    setError("");
    if (cart.length === 0) { setError("Cart is empty"); return; }
    if (paymentMethod === "cash") { setCashReceived(""); setShowCashModal(true); return; }
    handleCheckout();
  }

  async function handleCheckout(cashAmount) {
    setError("");
    setSubmitting(true);
    try {
      const res = await client.post("/transactions", {
        cashier: capital?.cashier ?? "",
        payment_method: paymentMethod,
        items: cart.map((c) => ({ item_id: c.item_id, quantity: c.quantity })),
        cash_received: paymentMethod === "cash" ? cashAmount : null,
      });
      showToast("Transaction recorded successfully", "success");
      setReceipt(res.data);
      setReceiptCash(
        paymentMethod === "cash" && cashAmount != null
          ? { received: cashAmount, change: cashAmount - res.data.total_price }
          : null
      );
      setCart([]);
      setShowCashModal(false);
      loadItems();
      // Refresh capital data to show updated amount after change
      const today = getLocalDateString();
      const capitalRes = await client.get(`/daily-capital/today?local_date=${today}`);
      if (capitalRes.data) {
        setCapital(capitalRes.data);
      }
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to record transaction", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmCashPayment() {
    const received = parseFloat(cashReceived) || 0;
    if (received < total) return;
    handleCheckout(received);
  }

  async function handleTopup(e) {
    e.preventDefault();
    setTopupError("");
    const amount = parseFloat(topupForm.amount);
    if (!amount || amount <= 0) { setTopupError("Enter a valid amount"); return; }
    try {
      const res = await client.post("/daily-capital/topup", { amount, note: topupForm.note || null });
      setCapital(res.data);
      showToast("Modal added successfully", "success");
      setShowTopupModal(false);
      setTopupForm({ amount: "", note: "" });
    } catch (err) {
      setTopupError(err.response?.data?.detail || "Failed to add modal");
    }
  }

  async function handleCloseDay(e) {
    e.preventDefault();
    setCloseError("");
    try {
      await client.post("/daily-capital/close", { note: closeNote || null });
      // Clear saved session so the auto-reopen logic doesn't create a new one
      // when the user navigates away and comes back.
      localStorage.removeItem("tokio_cashier");
      showToast("Cashier session closed", "success");
      setShowCloseModal(false);
      setCloseNote("");
      setCapital(null);
      setCart([]);
    } catch (err) {
      setCloseError(err.response?.data?.detail || "Failed to close session");
    }
  }

  const categories = useMemo(() => {
    return [...new Set(items.map((i) => i.category).filter(Boolean))];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeCategory !== "all") result = result.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeCategory, search]);

  const categoryCount = useMemo(() => {
    const map = {};
    for (const item of items) {
      if (item.category) map[item.category] = (map[item.category] || 0) + 1;
    }
    return map;
  }, [items]);

  if (capitalLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-48" />)}
        </div>
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 -mx-8 -my-8 min-h-[calc(100vh-0px)]">

      {/* Input Modal Harian overlay */}
      {!capital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-tokio-panel border border-tokio-border shadow-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <ShoppingBag size={22} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-tokio-text mb-1">Input Modal Harian</h2>
            <p className="text-tokio-muted text-sm mb-6">Set today's opening capital before starting transactions.</p>
            <form onSubmit={handleCapitalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Cashier Name</label>
                <input
                  autoFocus
                  value={capitalForm.cashier}
                  onChange={(e) => setCapitalForm({ ...capitalForm, cashier: e.target.value })}
                  required
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Opening Capital (IDR)</label>
                <NumberInput
                  value={capitalForm.amount}
                  onChange={(v) => setCapitalForm({ ...capitalForm, amount: v })}
                  required
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Note (optional)</label>
                <input
                  value={capitalForm.note}
                  onChange={(e) => setCapitalForm({ ...capitalForm, note: e.target.value })}
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border text-tokio-text px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 font-semibold text-sm transition shadow-lg shadow-blue-500/20"
              >
                Start Cashier Session
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-w-0 px-8 py-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-tokio-text">Create Transaction</h1>
            <p className="text-sm text-tokio-muted mt-0.5">
              Session: <span className="text-tokio-muted font-medium">{capital?.cashier ?? "—"}</span>
              {" · "}Modal: <span className="text-tokio-muted font-medium">{capital ? formatCurrency(capital.amount) : "—"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTopupModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-tokio-border bg-tokio-panel px-3.5 py-2 text-sm font-medium text-tokio-muted hover:bg-tokio-bg transition shadow-sm"
            >
              <PlusCircle size={15} />
              Tambah Modal
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition shadow-sm"
            >
              <Lock size={15} />
              Tutup Kasir
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-tokio-panel border border-tokio-border text-tokio-muted hover:bg-tokio-bg"
            }`}
          >
            All Product
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeCategory === "all" ? "bg-white/20 text-white" : "bg-tokio-bg text-tokio-muted"
            }`}>
              {items.length}
            </span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-tokio-panel border border-tokio-border text-tokio-muted hover:bg-tokio-bg"
              }`}
            >
              {cat}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeCategory === cat ? "bg-white/20 text-white" : "bg-tokio-bg text-tokio-muted"
              }`}>
                {categoryCount[cat] || 0}
              </span>
            </button>
          ))}

          {/* Search */}
          <div className="relative ml-auto">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tokio-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-52 rounded-full bg-tokio-panel border border-tokio-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 shadow-sm"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onAdd={addToCart} />
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16 text-tokio-muted text-sm">
              No items found.
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail Transaction */}
      <div className="w-[340px] shrink-0 border-l border-tokio-border bg-tokio-panel flex flex-col sticky top-0 h-screen overflow-hidden">
        <div className="px-6 py-6 border-b border-tokio-border">
          <h2 className="text-lg font-bold text-tokio-text">Detail Transaction</h2>
          {cart.length > 0 && (
            <p className="text-xs text-tokio-muted mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</p>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-tokio-muted">
              <ShoppingBag size={32} className="mb-2" />
              <p className="text-sm">No items added yet</p>
            </div>
          )}
          {cart.map((c) => (
            <div key={c.item_id} className="flex items-center gap-3 p-3 bg-tokio-bg rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-tokio-border flex items-center justify-center shrink-0">
                <Package size={18} className="text-tokio-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-tokio-text truncate">{c.name}</div>
                <div className="text-xs text-tokio-muted">{formatCurrency(c.price)}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => updateQuantity(c.item_id, c.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-tokio-border bg-tokio-panel flex items-center justify-center hover:bg-tokio-bg transition"
                >
                  <Minus size={12} />
                </button>
                <span className="w-7 text-center text-sm font-bold text-tokio-text">
                  {String(c.quantity).padStart(2, "0")}
                </span>
                <button
                  onClick={() => updateQuantity(c.item_id, c.quantity + 1)}
                  disabled={c.quantity >= c.stock}
                  className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition"
                >
                  <Plus size={12} />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(c.item_id)}
                className="text-tokio-muted hover:text-red-400 transition ml-1 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 border-t border-tokio-border space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-tokio-muted">Sub-Total</span>
            <span className="font-medium text-tokio-text">{formatCurrency(total)}</span>
          </div>
          <div className="h-px bg-tokio-bg" />
          <div className="flex justify-between text-base font-bold text-tokio-text">
            <span>Total Payment</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment methods + action */}
        <div className="px-5 py-4 border-t border-tokio-border">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PAYMENT_METHODS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  onClick={() => setPaymentMethod(p.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    paymentMethod === p.value
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "border-tokio-border bg-tokio-panel text-tokio-muted hover:bg-tokio-bg"
                  }`}
                >
                  <Icon size={15} />
                  {p.label}
                </button>
              );
            })}
          </div>
          {error && (
            <p className="flex items-center gap-2 text-red-500 text-xs mb-3">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </p>
          )}
          <button
            onClick={handleCompleteClick}
            disabled={submitting || cart.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 py-3.5 font-semibold text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {submitting ? "Processing..." : "Complete Transaction"}
          </button>
        </div>
      </div>

      {/* Cash payment modal */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-tokio-panel shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-tokio-text flex items-center gap-2">
                <Banknote size={18} className="text-blue-600" />
                Cash Payment
              </h2>
              <button onClick={() => setShowCashModal(false)} className="rounded-xl border border-tokio-border p-1.5 hover:bg-tokio-bg transition">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm bg-tokio-bg rounded-xl px-4 py-3">
                <span className="text-tokio-muted">Total</span>
                <span className="font-bold text-tokio-text">{formatCurrency(total)}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Cash Received</label>
                <NumberInput
                  autoFocus
                  value={cashReceived}
                  onChange={setCashReceived}
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-tokio-border pt-3">
                <span className="text-tokio-text">Kembalian</span>
                <span className={change < 0 ? "text-red-500" : "text-emerald-600"}>
                  {formatCurrency(Math.max(change, 0))}
                </span>
              </div>
              {change < 0 && (
                <p className="flex items-center gap-2 text-red-500 text-xs">
                  <AlertTriangle size={14} className="shrink-0" />
                  Cash received is less than the total
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCashModal(false)}
                  className="flex-1 rounded-xl border border-tokio-border px-4 py-2.5 text-sm font-medium hover:bg-tokio-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmCashPayment}
                  disabled={submitting || change < 0 || cashReceived === ""}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tambah Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-tokio-panel shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-tokio-text">Tambah Modal</h2>
              <button onClick={() => setShowTopupModal(false)} className="rounded-xl border border-tokio-border p-1.5 hover:bg-tokio-bg transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Amount</label>
                <NumberInput
                  autoFocus
                  value={topupForm.amount}
                  onChange={(v) => setTopupForm({ ...topupForm, amount: v })}
                  required
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Note (optional)</label>
                <input
                  value={topupForm.note}
                  onChange={(e) => setTopupForm({ ...topupForm, note: e.target.value })}
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              {topupError && (
                <p className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {topupError}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowTopupModal(false)} className="flex-1 rounded-xl border border-tokio-border px-4 py-2.5 text-sm font-medium hover:bg-tokio-bg transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold transition">
                  <PlusCircle size={16} />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutup Kasir */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-tokio-panel shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-tokio-text">Tutup Kasir</h2>
              <button onClick={() => setShowCloseModal(false)} className="rounded-xl border border-tokio-border p-1.5 hover:bg-tokio-bg transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCloseDay} className="space-y-4">
              <p className="text-sm text-tokio-muted bg-tokio-bg rounded-xl p-4">
                This closes today's cashier session. You'll need to start a new session to record more transactions.
              </p>
              <div>
                <label className="block text-xs font-medium text-tokio-muted mb-1.5">Note (optional)</label>
                <input
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  className="w-full rounded-xl bg-tokio-bg border border-tokio-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              {closeError && (
                <p className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {closeError}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCloseModal(false)} className="flex-1 rounded-xl border border-tokio-border px-4 py-2.5 text-sm font-medium hover:bg-tokio-bg transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 text-sm font-semibold transition">
                  <Lock size={16} />
                  Close Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receipt && (
        <Receipt
          transaction={receipt}
          cash={receiptCash}
          isSuccess={true}
          onClose={() => { setReceipt(null); setReceiptCash(null); }}
        />
      )}
    </div>
  );
}
