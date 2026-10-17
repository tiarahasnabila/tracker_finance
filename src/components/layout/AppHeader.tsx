"use client";

import React, { useState } from "react";
import { Plus, Calendar, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSidebar } from "./SidebarContext";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  categories: Array<{
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    color?: string | null;
    icon?: string | null;
  }>;
}

export function AppHeader({ title, subtitle, categories }: AppHeaderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isSidebarHidden, toggleSidebar, setMobileOpen } = useSidebar();

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen(true);
    } else {
      toggleSidebar();
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            type="button"
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer shrink-0 mt-0.5"
            title={isSidebarHidden ? "Tampilkan Menu Navigasi" : "Sembunyikan Menu Navigasi"}
            aria-label="Toggle navigation"
          >
            {isSidebarHidden ? (
              <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="capitalize">{todayStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <ThemeToggle />
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm shadow-emerald-700/20 hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categories={categories}
        />
      )}
    </>
  );
}
