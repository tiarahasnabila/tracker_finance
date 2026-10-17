"use client";

import React, { useState } from "react";
import {
  CalendarRange,
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatRupiah, INDONESIAN_MONTHS } from "@/lib/formatters";

export interface WeeklyExpenseItem {
  weekNumber: number;
  label: string; // e.g. "Pekan 1 (Tgl 1 - 7)"
  totalExpense: number;
  transactionCount: number;
}

export interface MonthlyExpenseItem {
  monthName: string;
  year: number;
  totalExpense: number;
  topCategoryName?: string;
  percentageChange?: number; // % change compared to previous month
}

interface ExpensePeriodSummaryProps {
  currentMonthName: string;
  weeklyData: WeeklyExpenseItem[];
  monthlyData: MonthlyExpenseItem[];
}

export function ExpensePeriodSummary({
  currentMonthName,
  weeklyData,
  monthlyData,
}: ExpensePeriodSummaryProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  // Perhitungan analisis mingguan
  const totalWeeklyExpense = weeklyData.reduce((acc, curr) => acc + curr.totalExpense, 0);
  const avgWeeklyExpense = weeklyData.length > 0 ? totalWeeklyExpense / weeklyData.length : 0;

  // Temukan pekan tertinggi
  let maxWeek = weeklyData[0];
  weeklyData.forEach((w) => {
    if (w.totalExpense > (maxWeek?.totalExpense || 0)) {
      maxWeek = w;
    }
  });

  return (
    <div className="card-fintrack p-6 mb-8">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <CalendarRange className="w-4 h-4" />
            <span>Analisis Berkala Pengeluaran</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {activeTab === "weekly"
              ? `Pengeluaran Tiap Pekan (${currentMonthName})`
              : "Riwayat Pengeluaran Tiap Bulan"}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === "weekly"
              ? "Distribusi belanja Anda terbagi ke dalam siklus 4-5 pekan per bulan"
              : "Tren historis fluktuasi pengeluaran per bulan selama beberapa periode terakhir"}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "weekly"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tiap Pekan (Mingguan)
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "monthly"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tiap Bulan (Bulanan)
          </button>
        </div>
      </div>

      {/* Konten Tab 1: Ringkasan Tiap Pekan */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Rata-rata / Pekan
              </span>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                {formatRupiah(avgWeeklyExpense)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Pekan Pengeluaran Tertinggi
              </span>
              <p className="text-lg font-extrabold text-rose-600 mt-0.5">
                {maxWeek && maxWeek.totalExpense > 0 ? maxWeek.label : "Belum ada data"}
              </p>
              {maxWeek && maxWeek.totalExpense > 0 && (
                <span className="text-[11px] text-slate-400">
                  {formatRupiah(maxWeek.totalExpense)}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Total Belanja Bulan Ini
              </span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {formatRupiah(totalWeeklyExpense)}
              </p>
            </div>
          </div>

          {/* Cards Breakdown Tiap Pekan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyData.map((week) => {
              const percent = totalWeeklyExpense > 0
                ? Math.round((week.totalExpense / totalWeeklyExpense) * 100)
                : 0;

              const isMax = week.weekNumber === maxWeek?.weekNumber && week.totalExpense > 0;

              return (
                <div
                  key={week.weekNumber}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMax
                      ? "bg-rose-50/40 border-rose-200/80 shadow-xs"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      {week.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isMax
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <p className="text-xl font-extrabold text-slate-900 mb-2">
                    {formatRupiah(week.totalExpense)}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isMax ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {week.transactionCount} transaksi tercatat
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Konten Tab 2: Ringkasan Tiap Bulan */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Grafik Bar Pengeluaran Bulanan */}
            <div className="lg:col-span-2 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}jt`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}rb`
                        : `${val}`
                    }
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), "Total Pengeluaran"]}
                    contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }}
                  />
                  <Bar
                    dataKey="totalExpense"
                    name="Pengeluaran"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Riwayat Tabel Sederhana */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Riwayat Nominal Bulanan
              </h4>
              {monthlyData.map((item, idx) => {
                const isIncreased = (item.percentageChange || 0) > 0;
                const hasChange = item.percentageChange !== undefined && item.percentageChange !== 0;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.monthName}</p>
                      <p className="text-sm font-extrabold text-rose-600 mt-0.5">
                        {formatRupiah(item.totalExpense)}
                      </p>
                    </div>

                    {hasChange && (
                      <div
                        className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                          isIncreased
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isIncreased ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{Math.abs(item.percentageChange!)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
