import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import MarketingHeader from "../components/MarketingHeader";
import MarketingFooter from "../components/MarketingFooter";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    showToast("Thanks! We'll get back to you soon.", "success");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-tokio-bg text-tokio-text">
      <MarketingHeader />

      <main>
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">Get in touch</h1>
          <p className="text-lg text-tokio-muted max-w-2xl mx-auto">
            Questions about Tokio, pricing, or onboarding your store? Send us a message.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20 grid sm:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-5 flex items-start gap-3">
              <Mail size={20} className="text-tokio-blue mt-0.5" />
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-sm text-tokio-muted">support@tokio.com</div>
              </div>
            </div>
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-5 flex items-start gap-3">
              <Phone size={20} className="text-tokio-blue mt-0.5" />
              <div>
                <div className="font-semibold">Phone / WhatsApp</div>
                <div className="text-sm text-tokio-muted">+62 812 3456 7890</div>
              </div>
            </div>
            <div className="rounded-xl bg-tokio-panel border border-tokio-border p-5 flex items-start gap-3">
              <MapPin size={20} className="text-tokio-blue mt-0.5" />
              <div>
                <div className="font-semibold">Office</div>
                <div className="text-sm text-tokio-muted">Jakarta, Indonesia</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl bg-tokio-panel border border-tokio-border p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-tokio-border bg-tokio-bg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-tokio-border bg-tokio-bg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-tokio-border bg-tokio-bg px-3 py-2 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-5 py-2.5 font-semibold transition"
            >
              <Send size={16} />
              Send Message
            </button>
            {submitted && (
              <p className="text-sm text-tokio-success text-center">Message sent — we'll be in touch.</p>
            )}
          </form>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
