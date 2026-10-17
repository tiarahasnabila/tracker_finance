"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Loader2,
  X,
} from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatRupiah, INDONESIAN_MONTHS } from "@/lib/formatters";
import { upsertBudgetAction, deleteBudgetAction } from "@/app/actions/budgetActions";

interface CategoryOption {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string | null;
  icon?: string | null;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  amount: number;
  spent: number;
  category: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  };
}

interface BudgetManagerProps {
  currentMonth: number;
  currentYear: number;
  budgets: BudgetItem[];
  expenseCategories: CategoryOption[];
}

export function BudgetManager({
  currentMonth,
  currentYear,
  budgets,
  expenseCategories,
}: BudgetManagerProps) {
  const router = useRouter();

  // Selected Period
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Navigate when month or year changes
  const handlePeriodChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
    router.push(`/budgets?month=${newMonth}&year=${newYear}`);
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setSelectedCategoryId(expenseCategories[0]?.id || "");
    setAmountStr("");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BudgetItem) => {
    setEditingBudget(b);
    setSelectedCategoryId(b.categoryId);
    setAmountStr(String(b.amount));
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Nominal anggaran harus lebih besar dari 0");
      return;
    }

    if (!selectedCategoryId) {
      setErrorMsg("Silakan pilih kategori");
      return;
    }

    setIsSaving(true);
    try {
      const res = await upsertBudgetAction({
        categoryId: selectedCategoryId,
        month,
        year,
        amount: numAmount,
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.message || "Gagal menyimpan anggaran");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus anggaran untuk kategori "${categoryName}"?`)) {
      setDeletingId(id);
      try {
        await deleteBudgetAction(id);
      } catch {
        alert("Gagal menghapus anggaran.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Metrics
  const totalBudgeted = budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Month & Year Filter Bar */}
        <div className="card-fintrack p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 mr-1">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Periode:</span>
            </div>

            <select
              value={month}
              onChange={(e) => handlePeriodChange(Number(e.target.value), year)}
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              {INDONESIAN_MONTHS.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => handlePeriodChange(month, Number(e.target.value))}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Pasang Anggaran Kategori</span>
          </button>
        </div>

        {/* Summary Card for Current Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-fintrack p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Total Anggaran Dialokasikan
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatRupiah(totalBudgeted)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{budgets.length} kategori dianggarkan</p>
          </div>

          <div className="card-fintrack p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Total Pengeluaran Terpakai
            </span>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {formatRupiah(totalSpent)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{overallPercentage}% dari total alokasi</p>
          </div>

          <div className="card-fintrack p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Sisa Anggaran Tersedia
            </span>
            <p
              className={`text-2xl font-bold mt-1 ${
                remainingBudget < 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {formatRupiah(remainingBudget)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {remainingBudget < 0 ? "Telah melebihi total batas!" : "Tersisa untuk sisa bulan"}
            </p>
          </div>
        </div>

        {/* Budget Cards List */}
        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const percent = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
              const remaining = b.amount - b.spent;
              const isExceeded = percent > 100;
              const isWarning = percent >= 80 && percent <= 100;

              let statusColor = "bg-emerald-500";
              let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";

              if (isExceeded) {
                statusColor = "bg-rose-500";
                badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
              } else if (isWarning) {
                statusColor = "bg-amber-500";
                badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
              }

              return (
                <div key={b.id} className="card-fintrack p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          backgroundColor: `${b.category.color || "#0f766e"}15`,
                          color: b.category.color || "#0f766e",
                        }}
                      >
                        <CategoryIcon name={b.category.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {b.category.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Batas: {formatRupiah(b.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeStyle}`}>
                        {percent}%
                      </span>
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ubah Anggaran"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.category.name)}
                        disabled={deletingId === b.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Hapus Anggaran"
                      >
                        {deletingId === b.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  {/* Details Footer */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <div>
                      <span className="text-slate-400">Terpakai: </span>
                      <strong className="text-slate-800">{formatRupiah(b.spent)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Sisa: </span>
                      <strong className={remaining < 0 ? "text-rose-600" : "text-emerald-700"}>
                        {formatRupiah(remaining)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-fintrack p-12 flex flex-col items-center justify-center text-slate-400">
            <PieChart className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">
              Belum ada anggaran untuk periode {INDONESIAN_MONTHS[month - 1]} {year}
            </p>
            <p className="text-xs text-slate-400 max-w-sm text-center mt-1 mb-4">
              Tentukan batas pengeluaran untuk setiap kategori agar keuangan Anda tetap terkendali.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
            >
              Tambah Anggaran Kategori
            </button>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">
                {editingBudget ? "Ubah Batas Anggaran" : "Tambah Anggaran Kategori"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Periode Bulan & Tahun
                </label>
                <div className="p-2.5 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700">
                  {INDONESIAN_MONTHS[month - 1]} {year}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kategori Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!!editingBudget}
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Batas Nominal Anggaran (IDR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-sm text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="Contoh: 1500000"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Anggaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
