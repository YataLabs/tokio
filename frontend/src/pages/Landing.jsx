import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Coffee,
  CreditCard,
  Package,
  Printer,
  Receipt,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Timer,
  TrendingUp,
  UserCog,
  UtensilsCrossed,
  Wallet,
  Zap,
  Play,
  ArrowUpRight,
  Sparkles,
  Lock,
  Globe,
  Headphones,
  HelpCircle,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  ChevronRight,
  Minus,
  Quote,
} from "lucide-react";
import MarketingHeader from "../components/MarketingHeader";
import MarketingFooter from "../components/MarketingFooter";
import Reveal from "../components/Reveal";

const features = [
  {
    title: "Inventory Management",
    desc: "Track stock levels in real-time, add new products, adjust quantities, and get low-stock alerts — all from one place.",
    icon: Package,
    color: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "Cashier Flow",
    desc: "Open a daily capital session, take cash/QRIS/card payments, get automatic change calculation, and top up mid-day.",
    icon: ShoppingCart,
    color: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "Sales Analytics",
    desc: "See daily totals broken down by payment method, track trends over time, and reconcile your cash drawer in seconds.",
    icon: BarChart3,
    color: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    title: "Thermal Receipts",
    desc: "Print directly to your USB thermal printer with one click — no print dialogs, no wasted paper, no delays.",
    icon: Printer,
    color: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "Multi-Payment Support",
    desc: "Accept cash, QRIS, debit, and credit cards — all recorded and reconciled automatically in your reports.",
    icon: CreditCard,
    color: "from-rose-500/20 to-pink-500/20",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
  {
    title: "Daily Reports",
    desc: "Get a clear picture of daily, weekly, and monthly performance across your store with just a few clicks.",
    icon: ClipboardList,
    color: "from-indigo-500/20 to-blue-500/20",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
  {
    title: "Multi-Business Management",
    desc: "Run multiple stores from one platform — each with isolated stock, transactions, and team members.",
    icon: Store,
    color: "from-cyan-500/20 to-sky-500/20",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
  {
    title: "Role-Based Security",
    desc: "Give owners, cashiers, and admins exactly the permissions they need. Nothing more, nothing less.",
    icon: UserCog,
    color: "from-fuchsia-500/20 to-purple-500/20",
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-500",
  },
  {
    title: "Subscription Control",
    desc: "Set expiration dates per user and automatically block access when a subscription lapses — perfect for SaaS operators.",
    icon: Timer,
    color: "from-lime-500/20 to-green-500/20",
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-500",
  },
];

const stats = [
  { value: "10k+", label: "Transactions Processed", suffix: "daily" },
  { value: "99.9%", label: "Platform Uptime", suffix: "guaranteed" },
  { value: "<1s", label: "Average Checkout", suffix: "per transaction" },
  { value: "24/7", label: "Dashboard Access", suffix: "worldwide" },
];

const testimonials = [
  {
    quote: "Closing the cashier used to take 20 minutes of manual counting. Now it's automatic and matches every time. The time savings alone make this invaluable.",
    name: "Sari W.",
    role: "Owner, Warung Sari Rasa",
    location: "Jakarta",
    rating: 5,
  },
  {
    quote: "The thermal printer integration alone saved us hours every week. Customers get their receipts instantly, and we never have to deal with paper jams anymore.",
    name: "Budi P.",
    role: "Manager, Toko Budi Jaya",
    location: "Surabaya",
    rating: 5,
  },
  {
    quote: "Multi-business support lets me manage all three of my stores from a single login. Stock, sales, and staff — all in one view. Absolute game changer.",
    name: "Lina M.",
    role: "Founder, Lina Mart Group",
    location: "Bandung",
    rating: 5,
  },
];

const solutions = [
  { title: "Retail Stores", desc: "Full stock tracking, barcode-ready item lists, and fast checkout flows.", icon: ShoppingBag, color: "bg-blue-500", bgColor: "bg-blue-500/5", borderColor: "border-blue-500/20" },
  { title: "Restaurants & F&B", desc: "Handle orders, split payments, and manage busy-hour rushes with ease.", icon: UtensilsCrossed, color: "bg-orange-500", bgColor: "bg-orange-500/5", borderColor: "border-orange-500/20" },
  { title: "Cafes & Coffee Shops", desc: "Quick counter checkout built for high-volume, fast-moving lines.", icon: Coffee, color: "bg-amber-500", bgColor: "bg-amber-500/5", borderColor: "border-amber-500/20" },
  { title: "Salons & Services", desc: "Track service sales alongside retail products in one unified system.", icon: Scissors, color: "bg-pink-500", bgColor: "bg-pink-500/5", borderColor: "border-pink-500/20" },
  { title: "Mini Markets", desc: "Manage large inventories, multiple cashiers, and shift-based operations.", icon: Store, color: "bg-emerald-500", bgColor: "bg-emerald-500/5", borderColor: "border-emerald-500/20" },
];

const faqs = [
  {
    q: "Do I need special hardware to use Tokio?",
    a: "No. Tokio runs in any modern browser on any computer or tablet. A USB thermal printer is optional — connect one via our Print Bridge for instant receipt printing without the browser dialog.",
  },
  {
    q: "Can I manage more than one store?",
    a: "Absolutely. Platform admins can create multiple businesses, each with fully isolated stock, transactions, cashier accounts, and reporting — all under one login.",
  },
  {
    q: "How does the daily cashier session work?",
    a: "Each day a cashier opens a session with starting capital (modal harian), can top it up mid-day if needed, and closes it at end of day — either manually or automatically at midnight.",
  },
  {
    q: "What payment methods are supported?",
    a: "Cash, QRIS, debit, and credit. Cash payments automatically calculate change (kembalian), and all methods are reconciled in your reports.",
  },
];

const steps = [
  {
    title: "Set up your inventory",
    desc: "Add your products, prices, and starting stock levels in just minutes.",
    icon: Package,
  },
  {
    title: "Open your cashier session",
    desc: "Input daily capital, assign a cashier, and start taking orders.",
    icon: Wallet,
  },
  {
    title: "Sell and track everything",
    desc: "Every transaction, item, and payment is recorded automatically in real time.",
    icon: ShoppingCart,
  },
  {
    title: "Review your performance",
    desc: "Check daily sales, top items, stock value, and trends from one dashboard.",
    icon: BarChart3,
  },
];

const comparisonFeatures = [
  { feature: "Real-time inventory tracking", old: false, new: true },
  { feature: "Multi-payment support (Cash/QRIS/Card)", old: false, new: true },
  { feature: "Automatic daily reports", old: false, new: true },
  { feature: "Thermal printer integration", old: false, new: true },
  { feature: "Multi-store management", old: false, new: true },
  { feature: "Role-based access control", old: false, new: true },
  { feature: "Cloud-based dashboard", old: false, new: true },
  { feature: "Works on any device", old: false, new: true },
];

const trustedLogos = [
  "Retail Indonesia", "F&B Weekly", "TechInAsia", "StartupJakarta", "Bisnis.com",
];

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
    </div>
  );
}

function FloatingBadge({ icon: Icon, text, className, delay = 0 }) {
  return (
    <div
      className={`absolute flex items-center gap-2 bg-tokio-panel/80 backdrop-blur-sm border border-tokio-border/50 rounded-full px-4 py-2 shadow-lg shadow-black/5 animate-float ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon size={16} className="text-blue-500" />
      <span className="text-sm font-medium text-tokio-text">{text}</span>
    </div>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-tokio-bg text-tokio-text relative overflow-x-hidden">
      <AnimatedBackground />
      <MarketingHeader />

      <main className="relative z-10">
        {/* HERO */}
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm text-blue-700 mb-6 backdrop-blur-sm">
                  <Sparkles size={14} className="text-blue-500" />
                  Built for small & growing businesses in Indonesia
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1]">
                  The point-of-sale system that{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-blue-600">runs your whole store</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-200/60 -rotate-1 rounded-sm" />
                  </span>
                </h1>

                <p className="text-lg text-tokio-muted max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Manage inventory, run cashier sessions, and track every transaction
                  and payment method — all from one clean, reliable dashboard. No hardware required.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    Get Started Free
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#demo"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group inline-flex items-center gap-2 rounded-xl border border-tokio-border bg-tokio-panel hover:bg-tokio-bg px-8 py-4 text-lg font-semibold transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    <Play size={18} className="text-tokio-muted" />
                    Watch Demo
                  </a>
                </div>

                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-tokio-muted">
                    <span className="font-semibold text-tokio-text">500+</span> businesses trust us
                  </div>
                </div>
              </div>

              {/* Right Column - Interactive Dashboard Preview */}
              <div className="relative">
                <FloatingBadge icon={Zap} text="Live sync" className="top-0 -left-4 z-20" delay={0} />
                <FloatingBadge icon={ShieldCheck} text="Bank-grade security" className="bottom-12 -right-4 z-20" delay={500} />
                <FloatingBadge icon={Clock} text="Real-time updates" className="top-1/2 -right-8 z-20 hidden lg:flex" delay={1000} />

                <div className="relative animate-float">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

                  <div className="relative rounded-2xl bg-tokio-panel border border-tokio-border shadow-2xl shadow-black/10 overflow-hidden">
                    {/* Window Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-tokio-border bg-tokio-bg/50">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 text-center text-xs text-tokio-muted font-medium">Tokio Dashboard</div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-5">
                        <span className="font-bold text-tokio-text">Today's Summary</span>
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-4">
                          <div className="text-xs text-blue-600/70 mb-1 font-medium">Total Sales</div>
                          <div className="text-2xl font-bold text-blue-700">Rp 2.450.000</div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                            <TrendingUp size={12} />
                            +12.5% from yesterday
                          </div>
                        </div>
                        <div className="rounded-xl bg-tokio-bg border border-tokio-border p-4">
                          <div className="text-xs text-tokio-muted mb-1 font-medium">Transactions</div>
                          <div className="text-2xl font-bold text-tokio-text">128</div>
                          <div className="text-xs text-tokio-muted mt-1">32 customers today</div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-tokio-bg border border-tokio-border p-4 space-y-3">
                        <div className="text-xs font-semibold text-tokio-muted uppercase tracking-wider mb-1">Payment Methods</div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 text-sm text-tokio-muted">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <Wallet size={14} className="text-emerald-600" />
                            </div>
                            Cash
                          </span>
                          <span className="font-semibold text-tokio-text">Rp 1.200.000</span>
                        </div>
                        <div className="h-px bg-tokio-border" />
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 text-sm text-tokio-muted">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <CreditCard size={14} className="text-blue-600" />
                            </div>
                            QRIS
                          </span>
                          <span className="font-semibold text-tokio-text">Rp 950.000</span>
                        </div>
                        <div className="h-px bg-tokio-border" />
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 text-sm text-tokio-muted">
                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                              <Receipt size={14} className="text-violet-600" />
                            </div>
                            Debit
                          </span>
                          <span className="font-semibold text-tokio-text">Rp 300.000</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 text-blue-700 px-4 py-3 text-sm font-medium border border-blue-100">
                        <Printer size={16} className="text-blue-500" />
                        Receipt sent to thermal printer
                        <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted By */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20">
            <div className="text-center mb-8">
              <p className="text-sm text-tokio-muted font-medium uppercase tracking-wider">Trusted by leading businesses</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-40">
              {trustedLogos.map((logo) => (
                <div key={logo} className="text-lg font-bold text-tokio-muted hover:text-tokio-muted transition-colors cursor-default">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section id="stats" className="relative border-y border-tokio-border bg-tokio-panel/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 100}>
                  <div className="text-center group">
                    <div className="text-4xl lg:text-5xl font-extrabold text-blue-600 mb-1 group-hover:scale-110 transition-transform inline-block">
                      {s.value}
                    </div>
                    <div className="text-sm font-semibold text-tokio-text">{s.label}</div>
                    <div className="text-xs text-tokio-muted mt-0.5">{s.suffix}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS FOR EVERY BUSINESS */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-600 px-4 py-1.5 text-sm font-medium mb-4">
              <Store size={14} />
              For Every Business Type
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Built for every kind of business</h2>
            <p className="text-tokio-muted text-lg">
              Whatever you sell, Tokio adapts to your counter and your workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {solutions.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 80}
                className={`group rounded-2xl ${s.bgColor} border ${s.borderColor} p-6 text-center hover:shadow-xl hover:shadow-${s.color}/10 hover:-translate-y-1 transition-all duration-300 cursor-default`}
              >
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${s.color} text-white mb-5 mx-auto shadow-lg shadow-${s.color}/30 group-hover:scale-110 transition-transform`}>
                  <s.icon size={24} />
                </div>
                <h3 className="font-bold text-tokio-text mb-2">{s.title}</h3>
                <p className="text-sm text-tokio-muted leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* BEFORE / AFTER COMPARISON */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-tokio-bg to-tokio-panel" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 text-red-600 px-4 py-1.5 text-sm font-medium mb-4">
                  <Minus size={14} />
                  The Old Way
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-6 text-tokio-text">
                  Stop fighting with spreadsheets and manual counting
                </h2>
                <p className="text-tokio-muted text-lg mb-8">
                  Running a store shouldn't mean staying late to count cash, reconcile stock, or hunt for lost receipts.
                </p>

                <div className="space-y-4">
                  {comparisonFeatures.map((item, i) => (
                    <div
                      key={item.feature}
                      className="flex items-center gap-4 p-3 rounded-xl bg-tokio-panel border border-tokio-border shadow-sm"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <span className="font-medium text-tokio-text">{item.feature}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-tokio-muted line-through">Manual</span>
                        <ArrowRight size={14} className="text-tokio-muted" />
                        <span className="text-emerald-600 font-semibold">Automated</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-tokio-panel rounded-2xl border border-tokio-border shadow-xl p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-tokio-text mb-2">Time Saved Per Day</h3>
                    <p className="text-tokio-muted text-sm">Average across all Tokio users</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-tokio-muted">Manual cashier close</span>
                        <span className="text-red-500 font-semibold">25 min</span>
                      </div>
                      <div className="h-3 bg-tokio-bg rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full w-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-tokio-muted">Stock reconciliation</span>
                        <span className="text-red-500 font-semibold">18 min</span>
                      </div>
                      <div className="h-3 bg-tokio-bg rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full w-[72%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-tokio-muted">Report generation</span>
                        <span className="text-red-500 font-semibold">12 min</span>
                      </div>
                      <div className="h-3 bg-tokio-bg rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full w-[48%]" />
                      </div>
                    </div>
                    <div className="h-px bg-tokio-bg" />
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-tokio-text font-semibold">With Tokio</span>
                        <span className="text-emerald-600 font-bold">2 min</span>
                      </div>
                      <div className="h-3 bg-tokio-bg rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[8%] animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Clock size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-800">Save 53 minutes daily</div>
                        <div className="text-sm text-emerald-600">That's 22 hours per month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 text-violet-600 px-4 py-1.5 text-sm font-medium mb-4">
              <Zap size={14} />
              Powerful Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Everything you need to run the floor</h2>
            <p className="text-tokio-muted text-lg">
              From stock management to end-of-day reporting, Tokio covers the full lifecycle of your retail operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 100}
                className="group relative rounded-2xl bg-tokio-panel border border-tokio-border p-7 shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${f.iconBg} ${f.iconColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-tokio-text mb-2">{f.title}</h3>
                  <p className="text-tokio-muted leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS - Interactive Steps */}
        <section id="how-it-works" className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-tokio-panel to-tokio-bg" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-600 px-4 py-1.5 text-sm font-medium mb-4">
                <ArrowUpRight size={14} />
                Simple Setup
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Up and running in four steps</h2>
              <p className="text-tokio-muted text-lg">
                No complicated setup — start taking orders the same day.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Interactive Steps */}
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className={`group relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 ${
                      activeStep === i
                        ? "bg-tokio-panel border-blue-200 shadow-lg shadow-blue-500/10"
                        : "bg-tokio-panel/50 border-tokio-border hover:border-tokio-muted"
                    }`}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-all duration-300 ${
                          activeStep === i
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                            : "bg-tokio-bg text-tokio-muted group-hover:bg-blue-50 group-hover:text-blue-500"
                        }`}
                      >
                        {activeStep === i ? (
                          <step.icon size={22} />
                        ) : (
                          <span className="font-bold text-lg">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg mb-1 transition-colors ${
                            activeStep === i ? "text-blue-600 dark:text-blue-400" : "text-tokio-text"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-sm leading-relaxed transition-colors ${
                            activeStep === i ? "text-blue-600/80" : "text-tokio-muted"
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        className={`shrink-0 transition-all duration-300 ${
                          activeStep === i
                            ? "text-blue-500 translate-x-1"
                            : "text-tokio-muted group-hover:text-tokio-muted"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Preview */}
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-tokio-panel rounded-2xl border border-tokio-border shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        {(() => { const StepIcon = steps[activeStep].icon; return <StepIcon size={20} className="text-blue-600" />; })()}
                      </div>
                      <div>
                        <div className="font-bold text-tokio-text">Step {activeStep + 1}</div>
                        <div className="text-sm text-tokio-muted">{steps[activeStep].title}</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {steps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            activeStep === i ? "bg-blue-600 w-6" : "bg-tokio-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="aspect-video rounded-xl bg-tokio-bg border border-tokio-border flex items-center justify-center overflow-hidden">
                    {activeStep === 0 && (
                      <div className="w-full p-6 space-y-3">
                        <div className="h-8 bg-blue-100 rounded-lg w-1/3 mb-4" />
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-tokio-border shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-tokio-border rounded w-3/4" />
                              <div className="h-2 bg-tokio-bg rounded w-1/2" />
                            </div>
                            <div className="h-6 bg-emerald-100 rounded w-16" />
                          </div>
                        ))}
                        <div className="flex justify-end mt-4">
                          <div className="h-8 bg-blue-500 rounded-lg w-24" />
                        </div>
                      </div>
                    )}
                    {activeStep === 1 && (
                      <div className="w-full p-6">
                        <div className="h-8 bg-blue-100 rounded-lg w-1/3 mb-4" />
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="text-xs text-emerald-600 mb-1">Starting Capital</div>
                            <div className="text-lg font-bold text-emerald-700">Rp 500.000</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-xs text-blue-600 mb-1">Cashier</div>
                            <div className="text-lg font-bold text-blue-700">Ahmad S.</div>
                          </div>
                        </div>
                        <div className="h-10 bg-blue-500 rounded-lg w-full flex items-center justify-center text-white font-medium text-sm">
                          Open Session
                        </div>
                      </div>
                    )}
                    {activeStep === 2 && (
                      <div className="w-full p-6">
                        <div className="h-8 bg-blue-100 rounded-lg w-1/3 mb-4" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-tokio-bg rounded-lg border border-tokio-border">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-sm text-tokio-muted">Transaction #128</span>
                            </div>
                            <span className="text-sm font-semibold text-tokio-text">Rp 125.000</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-tokio-bg rounded-lg border border-tokio-border">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-sm text-tokio-muted">Transaction #129</span>
                            </div>
                            <span className="text-sm font-semibold text-tokio-text">Rp 87.500</span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-center text-sm text-blue-600 font-medium">
                          Auto-synced to dashboard
                        </div>
                      </div>
                    )}
                    {activeStep === 3 && (
                      <div className="w-full p-6">
                        <div className="h-8 bg-blue-100 rounded-lg w-1/3 mb-4" />
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-xs text-blue-600 mb-1">Total Sales</div>
                            <div className="text-lg font-bold text-blue-700">Rp 2.4M</div>
                          </div>
                          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                            <div className="text-xs text-violet-600 mb-1">Top Item</div>
                            <div className="text-lg font-bold text-violet-700">Kopi Latte</div>
                          </div>
                        </div>
                        <div className="h-24 bg-tokio-bg rounded-lg w-full flex items-end justify-around px-4 pb-2 gap-2">
                          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                            <div
                              key={i}
                              className="w-full bg-blue-400/60 rounded-t-sm"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEVICE COMPATIBILITY */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-tokio-bg text-tokio-muted px-4 py-1.5 text-sm font-medium mb-4">
              <Globe size={14} />
              Works Everywhere
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Use any device, anywhere</h2>
            <p className="text-tokio-muted text-lg">
              Access your dashboard from your laptop, tablet, or phone. No installation required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Monitor, title: "Desktop", desc: "Full dashboard experience with all features and reports.", color: "from-blue-500 to-blue-600" },
              { icon: Tablet, title: "Tablet", desc: "Perfect for counter use and mobile inventory checks.", color: "from-purple-500 to-purple-600" },
              { icon: Smartphone, title: "Phone", desc: "Quick access to sales data and alerts on the go.", color: "from-emerald-500 to-emerald-600" },
            ].map((device, i) => (
              <Reveal key={device.title} delay={i * 100}>
                <div className="group text-center p-8 rounded-2xl bg-tokio-panel border border-tokio-border hover:border-tokio-muted hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${device.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <device.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-tokio-text mb-2">{device.title}</h3>
                  <p className="text-tokio-muted">{device.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-tokio-panel" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-600 px-4 py-1.5 text-sm font-medium mb-4">
                <Star size={14} />
                Loved by Businesses
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Built for businesses like yours</h2>
              <p className="text-tokio-muted text-lg">
                Owners and managers use Tokio every day to keep their stores running smoothly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Reveal
                  key={t.name}
                  delay={i * 100}
                  className="group relative rounded-2xl bg-tokio-panel border border-tokio-border p-7 shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute top-6 right-6 text-tokio-border group-hover:text-blue-100 transition-colors">
                    <Quote size={40} />
                  </div>

                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-tokio-text mb-6 leading-relaxed relative z-10">
                    "{t.quote}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-tokio-text text-sm">{t.name}</div>
                      <div className="text-sm text-tokio-muted">{t.role}</div>
                    </div>
                    <div className="ml-auto text-xs text-tokio-muted bg-tokio-bg px-2 py-1 rounded-full">
                      {t.location}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-tokio-panel to-tokio-bg" />
          <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-tokio-bg text-tokio-muted px-4 py-1.5 text-sm font-medium mb-4">
                <HelpCircle size={14} />
                Common Questions
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Frequently asked questions</h2>
              <p className="text-tokio-muted text-lg">Everything you need to know before getting started.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal
                  key={faq.q}
                  delay={i * 60}
                  className="rounded-2xl bg-tokio-panel border border-tokio-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-tokio-text hover:bg-tokio-bg/50 transition-colors"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        openFaq === i ? "bg-blue-100 text-blue-600 rotate-180" : "bg-tokio-bg text-tokio-muted"
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-tokio-muted leading-relaxed border-t border-tokio-border animate-[fade-in-up_0.3s_ease-out]">
                      <p className="pt-4">{faq.a}</p>
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <Reveal>
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-tokio-panel rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-tokio-panel rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
                  <Zap size={14} />
                  Start for free today
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                  Ready to modernize your cashier flow?
                </h2>
                <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">
                  Sign in to your dashboard and start managing stock, sales, and daily capital today. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 rounded-xl bg-tokio-panel text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <CheckCircle2 size={20} />
                    Join Now — It's Free
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <Lock size={14} />
                    Secure signup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    2-minute setup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Headphones size={14} />
                    24/7 support
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <MarketingFooter />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
