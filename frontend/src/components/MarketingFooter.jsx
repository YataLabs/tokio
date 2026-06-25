import { Wallet } from "lucide-react";
import Logo from "./Logo";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-tokio-border">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={32} />
        <div className="flex items-center gap-2 text-sm text-tokio-muted">
          <Wallet size={16} />
          Trusted point-of-sale for retail & F&B businesses
        </div>
        <p className="text-sm text-tokio-muted">
          © {new Date().getFullYear()} Tokio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
