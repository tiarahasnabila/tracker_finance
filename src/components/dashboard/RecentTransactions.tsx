"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Plus, Receipt } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatRupiah, formatIndonesianDate } from "@/lib/formatters";
import { TransactionModal } from "@/components/transactions/TransactionModal";

interface TransactionItem {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date | string;
  notes?: string | null;
  category: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  };
}

interface RecentTransactionsProps {
  transactions: TransactionItem[];
  categories: any[];
}

export function RecentTransactions({
  transactions,
  categories,
}: RecentTransactionsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="card-fintrack p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Transaksi Terbaru</h2>
            <p className="text-xs text-slate-400">Aktivitas keuangan paling mutakhir</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${tx.category.color || "#0f766e"}15`,
                      color: tx.category.color || "#0f766e",
                    }}
                  >
                    <CategoryIcon name={tx.category.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{tx.category.name}</span>
                      <span>•</span>
                      <span>{formatIndonesianDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold tracking-tight ${
                      tx.type === "INCOME" ? "text-emerald-600" : "text-slate-800"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatRupiah(tx.amount)}
                  </p>
                  {tx.notes && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {tx.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Mulai catat transaksi pertama Anda sekarang
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors"
            >
              Catat Transaksi Sekarang
            </button>
          </div>
        )}
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
