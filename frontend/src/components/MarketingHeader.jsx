import { Link } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-tokio-border bg-tokio-panel/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-tokio-muted">
          <Link to="/#features" className="hover:text-tokio-text transition">Features</Link>
          <Link to="/#how-it-works" className="hover:text-tokio-text transition">How it works</Link>
          <Link to="/pricing" className="hover:text-tokio-text transition">Pricing</Link>
          <Link to="/contact" className="hover:text-tokio-text transition">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-5 py-2 font-semibold shadow-md transition"
          >
            Join Now
          </Link>
        </div>
      </div>
    </header>
  );
}
