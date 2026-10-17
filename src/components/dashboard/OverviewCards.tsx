import React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah } from "@/lib/formatters";

interface OverviewCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  remainingBudget: number;
}

export function OverviewCards({
  totalBalance,
  totalIncome,
  totalExpense,
  totalBudget,
  remainingBudget,
}: OverviewCardsProps) {
  // Budget status indicator
  const hasBudget = totalBudget > 0;
  const budgetUsagePercent = hasBudget
    ? Math.round((totalExpense / totalBudget) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Saldo Akumulasi */}
      <div className="card-fintrack p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Total Saldo Bersih
          </span>
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-white mb-1">
          {formatRupiah(totalBalance)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>Akumulasi seluruh transaksi</span>
        </div>
      </div>

      {/* 2. Total Pemasukan Periode Ini */}
      <div className="card-fintrack p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pemasukan Bulan Ini
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-emerald-600 mb-1">
          {formatRupiah(totalIncome)}
        </p>
        <p className="text-xs text-slate-400">Total pemasukan tercatat</p>
      </div>

      {/* 3. Total Pengeluaran Periode Ini */}
      <div className="card-fintrack p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pengeluaran Bulan Ini
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-rose-600 mb-1">
          {formatRupiah(totalExpense)}
        </p>
        <p className="text-xs text-slate-400">Total belanja & tagihan</p>
      </div>

      {/* 4. Sisa Anggaran */}
      <div className="card-fintrack p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sisa Anggaran
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              remainingBudget < 0
                ? "bg-rose-50 text-rose-600"
                : "bg-teal-50 text-teal-600"
            }`}
          >
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <p
          className={`text-2xl font-bold tracking-tight mb-1 ${
            remainingBudget < 0 ? "text-rose-600" : "text-teal-700"
          }`}
        >
          {hasBudget ? formatRupiah(remainingBudget) : "Belum diatur"}
        </p>
        {hasBudget ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {remainingBudget < 0 ? (
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Over budget ({budgetUsagePercent}%)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terpakai {budgetUsagePercent}%
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Alokasikan anggaran di menu Anggaran</p>
        )}
      </div>
    </div>
  );
}
