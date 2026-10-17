"use client";

import React, { useState } from "react";
import { Plus, Calendar, Bell } from "lucide-react";
import { TransactionModal } from "@/components/transactions/TransactionModal";

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

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize">{todayStr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm shadow-emerald-700/20 hover:shadow-md transition-all active:scale-95 cursor-pointer"
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
