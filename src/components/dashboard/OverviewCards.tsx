import React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
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
  const hasBudget = totalBudget > 0;
  const budgetUsagePercent = hasBudget
    ? Math.round((totalExpense / totalBudget) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Saldo Bersih */}
      <div className={`card-fintrack p-6 border-t-4 bg-white ${
        totalBalance >= 0 ? "border-t-emerald-500" : "border-t-rose-500"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Saldo Bersih
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
            totalBalance >= 0
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}>
            <Wallet className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${
          totalBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        }`}>
          {formatRupiah(totalBalance)}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className={`inline-block w-2 h-2 rounded-full ${
            totalBalance >= 0 ? "bg-emerald-500" : "bg-rose-500"
          } animate-pulse`} />
          <span>Akumulasi seluruh transaksi riil</span>
        </div>
      </div>

      {/* 2. Total Pemasukan Bulan Ini */}
      <div className="card-fintrack p-6 border-t-4 border-t-emerald-500 bg-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pemasukan Bulan Ini
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 mb-2">
          {formatRupiah(totalIncome)}
        </p>
        <p className="text-xs text-slate-400 font-medium">Total dana masuk tercatat</p>
      </div>

      {/* 3. Total Pengeluaran Bulan Ini */}
      <div className="card-fintrack p-6 border-t-4 border-t-rose-500 bg-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pengeluaran Bulan Ini
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 mb-2">
          {formatRupiah(totalExpense)}
        </p>
        <p className="text-xs text-slate-400 font-medium">Total belanja & tagihan</p>
      </div>

      {/* 4. Sisa Anggaran */}
      <div
        className={`card-fintrack p-6 border-t-4 bg-white ${
          remainingBudget < 0 ? "border-t-rose-500" : "border-t-teal-500"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Sisa Anggaran
          </span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              remainingBudget < 0
                ? "bg-rose-50 text-rose-600"
                : "bg-teal-50 text-teal-600"
            }`}
          >
            <PiggyBank className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <p
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${
            remainingBudget < 0 ? "text-rose-600" : "text-teal-800"
          }`}
        >
          {hasBudget ? formatRupiah(remainingBudget) : "Belum diatur"}
        </p>
        {hasBudget ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {remainingBudget < 0 ? (
              <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> Over budget ({budgetUsagePercent}%)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terpakai {budgetUsagePercent}%
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">Alokasikan anggaran di menu Anggaran</p>
        )}
      </div>
    </div>
  );
}
