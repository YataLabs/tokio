import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Calculator,
  Minus,
  Plus,
  Receipt,
  TrendingUp,
  Headphones,
  HelpCircle,
  ChevronDown,
  Star,
  BadgeCheck,
  RotateCcw,
  ReceiptText,
  Lock,
  Printer,
  BarChart3,
  CreditCard,
  Store,
  Timer,
  UserCog,
} from "lucide-react";
import MarketingHeader from "../components/MarketingHeader";
import MarketingFooter from "../components/MarketingFooter";
import Reveal from "../components/Reveal";

const faqs = [
  {
    q: "What counts as an account?",
    a: "An account is any user who logs into the Tokio dashboard — whether they're an owner, admin, or cashier. Each person needs their own login credentials.",
  },
  {
    q: "Can I add or remove accounts mid-month?",
    a: "Yes. You can add or remove accounts at any time. Billing is prorated, so you only pay for what you use.",
  },
  {
    q: "Is there a setup fee or hidden cost?",
    a: "No setup fees, no hidden costs. You pay exactly Rp 100.000 per active account per month. That's it.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfer (BCA, Mandiri, BRI), QRIS, and credit/debit card for subscription payments.",
  },
  {
    q: "Do I need to pay for every store location?",
    a: "No. One account can manage multiple business locations. You only pay per user account, not per store.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no long-term contracts. Cancel anytime and you won't be billed for the next cycle.",
  },
];

const features = [
  { icon: ReceiptText, label: "Full dashboard access", desc: "Stock, cashier, transactions, reports" },
  { icon: Clock, label: "Cashier sessions", desc: "Modal harian with top-up support" },
  { icon: CreditCard, label: "Multi-payment", desc: "Cash, QRIS, debit, credit" },
  { icon: Printer, label: "Thermal printing", desc: "One-click receipt printing" },
  { icon: BarChart3, label: "Sales reports", desc: "Date-range analytics & trends" },
  { icon: Store, label: "Multi-business", desc: "Manage multiple stores per account" },
  { icon: UserCog, label: "Role-based access", desc: "Owner, admin, cashier permissions" },
  { icon: Timer, label: "Expiration control", desc: "Automatic subscription management" },
];

const testimonials = [
  {
    quote: "Finally, a POS system that doesn't charge me per store. I manage 3 locations with 5 accounts and pay exactly what I expect.",
    name: "Dewi K.",
    role: "Owner, Kopi Dewi Chain",
  },
  {
    quote: "We started with 2 accounts and scaled to 12 as we grew. The per-account pricing made it easy to budget at every stage.",
    name: "Rudi H.",
    role: "Manager, Rudi Mart Group",
  },
];

