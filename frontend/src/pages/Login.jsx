import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CreditCard, Eye, EyeOff, Loader2, Lock, Mail, Printer, Wallet } from "lucide-react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tokio-bg text-tokio-text p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-tokio-border bg-tokio-panel">
        {/* Form panel */}
        <div className="p-8 sm:p-12 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <Logo size={44} />
            <ThemeToggle />
          </div>

          <h1 className="text-3xl font-extrabold mb-1">Welcome Back</h1>
          <p className="text-tokio-muted mb-8 text-sm">
            Enter your email and password to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tokio-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border pl-9 pr-3 py-2.5 text-tokio-text focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                  placeholder="owner@tokio.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tokio-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border pl-9 pr-9 py-2.5 text-tokio-text focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tokio-muted hover:text-tokio-text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-tokio-danger text-sm">
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-4 py-2.5 font-semibold shadow-md transition disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-tokio-muted text-center mt-8">
            Tokio — point-of-sale for your whole store.
          </p>
        </div>

        {/* Visual panel */}
        <div className="hidden lg:flex relative flex-col justify-between bg-linear-to-br from-tokio-blue to-tokio-blue-dark text-white p-12 overflow-hidden">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight mb-3">
              Effortlessly manage your stock, sales, and cashier sessions.
            </h2>
            <p className="text-white/80">
              Log in to access your dashboard and keep your store running smoothly.
            </p>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative rounded-2xl bg-tokio-panel text-tokio-text border border-tokio-border shadow-xl p-5 mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm">Today's Summary</span>
              <span className="flex items-center gap-1 text-xs text-tokio-success">
                <span className="w-1.5 h-1.5 rounded-full bg-tokio-success" />
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-tokio-bg border border-tokio-border p-3">
                <div className="text-xs text-tokio-muted mb-1">Total Sales</div>
                <div className="text-xl font-bold text-tokio-blue">Rp 2.450.000</div>
              </div>
              <div className="rounded-xl bg-tokio-bg border border-tokio-border p-3">
                <div className="text-xs text-tokio-muted mb-1">Transactions</div>
                <div className="text-xl font-bold">128</div>
              </div>
            </div>
            <div className="rounded-xl bg-tokio-bg border border-tokio-border p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-tokio-muted">
                  <Wallet size={14} /> Cash
                </span>
                <span className="font-medium">Rp 1.200.000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-tokio-muted">
                  <CreditCard size={14} /> QRIS
                </span>
                <span className="font-medium">Rp 950.000</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-tokio-blue/10 text-tokio-blue px-3 py-2 text-sm font-medium">
              <Printer size={16} />
              Receipt sent to thermal printer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
