import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
        isDark
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-gray-100"
      } ${className}`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ${
          isDark
            ? "translate-x-7 bg-gray-600 text-yellow-300"
            : "translate-x-1 bg-white text-amber-500"
        }`}
      >
        {isDark ? (
          <Moon size={12} strokeWidth={2.5} />
        ) : (
          <Sun size={12} strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}