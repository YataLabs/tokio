import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-tokio-panel border border-tokio-border shadow-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          {danger && (
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-tokio-danger-bg text-tokio-danger shrink-0">
              <AlertTriangle size={18} />
            </span>
          )}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <p className="text-sm text-tokio-muted mb-6">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-tokio-border px-4 py-2 text-sm font-medium hover:bg-tokio-bg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              danger ? "bg-tokio-danger hover:opacity-90" : "bg-tokio-blue hover:bg-tokio-blue-dark"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
