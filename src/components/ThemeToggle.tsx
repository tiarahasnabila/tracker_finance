"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("fintrack_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = saved === "dark" || (!saved && prefersDark);
      const currentTheme = isDark ? "dark" : "light";
      
      setTheme(currentTheme);
      if (isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch (_) {}
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark";

    const nextTheme = isCurrentlyDark ? "light" : "dark";
    setTheme(nextTheme);

    try {
      localStorage.setItem("fintrack_theme", nextTheme);
    } catch (_) {}

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs flex items-center justify-center cursor-pointer ${className}`}
      title={theme === "light" ? "Beralih ke Mode Gelap" : "Beralih ke Mode Terang"}
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 stroke-[2.2]" />
      ) : (
        <Sun className="w-4 h-4 stroke-[2.2] text-amber-400" />
      )}
    </button>
  );
}
