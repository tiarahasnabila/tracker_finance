"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatRupiah, formatIndonesianDate, toInputDate } from "@/lib/formatters";

interface CategoryOption {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string | null;
  icon?: string | null;
}

interface TransactionItem {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date | string;
  notes?: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  };
}

interface ReportViewProps {
  initialTransactions: TransactionItem[];
  categories: CategoryOption[];
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

export function ReportView({
  initialTransactions,
  categories,
}: ReportViewProps) {
  // Preset default dates: 1st day of current month to today
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [startDate, setStartDate] = useState(toInputDate(firstDay));
  const [endDate, setEndDate] = useState(toInputDate(now));
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  // Filtered transactions
  const filtered = useMemo(() => {
    return initialTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const matchesStart = !startDate || txDate >= new Date(`${startDate}T00:00:00`);
      const matchesEnd = !endDate || txDate <= new Date(`${endDate}T23:59:59`);
      const matchesType = selectedType === "ALL" || tx.type === selectedType;
      const matchesCategory = selectedCategoryId === "ALL" || tx.categoryId === selectedCategoryId;

      return matchesStart && matchesEnd && matchesType && matchesCategory;
    });
  }, [initialTransactions, startDate, endDate, selectedType, selectedCategoryId]);

  // Aggregate metrics
  const totalIncome = filtered
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Pie chart for expense categories
  const categoryExpenseData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();

    filtered
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const existing = map.get(t.category.name);
        if (existing) {
          existing.value += t.amount;
        } else {
          map.set(t.category.name, {
            name: t.category.name,
            value: t.amount,
            color: t.category.color || "#ef4444",
          });
        }
      });

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Bar chart timeline grouping by date
  const timelineData = useMemo(() => {
    const map = new Map<string, { date: string; pemasukan: number; pengeluaran: number }>();

    filtered.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (!map.has(key)) {
        map.set(key, { date: key, pemasukan: 0, pengeluaran: 0 });
      }
      const item = map.get(key)!;
      if (t.type === "INCOME") item.pemasukan += t.amount;
      else item.pengeluaran += t.amount;
    });

    return Array.from(map.values());
  }, [filtered]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (selectedType !== "ALL") params.set("type", selectedType);
    if (selectedCategoryId !== "ALL") params.set("categoryId", selectedCategoryId);

    window.open(`/api/export/csv?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Filter and Export Header Bar */}
      <div className="card-fintrack p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Filter Laporan Keuangan</h2>
            <p className="text-xs text-slate-400">Pilih periode dan kategori yang ingin dianalisis</p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Ekspor CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-500 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-500 mb-1">Jenis Transaksi</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="INCOME">Hanya Pemasukan</option>
              <option value="EXPENSE">Hanya Pengeluaran</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-500 mb-1">Kategori</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === "INCOME" ? "Pemasukan" : "Pengeluaran"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-fintrack p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Pemasukan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</p>
          <p className="text-xs text-slate-400 mt-1">Sesuai rentang filter</p>
        </div>

        <div className="card-fintrack p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600">{formatRupiah(totalExpense)}</p>
          <p className="text-xs text-slate-400 mt-1">Sesuai rentang filter</p>
        </div>

        <div className="card-fintrack p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Selisih Bersih (Net)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${
              netBalance >= 0 ? "text-slate-900" : "text-rose-600"
            }`}
          >
            {formatRupiah(netBalance)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {netBalance >= 0 ? "Surplus kas periode ini" : "Defisit kas periode ini"}
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="card-fintrack p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Tren Transaksi per Tanggal</h3>
          <p className="text-xs text-slate-400 mb-4">Aktivitas keuangan dalam rentang waktu yang dipilih</p>

          <div className="h-64 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
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
                    formatter={(val: any) => [formatRupiah(Number(val)), ""]}
                    contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }}
                  />
                  <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Tidak ada data transaksi pada rentang waktu ini
              </div>
            )}
          </div>
        </div>

        {/* Category Expense Breakdown */}
        <div className="card-fintrack p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Pengeluaran per Kategori</h3>
          <p className="text-xs text-slate-400 mb-4">Porsi alokasi dana periode terpilih</p>

          <div className="h-44 w-full">
            {categoryExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
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
                    formatter={(val: any) => [formatRupiah(Number(val)), ""]}
                    contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Belum ada pengeluaran
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {categoryExpenseData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-semibold text-slate-800">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtered Data Table */}
      <div className="card-fintrack overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Daftar Transaksi Sesuai Filter ({filtered.length})
          </h3>
          <span className="text-xs text-slate-400">Siap diekspor ke CSV</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Tanggal</th>
                <th className="py-3 px-5">Nama Transaksi</th>
                <th className="py-3 px-5">Kategori</th>
                <th className="py-3 px-5">Catatan</th>
                <th className="py-3 px-5 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 text-xs text-slate-500 whitespace-nowrap">
                      {formatIndonesianDate(tx.date)}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-800">{tx.title}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {tx.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-400 max-w-[200px] truncate">
                      {tx.notes || "-"}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"} {formatRupiah(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada transaksi yang cocok dengan kriteria filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
