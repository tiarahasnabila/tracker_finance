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
  Lightbulb,
  CheckCircle2,
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

  // Narasi cerdas untuk pengeluaran mingguan
  const getWeeklyNarrative = () => {
    if (totalWeeklyExpense === 0) {
      return {
        title: "Belum Ada Pengeluaran",
        text: `Belum ada data pengeluaran yang tercatat pada bulan ${currentMonthName}. Catat transaksi pertama Anda untuk melihat evaluasi distribusi pekanan secara otomatis.`,
        tone: "neutral",
      };
    }

    const maxPercent = maxWeek ? Math.round((maxWeek.totalExpense / totalWeeklyExpense) * 100) : 0;

    let advice = "";
    if (maxPercent >= 50) {
      advice = `Pengeluaran Anda terkonsentrasi sangat besar di ${maxWeek.label} (${maxPercent}% dari seluruh pengeluaran bulan ini). Hal ini wajar apabila bertepatan dengan kewajiban rutin awal bulan seperti sewa tempat tinggal atau belanja pokok. Di pekan-pekan berikutnya, pertahankan belanja harian tetap disiplin.`;
    } else {
      advice = `Distribusi pengeluaran Anda antar-pekan tergolong seimbang dan merata dengan rata-rata ${formatRupiah(avgWeeklyExpense)} per pekan. Pola konsistensi ini sangat baik untuk stabilitas arus kas!`;
    }

    return {
      title: `Evaluasi Belanja Mingguan (${currentMonthName})`,
      text: `Total belanja bulan ini tercatat sebesar ${formatRupiah(totalWeeklyExpense)}. Puncak pengeluaran terjadi pada ${maxWeek?.label} sebesar ${formatRupiah(maxWeek?.totalExpense || 0)} (${maxPercent}% porsi). ${advice}`,
      tone: "positive",
    };
  };

  // Narasi cerdas untuk pengeluaran bulanan
  const getMonthlyNarrative = () => {
    if (monthlyData.length < 2) {
      return {
        title: "Riwayat Bulanan Terus Bertumbuh",
        text: `Data riwayat bulanan akan semakin lengkap seiring berjalannya pencatatan transaksi Anda dari bulan ke bulan. Terus pertahankan kedisiplinan mencatat!`,
        tone: "neutral",
      };
    }

    const currentMonthData = monthlyData[monthlyData.length - 1];
    const prevMonthData = monthlyData[monthlyData.length - 2];
    const change = currentMonthData.percentageChange;

    if (change === undefined) {
      return {
        title: "Ringkasan Riwayat Pengeluaran",
        text: `Total pengeluaran tercatat di ${currentMonthData.monthName} adalah ${formatRupiah(currentMonthData.totalExpense)}. Data siap dibandingkan di bulan berikutnya.`,
        tone: "neutral",
      };
    }

    if (change < 0) {
      return {
        title: "Tren Positif: Penurunan Pengeluaran!",
        text: `Kabar baik! Pengeluaran Anda di ${currentMonthData.monthName} berhasil ditekan turun sebesar ${Math.abs(change)}% dibandingkan ${prevMonthData.monthName} (dari ${formatRupiah(prevMonthData.totalExpense)} menjadi ${formatRupiah(currentMonthData.totalExpense)}). Strategi efisiensi anggaran Anda berjalan sangat sukses! 🎉`,
        tone: "positive",
      };
    } else if (change > 0) {
      return {
        title: "Peringatan Kenaikan Belanja",
        text: `Pengeluaran di ${currentMonthData.monthName} mengalami kenaikan sebesar ${change}% dibandingkan ${prevMonthData.monthName} (dari ${formatRupiah(prevMonthData.totalExpense)} menjadi ${formatRupiah(currentMonthData.totalExpense)}). Periksa kembali kategori pengeluaran terbesar untuk memastikan arus kas tetap aman.`,
        tone: "warning",
      };
    } else {
      return {
        title: "Pengeluaran Konsisten & Stabil",
        text: `Pengeluaran Anda di ${currentMonthData.monthName} stabil sama persis dengan ${prevMonthData.monthName} sebesar ${formatRupiah(currentMonthData.totalExpense)}. Kedisiplinan anggaran Anda terjaga rapi!`,
        tone: "positive",
      };
    }
  };

  const weeklyNarrative = getWeeklyNarrative();
  const monthlyNarrative = getMonthlyNarrative();

  return (
    <div className="card-fintrack p-6 mb-8">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
            <CalendarRange className="w-4 h-4" />
            <span>Analisis Berkala Pengeluaran</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {activeTab === "weekly"
              ? `Pengeluaran Tiap Pekan (${currentMonthName})`
              : "Riwayat Pengeluaran Tiap Bulan"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {activeTab === "weekly"
              ? "Distribusi belanja Anda terbagi ke dalam siklus 4-5 pekan per bulan"
              : "Tren historis fluktuasi pengeluaran per bulan selama beberapa periode terakhir"}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "weekly"
                ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Tiap Pekan (Mingguan)
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "monthly"
                ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Tiap Bulan (Bulanan)
          </button>
        </div>
      </div>

      {/* Dynamic Narrative Summary Box (Kata-kata Insight Cerdas FinTrack) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl mb-6 border transition-all ${
          activeTab === "weekly"
            ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40"
            : monthlyNarrative.tone === "warning"
            ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/40"
            : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              activeTab === "weekly"
                ? "bg-emerald-600 text-white"
                : monthlyNarrative.tone === "warning"
                ? "bg-amber-600 text-white"
                : "bg-teal-600 text-white"
            }`}
          >
            <Lightbulb className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                activeTab === "weekly"
                  ? "text-emerald-900 dark:text-emerald-300"
                  : monthlyNarrative.tone === "warning"
                  ? "text-amber-900 dark:text-amber-300"
                  : "text-teal-900 dark:text-teal-300"
              }`}>
                {activeTab === "weekly" ? weeklyNarrative.title : monthlyNarrative.title}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-700/50 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Insight FinTrack</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {activeTab === "weekly" ? weeklyNarrative.text : monthlyNarrative.text}
            </p>
          </div>
        </div>
      </div>

      {/* Konten Tab 1: Ringkasan Tiap Pekan */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Rata-rata / Pekan
              </span>
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {formatRupiah(avgWeeklyExpense)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Pekan Pengeluaran Tertinggi
              </span>
              <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                {maxWeek && maxWeek.totalExpense > 0 ? maxWeek.label : "Belum ada data"}
              </p>
              {maxWeek && maxWeek.totalExpense > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {formatRupiah(maxWeek.totalExpense)}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Total Belanja Bulan Ini
              </span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
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
                      ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {week.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isMax
                          ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                    {formatRupiah(week.totalExpense)}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isMax ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="monthName" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
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
                    contentStyle={{ borderRadius: "0.75rem", fontSize: "12px", backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Riwayat Nominal Bulanan
              </h4>
              {monthlyData.map((item, idx) => {
                const isIncreased = (item.percentageChange || 0) > 0;
                const hasChange = item.percentageChange !== undefined && item.percentageChange !== 0;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.monthName}</p>
                      <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                        {formatRupiah(item.totalExpense)}
                      </p>
                    </div>

                    {hasChange && (
                      <div
                        className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                          isIncreased
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                            : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
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
