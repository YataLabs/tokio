import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
  Moon,
  Package,
  Printer,
  Receipt,
  RefreshCw,
  Sun,
  Unplug,
  Wifi,
  WifiOff,
  Zap,
  Settings2,
  Palette,
  Link as LinkIcon,
  BarChart3,
} from "lucide-react";
import client from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  forgetPrinter,
  getBridgeQueue,
  getBridgeUrl,
  getSavedPrinter,
  isWebUSBSupported,
  listBridgePrinters,
  printReceipt,
  requestPrinter,
  setBridgeQueue,
  setBridgeUrl,
} from "../utils/thermalPrinter";

const SAMPLE_TRANSACTION = {
  id: "TEST",
  created_at: new Date().toISOString(),
  cashier: "Test",
  payment_method: "cash",
  total_price: 12000,
  items: [
    { id: 1, item_name: "Sample Item", quantity: 1, subtotal: 12000 },
  ],
};

function StatusBadge({ connected, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        connected
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
      {label}
    </span>
  );
}

function SettingCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div className={`bg-tokio-panel rounded-2xl border border-tokio-border shadow-sm overflow-hidden ${className}`}>
      <div className="p-5 border-b border-tokio-border">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
            <Icon size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-tokio-text">{title}</h3>
            {subtitle && <p className="text-sm text-tokio-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [printer, setPrinter] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);

  const [syncingStock, setSyncingStock] = useState(false);
  const [syncingTx, setSyncingTx] = useState(false);
  const [syncingOverview, setSyncingOverview] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState(
    () => localStorage.getItem("tokio_sheets_url") || ""
  );

  const [bridgeUrl, setBridgeUrlState] = useState(getBridgeUrl());
  const [bridgeQueue, setBridgeQueueState] = useState(getBridgeQueue());
  const [bridgePrinters, setBridgePrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [testingBridge, setTestingBridge] = useState(false);

  useEffect(() => {
    if (!isWebUSBSupported()) return;
    getSavedPrinter()
      .then((device) => setPrinter(device))
      .catch(() => setPrinter(null));
  }, []);

  async function handleRefreshPrinters() {
    setLoadingPrinters(true);
    try {
      const printers = await listBridgePrinters();
      setBridgePrinters(printers);
      if (printers.length === 0) {
        showToast("No CUPS printers found. Add the printer in System Settings first.", "error");
      } else {
        showToast(`${printers.length} printer(s) found`, "success");
      }
    } catch (err) {
      showToast(err.message || "Could not reach print bridge", "error");
    } finally {
      setLoadingPrinters(false);
    }
  }

  function handleBridgeUrlChange(e) {
    const value = e.target.value;
    setBridgeUrlState(value);
    setBridgeUrl(value);
  }

  function handleBridgeQueueChange(e) {
    const value = e.target.value;
    setBridgeQueueState(value);
    setBridgeQueue(value);
  }

  async function handleTestBridgePrint() {
    setTestingBridge(true);
    try {
      await printReceipt(SAMPLE_TRANSACTION, { received: 12000, change: 0 });
      showToast("Test receipt sent to printer", "success");
    } catch (err) {
      showToast(err.message || "Failed to print test receipt", "error");
    } finally {
      setTestingBridge(false);
    }
  }

  function handleSheetsUrlChange(e) {
    setSheetsUrl(e.target.value);
    localStorage.setItem("tokio_sheets_url", e.target.value);
  }

  const syncBody = () => (sheetsUrl ? { spreadsheet_url: sheetsUrl } : {});

  async function handleSyncStock() {
    setSyncingStock(true);
    try {
      const res = await client.post("/sync/stock", syncBody());
      showToast(`Synced ${res.data.synced} items to Google Sheets`, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Sync failed — check server credentials", "error");
    } finally {
      setSyncingStock(false);
    }
  }

  async function handleSyncTransactions() {
    setSyncingTx(true);
    try {
      const res = await client.post("/sync/transactions", syncBody());
      showToast(`Synced ${res.data.synced} transactions to Google Sheets`, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Sync failed — check server credentials", "error");
    } finally {
      setSyncingTx(false);
    }
  }

  async function handleSyncOverview() {
    setSyncingOverview(true);
    try {
      const res = await client.post("/sync/overview", syncBody());
      showToast(`Overview updated — ${res.data.charts} chart(s) written`, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Sync failed — check server credentials", "error");
    } finally {
      setSyncingOverview(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const device = await requestPrinter();
      setPrinter(device);
      showToast("Printer connected", "success");
    } catch (err) {
      showToast(err.message || "Failed to connect printer", "error");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    await forgetPrinter();
    setPrinter(null);
    showToast("Printer disconnected", "success");
  }

  async function handleTestPrint() {
    setTesting(true);
    try {
      await printReceipt(SAMPLE_TRANSACTION, { received: 12000, change: 0 });
      showToast("Test receipt sent to printer", "success");
    } catch (err) {
      showToast(err.message || "Failed to print test receipt", "error");
    } finally {
      setTesting(false);
    }
  }

  const webUSBSupported = isWebUSBSupported();
  const bridgeConnected = !!bridgeQueue && bridgePrinters.length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-tokio-bg flex items-center justify-center text-tokio-muted">
            <Settings2 size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tokio-text">Settings</h1>
            <p className="text-sm text-tokio-muted">Manage your printer, sync, and appearance preferences.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Appearance */}
        <SettingCard
          icon={Palette}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          title="Appearance"
          subtitle="Customize your dashboard theme"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-tokio-bg flex items-center justify-center text-tokio-muted">
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <div className="font-medium text-tokio-text">{theme === "dark" ? "Dark mode" : "Light mode"}</div>
                <div className="text-sm text-tokio-muted">
                  {theme === "dark" ? "Easier on the eyes at night" : "Clean and bright"}
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </SettingCard>

        {/* Print Bridge */}
        <SettingCard
          icon={Printer}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          title="Print Bridge"
          subtitle="Recommended for Mac (Epson TM-U220, etc)"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-tokio-muted">Status</span>
              <StatusBadge connected={bridgeConnected} label={bridgeConnected ? "Ready" : "Not configured"} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tokio-muted">Bridge URL</label>
              <input
                type="text"
                value={bridgeUrl}
                onChange={handleBridgeUrlChange}
                placeholder="http://localhost:8765"
                className="w-full rounded-xl border border-tokio-border bg-tokio-bg px-4 py-2.5 text-sm text-tokio-text placeholder:text-tokio-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
              <p className="text-xs text-tokio-muted">Requires the local printer-bridge helper to be running.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tokio-muted">Printer Queue</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={bridgeQueue}
                    onChange={handleBridgeQueueChange}
                    className="w-full appearance-none rounded-xl border border-tokio-border bg-tokio-bg pl-4 pr-10 py-2.5 text-sm text-tokio-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  >
                    <option value="">Select a printer...</option>
                    {bridgeQueue && !bridgePrinters.includes(bridgeQueue) && (
                      <option value={bridgeQueue}>{bridgeQueue}</option>
                    )}
                    {bridgePrinters.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tokio-muted"
                  />
                </div>
                <button
                  onClick={handleRefreshPrinters}
                  disabled={loadingPrinters}
                  className="flex items-center justify-center gap-2 rounded-xl border border-tokio-border bg-tokio-panel px-3 py-2.5 text-sm text-tokio-muted hover:bg-tokio-bg transition-all disabled:opacity-50 active:scale-95"
                  title="Refresh printer list"
                >
                  {loadingPrinters ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <RefreshCw size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleTestBridgePrint}
              disabled={testingBridge || !bridgeQueue}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20 active:scale-[0.98]"
            >
              {testingBridge ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
              Test Print
            </button>
          </div>
        </SettingCard>

        {/* WebUSB Fallback */}
        <SettingCard
          icon={LinkIcon}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          title="WebUSB Printer"
          subtitle="Direct USB connection fallback"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-tokio-muted">Status</span>
              {!webUSBSupported ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <AlertTriangle size={12} />
                  Not supported
                </span>
              ) : printer ? (
                <StatusBadge connected={true} label={printer.productName || "Connected"} />
              ) : (
                <StatusBadge connected={false} label="Disconnected" />
              )}
            </div>

            {!webUSBSupported && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="flex items-start gap-2 text-red-700 text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  WebUSB requires Chrome or Edge on desktop.
                </p>
              </div>
            )}

            {webUSBSupported && (
              <div className="flex gap-2">
                {!printer ? (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 text-sm font-semibold transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm shadow-blue-500/20"
                  >
                    {connecting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                    Connect Printer
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleTestPrint}
                      disabled={testing}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 text-sm font-semibold transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm shadow-blue-500/20"
                    >
                      {testing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Test Print
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center justify-center gap-2 rounded-xl border border-tokio-border bg-tokio-panel px-4 py-3 text-sm font-medium text-tokio-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-[0.98]"
                    >
                      <Unplug size={16} />
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </SettingCard>

        {/* Google Sheets Sync */}
        <SettingCard
          icon={FileSpreadsheet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          title="Google Sheets Sync"
          subtitle="Push data to your spreadsheet automatically"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tokio-muted">Spreadsheet URL</label>
              <input
                type="text"
                value={sheetsUrl}
                onChange={handleSheetsUrlChange}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full rounded-xl border border-tokio-border bg-tokio-bg px-4 py-2.5 text-sm text-tokio-text placeholder:text-tokio-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all"
              />
              <p className="text-xs text-tokio-muted">
                Leave blank to use <code className="bg-tokio-bg px-1.5 py-0.5 rounded text-tokio-muted font-mono text-[10px]">SHEETS_SPREADSHEET_ID</code> from server <code className="bg-tokio-bg px-1.5 py-0.5 rounded text-tokio-muted font-mono text-[10px]">.env</code>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSyncStock}
                disabled={syncingStock}
                className="flex items-center justify-center gap-2 rounded-xl border border-tokio-border bg-tokio-panel px-3 py-3 text-sm font-medium text-tokio-muted hover:bg-tokio-bg hover:border-tokio-muted transition-all disabled:opacity-40 active:scale-[0.98]"
              >
                {syncingStock ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <Package size={14} className="text-tokio-muted" />}
                Sync Stock
              </button>
              <button
                onClick={handleSyncTransactions}
                disabled={syncingTx}
                className="flex items-center justify-center gap-2 rounded-xl border border-tokio-border bg-tokio-panel px-3 py-3 text-sm font-medium text-tokio-muted hover:bg-tokio-bg hover:border-tokio-muted transition-all disabled:opacity-40 active:scale-[0.98]"
              >
                {syncingTx ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <Receipt size={14} className="text-tokio-muted" />}
                Sync Transactions
              </button>
            </div>

            <button
              onClick={handleSyncOverview}
              disabled={syncingOverview}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-3 text-sm font-semibold transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm shadow-emerald-500/20"
            >
              {syncingOverview ? <Loader2 size={15} className="animate-spin" /> : <BarChart3 size={15} />}
              Sync Overview + Charts
            </button>
          </div>
        </SettingCard>
      </div>

      {/* Bottom info */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Zap size={16} />
        </div>
        <div>
          <div className="font-medium text-blue-900 text-sm">Pro tip</div>
          <p className="text-sm text-blue-600/80 mt-0.5">
            Use the Print Bridge for the most reliable thermal printing experience. WebUSB is a fallback and may not work in all browsers.
          </p>
        </div>
      </div>
    </div>
  );
}
