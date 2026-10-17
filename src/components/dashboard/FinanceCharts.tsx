"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { formatRupiah } from "@/lib/formatters";

interface MonthlyComparisonData {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

interface CategoryPieData {
  name: string;
  value: number;
  color: string;
}

interface FinanceChartsProps {
  monthlyComparison: MonthlyComparisonData[];
  categoryExpenseData: CategoryPieData[];
}

const DEFAULT_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export function FinanceCharts({
  monthlyComparison,
  categoryExpenseData,
}: FinanceChartsProps) {
  const [activeTab, setActiveTab] = useState<"comparison" | "category">("comparison");

  const totalExpense = categoryExpenseData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart 1: Perbandingan Pemasukan vs Pengeluaran */}
      <div className="card-fintrack p-6 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Tren Arus Kas (Pemasukan vs Pengeluaran)
            </h2>
            <p className="text-xs text-slate-400">
              Perbandingan akumulasi keuangan 6 bulan terakhir
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-600">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              <span className="text-slate-600">Pengeluaran</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {monthlyComparison.length > 0 &&
          monthlyComparison.some((m) => m.pemasukan > 0 || m.pengeluaran > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyComparison}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
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
                  formatter={(value: any) => [formatRupiah(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="pemasukan"
                  name="Pemasukan"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm font-medium">Belum ada data transaksi yang tercatat</p>
              <p className="text-xs">Catat transaksi pertama Anda untuk melihat grafik arus kas</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Komposisi Pengeluaran per Kategori */}
      <div className="card-fintrack p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-800">
            Pengeluaran Berdasarkan Kategori
          </h2>
          <p className="text-xs text-slate-400">
            Distribusi alokasi pengeluaran periode ini
          </p>
        </div>

        {categoryExpenseData.length > 0 && totalExpense > 0 ? (
          <div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryExpenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), ""]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown legend */}
            <div className="mt-2 space-y-2 max-h-36 overflow-y-auto pr-1">
              {categoryExpenseData.map((item, idx) => {
                const percent = Math.round((item.value / totalExpense) * 100);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length] }}
                      />
                      <span className="text-slate-700 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-800">
                        {formatRupiah(item.value)}
                      </span>
                      <span className="text-[10px] text-slate-400 w-7 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm font-medium">Belum ada pengeluaran periode ini</p>
            <p className="text-xs text-center mt-1">
              Data akan otomatis muncul saat Anda mencatat pengeluaran
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