export default function Pricing() {
  const [accountCount, setAccountCount] = useState(3);
  const [openFaq, setOpenFaq] = useState(0);

  const pricePerAccount = 100000;
  const totalPrice = accountCount * pricePerAccount;

  const decrement = () => setAccountCount((c) => Math.max(1, c - 1));
  const increment = () => setAccountCount((c) => Math.min(100, c + 1));

  const formatPrice = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="min-h-screen bg-tokio-bg text-tokio-text relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <MarketingHeader />

        <main>
          {/* HERO */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-600 px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles size={14} />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight">
              Pay per account.{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-blue-600">No surprises.</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-200/60 -rotate-1 rounded-sm" />
              </span>
            </h1>
            <p className="text-lg text-tokio-muted max-w-2xl mx-auto leading-relaxed">
              One flat price per account. No tiers, no hidden fees, no lock-in contracts. 
              Add or remove accounts anytime — you're always in control.
            </p>
          </section>

          {/* PRICING CALCULATOR + CARD */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Interactive Calculator */}
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 text-violet-600 px-4 py-1.5 text-sm font-medium mb-4">
                  <Calculator size={14} />
                  Live Price Calculator
                </div>
                <h2 className="text-2xl font-bold text-tokio-text mb-2">Calculate your monthly cost</h2>
                <p className="text-tokio-muted mb-8">
                  Drag the slider or use the buttons to see exactly how much you'll pay.
                </p>

                <div className="bg-tokio-panel rounded-2xl border border-tokio-border shadow-lg p-6 lg:p-8 mb-6">
                  {/* Account Counter */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-tokio-muted font-medium">Number of accounts</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={decrement}
                        className="w-10 h-10 rounded-xl bg-tokio-bg hover:bg-tokio-border flex items-center justify-center transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-2xl font-bold text-tokio-text w-12 text-center">
                        {accountCount}
                      </span>
                      <button
                        onClick={increment}
                        className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="mb-8">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={accountCount}
                      onChange={(e) => setAccountCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-tokio-border rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-tokio-muted mt-2">
                      <span>1 account</span>
                      <span>50 accounts</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 p-4 bg-tokio-bg rounded-xl border border-tokio-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-tokio-muted">{accountCount} account{accountCount > 1 ? "s" : ""} × Rp 100.000</span>
                      <span className="font-medium text-tokio-text">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-tokio-muted">Setup fee</span>
                      <span className="font-medium text-emerald-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-tokio-muted">Platform fee</span>
                      <span className="font-medium text-emerald-600">Free</span>
                    </div>
                    <div className="h-px bg-tokio-border" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-tokio-text">Total per month</span>
                      <span className="text-2xl font-extrabold text-blue-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Scenarios */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 1, label: "Solo owner", desc: "Rp 100.000/mo" },
                    { count: 3, label: "Small team", desc: "Rp 300.000/mo" },
                    { count: 10, label: "Growing business", desc: "Rp 1.000.000/mo" },
                  ].map((s) => (
                    <button
                      key={s.count}
                      onClick={() => setAccountCount(s.count)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                        accountCount === s.count
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-tokio-panel border-tokio-border hover:border-tokio-muted"
                      }`}
                    >
                      <div className={`font-bold text-sm ${accountCount === s.count ? "text-blue-700" : "text-tokio-text"}`}>
                        {s.label}
                      </div>
                      <div className="text-xs text-tokio-muted mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Pricing Card */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-3xl blur-2xl" />

                  <div className="relative bg-tokio-panel rounded-2xl border border-tokio-border shadow-xl overflow-hidden">
                    {/* Popular badge */}
                    <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2 text-sm font-semibold flex items-center gap-2">
                      <Zap size={16} />
                      Our Only Plan — Every Feature Included
                    </div>

                    <div className="p-6 lg:p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-tokio-text">Pay Per Account</h3>
                          <p className="text-sm text-tokio-muted mt-1">One price, all features, no limits.</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold text-blue-600">Rp 100.000</div>
                          <div className="text-sm text-tokio-muted">/ account / month</div>
                        </div>
                      </div>

                      <div className="h-px bg-tokio-bg mb-6" />

                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {features.map((f) => {
                          const FIcon = f.icon;
                          return (
                          <div key={f.label} className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                              <FIcon size={14} className="text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-tokio-text">{f.label}</div>
                              <div className="text-xs text-tokio-muted">{f.desc}</div>
                            </div>
                          </div>
                        );
                        })}
                      </div>

                      <Link
                        to="/login"
                        className="group flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-6 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                      >
                        Get Started Free
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </Link>

                      <div className="mt-4 flex items-center justify-center gap-1 text-sm text-tokio-muted">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        No credit card required to start
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2.5 rounded-xl bg-tokio-panel border border-tokio-border p-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <RotateCcw size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-tokio-text">Cancel anytime</div>
                      <div className="text-xs text-tokio-muted">No long-term contracts</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-tokio-panel border border-tokio-border p-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Receipt size={16} className="text-blue-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-tokio-text">Prorated billing</div>
                      <div className="text-xs text-tokio-muted">Pay only for what you use</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-tokio-panel border border-tokio-border p-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <TrendingUp size={16} className="text-amber-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-tokio-text">Scale up or down</div>
                      <div className="text-xs text-tokio-muted">Add accounts instantly</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-tokio-panel border border-tokio-border p-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Headphones size={16} className="text-violet-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-tokio-text">24/7 Support</div>
                      <div className="text-xs text-tokio-muted">Chat & email included</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMPARISON TABLE */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-600 px-4 py-1.5 text-sm font-medium mb-4">
                <BadgeCheck size={14} />
                Everything Included
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">One plan. All features.</h2>
              <p className="text-tokio-muted text-lg">
                We don't gate features behind expensive tiers. Every account gets everything.
              </p>
            </div>

            <div className="bg-tokio-panel rounded-2xl border border-tokio-border shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-tokio-bg/80 border-b border-tokio-border">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-tokio-muted">Feature</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-tokio-muted w-48">Other POS</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-blue-600 w-48 bg-blue-50/50">
                        <div className="flex items-center justify-center gap-1.5">
                          <Zap size={14} />
                          Tokio
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Inventory management", others: "Limited or extra", tokio: "Unlimited", included: true },
                      { name: "Cashier sessions (modal harian)", others: "Not available", tokio: "Full support", included: true },
                      { name: "Multi-payment (Cash/QRIS/Card)", others: "Partial", tokio: "All methods", included: true },
                      { name: "Thermal printer support", others: "Extra setup", tokio: "Built-in", included: true },
                      { name: "Sales reports & analytics", others: "Premium tier", tokio: "All accounts", included: true },
                      { name: "Multi-business management", others: "Extra per store", tokio: "Unlimited", included: true },
                      { name: "Role-based access control", others: "Premium tier", tokio: "All accounts", included: true },
                      { name: "Subscription expiration control", others: "Not available", tokio: "Built-in", included: true },
                      { name: "Cloud dashboard", others: "Extra", tokio: "Included", included: true },
                      { name: "Setup fee", others: "Rp 500K–2M", tokio: "Free", included: true },
                    ].map((row, i) => (
                      <tr
                        key={row.name}
                        className={`border-b border-tokio-border hover:bg-tokio-bg/50 transition-colors ${
                          i % 2 === 0 ? "bg-tokio-panel" : "bg-tokio-bg/30"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-tokio-text">{row.name}</td>
                        <td className="px-6 py-4 text-center text-sm text-tokio-muted">{row.others}</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-emerald-600 bg-blue-50/30">
                          <div className="flex items-center justify-center gap-1.5">
                            <Check size={14} />
                            {row.tokio}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-600 px-4 py-1.5 text-sm font-medium mb-4">
                <Star size={14} />
                Loved by Business Owners
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Simple pricing, happy teams</h2>
              <p className="text-tokio-muted text-lg">
                Hear from owners who switched to our per-account model.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonials.map((t, i) => (
                <Reveal
                  key={t.name}
                  delay={i * 100}
                  className="group relative rounded-2xl bg-tokio-panel border border-tokio-border p-7 shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-tokio-text mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-tokio-text text-sm">{t.name}</div>
                      <div className="text-sm text-tokio-muted">{t.role}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-tokio-bg text-tokio-muted px-4 py-1.5 text-sm font-medium mb-4">
                  <HelpCircle size={14} />
                  Billing Questions
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-tokio-text">Frequently asked questions</h2>
                <p className="text-tokio-muted text-lg">Everything you need to know about pricing and billing.</p>
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
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-white px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-tokio-panel rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-tokio-panel rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
                    <Zap size={14} />
                    Start your free trial today
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                    Ready to simplify your billing?
                  </h2>
                  <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">
                    Start with one account, add more as you grow. No setup fees, no hidden costs, no surprises.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-2 rounded-xl bg-tokio-panel text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <CheckCircle2 size={20} />
                      Get Started Free
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold transition-all"
                    >
                      <Headphones size={20} />
                      Contact Sales
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
                      <RotateCcw size={14} />
                      Cancel anytime
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
        `}</style>
      </div>
    </div>
  );
}
