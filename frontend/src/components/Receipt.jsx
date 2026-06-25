import { useState } from "react";
import { Loader2 } from "lucide-react";
import { isWebUSBSupported, printReceipt } from "../utils/thermalPrinter";
import { useToast } from "../context/ToastContext";

function formatCurrency(value) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

export default function Receipt({ transaction, cash, isSuccess, onClose }) {
  const { showToast } = useToast();
  const [printing, setPrinting] = useState(false);

  if (!transaction) return null;

  async function handlePrint() {
    if (!isWebUSBSupported()) {
      window.print();
      return;
    }
    setPrinting(true);
    try {
      await printReceipt(transaction, cash);
      showToast("Sent to thermal printer", "success");
    } catch (err) {
      showToast(err.message || "Failed to print, opening print dialog", "error");
      window.print();
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-tokio-panel border border-tokio-border shadow-xl overflow-hidden">
        {isSuccess && (
          cash ? (
            <div className="bg-emerald-500/10 border-b border-tokio-border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Transaksi Berhasil!
              </h3>
              <div className="text-xs text-tokio-muted mt-1.5">
                Kembalian
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(cash.change)}
              </div>
              <div className="text-xs text-tokio-muted mt-2">
                Total: {formatCurrency(transaction.total_price)} | Bayar: {formatCurrency(cash.received)}
              </div>
            </div>
          ) : (
            <div className="bg-blue-500/10 border-b border-tokio-border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Transaksi Berhasil!
              </h3>
              <p className="text-xs text-tokio-muted mt-1">
                Pembayaran via {transaction.payment_method.toUpperCase()}
              </p>
            </div>
          )
        )}
        <div id="receipt-print" className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">
              To<span className="text-tokio-blue-light">kio</span>
            </h2>
            <p className="text-xs text-tokio-muted">
              {new Date(transaction.created_at).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-tokio-muted">Receipt #{transaction.id}</p>
          </div>

          <div className="border-t border-dashed border-tokio-border py-3 space-y-1">
            {transaction.items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span>
                  {it.item_name} x{it.quantity}
                </span>
                <span>{formatCurrency(it.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-tokio-border pt-3 space-y-1">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(transaction.total_price)}</span>
            </div>
            <div className="flex justify-between text-sm text-tokio-muted">
              <span>Payment</span>
              <span className="capitalize">{transaction.payment_method}</span>
            </div>
            <div className="flex justify-between text-sm text-tokio-muted">
              <span>Cashier</span>
              <span>{transaction.cashier}</span>
            </div>
            {cash && (
              <>
                <div className="flex justify-between text-sm text-tokio-muted">
                  <span>Cash Received</span>
                  <span>{formatCurrency(cash.received)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Kembalian</span>
                  <span>{formatCurrency(cash.change)}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-tokio-muted mt-4">Thank you for your purchase!</p>
        </div>

        <div className="flex gap-2 p-4 border-t border-tokio-border">
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
          >
            {printing && <Loader2 size={16} className="animate-spin" />}
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-tokio-border px-4 py-2 text-sm hover:bg-tokio-bg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
