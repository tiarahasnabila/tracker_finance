"use client";

import React from "react";
import Link from "next/link";
import { PieChart, ArrowRight, AlertTriangle } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatRupiah } from "@/lib/formatters";

interface BudgetItem {
  id: string;
  category: {
    name: string;
    icon?: string | null;
    color?: string | null;
  };
  budgetAmount: number;
  spentAmount: number;
}

interface BudgetProgressListProps {
  budgets: BudgetItem[];
}

export function BudgetProgressList({ budgets }: BudgetProgressListProps) {
  return (
    <div className="card-fintrack p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">Status Anggaran Bulan Ini</h2>
          <p className="text-xs text-slate-400">Monitoring pengeluaran per kategori</p>
        </div>
        <Link
          href="/budgets"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-xs transition-colors"
        >
          <span>Kelola Anggaran</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((b) => {
            const percent = b.budgetAmount > 0
              ? Math.round((b.spentAmount / b.budgetAmount) * 100)
              : 0;

            const isExceeded = percent > 100;
            const isWarning = percent >= 80 && percent <= 100;

            let barColor = "bg-emerald-500";
            let textColor = "text-emerald-700";
            let badgeBg = "bg-emerald-50 text-emerald-700";

            if (isExceeded) {
              barColor = "bg-rose-500";
              textColor = "text-rose-600";
              badgeBg = "bg-rose-50 text-rose-700";
            } else if (isWarning) {
              barColor = "bg-amber-500";
              textColor = "text-amber-700";
              badgeBg = "bg-amber-50 text-amber-700";
            }

            return (
              <div key={b.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${b.category.color || "#0f766e"}20`,
                        color: b.category.color || "#0f766e",
                      }}
                    >
                      <CategoryIcon name={b.category.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {b.category.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExceeded && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                        <AlertTriangle className="w-3.5 h-3.5" /> Lewat Batas
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}>
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Terpakai: <strong className={textColor}>{formatRupiah(b.spentAmount)}</strong></span>
                  <span>Batas: {formatRupiah(b.budgetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-600">Belum ada anggaran bulan ini</p>
          <p className="text-[11px] text-slate-400 text-center mt-0.5 mb-3">
            Atur batas pengeluaran untuk menjaga kondisi finansial Anda
          </p>
          <Link
            href="/budgets"
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors"
          >
            Buat Anggaran Sekarang
          </Link>
        </div>
      )}
    </div>
  );
}
