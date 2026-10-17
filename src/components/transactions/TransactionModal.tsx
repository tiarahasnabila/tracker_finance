"use client";

import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownRight, Loader2, Tag } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { createTransactionAction, updateTransactionAction } from "@/app/actions/transactionActions";
import { toInputDate } from "@/lib/formatters";

interface CategoryOption {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string | null;
  icon?: string | null;
}

interface TransactionData {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: number | string;
  categoryId: string;
  date: Date | string;
  notes?: string | null;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  transactionToEdit?: TransactionData | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  categories,
  transactionToEdit,
}: TransactionModalProps) {
  const isEditing = !!transactionToEdit;

  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    transactionToEdit?.type || "EXPENSE"
  );
  const [title, setTitle] = useState(transactionToEdit?.title || "");
  const [amount, setAmount] = useState<string>(
    transactionToEdit ? String(Number(transactionToEdit.amount)) : ""
  );
  const [categoryId, setCategoryId] = useState(
    transactionToEdit?.categoryId || ""
  );
  const [date, setDate] = useState(
    transactionToEdit
      ? toInputDate(transactionToEdit.date)
      : toInputDate(new Date())
  );
  const [notes, setNotes] = useState(transactionToEdit?.notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter categories by selected transaction type
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Nominal harus berupa angka lebih besar dari 0");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Silakan pilih kategori transaksi");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title,
        type,
        amount: numAmount,
        categoryId,
        date,
        notes: notes || null,
      };

      let res;
      if (isEditing && transactionToEdit) {
        res = await updateTransactionAction(transactionToEdit.id, payload);
      } else {
        res = await createTransactionAction(payload);
      }

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message || "Gagal menyimpan transaksi");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? "Ubah Transaksi" : "Catat Transaksi Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Type Toggle: Pengeluaran vs Pemasukan */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType("EXPENSE");
                  setCategoryId("");
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === "EXPENSE"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("INCOME");
                  setCategoryId("");
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === "INCOME"
                    ? "bg-white text-emerald-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span>Pemasukan</span>
              </button>
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nominal (IDR) <span className="text-rose-500">*</span>
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
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-base"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Belanja Bulanan, Makan Siang, Gaji Pokok"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
            >
              <option value="">-- Pilih Kategori --</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Tambahkan catatan jika diperlukan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-xs transition-all disabled:opacity-50 ${
                type === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
              }`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
