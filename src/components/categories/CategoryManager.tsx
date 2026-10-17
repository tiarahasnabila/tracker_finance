"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Tag,
  Loader2,
  X,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { CategoryIcon, AVAILABLE_ICONS } from "@/components/CategoryIcon";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/categoryActions";

interface CategoryData {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string | null;
  icon?: string | null;
  isSystem: boolean;
  userId?: string | null;
  _count?: {
    transactions: number;
    budgets: number;
  };
}

interface CategoryManagerProps {
  categories: CategoryData[];
}

const PRESET_COLORS = [
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#64748b", // Slate
];

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10b981");
  const [icon, setIcon] = useState("Tag");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setColor(activeTab === "INCOME" ? "#10b981" : "#ef4444");
    setIcon("Tag");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryData) => {
    if (c.isSystem) return;
    setEditingCategory(c);
    setName(c.name);
    setColor(c.color || "#10b981");
    setIcon(c.icon || "Tag");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama kategori wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type: activeTab,
        color,
        icon,
      };

      let res;
      if (editingCategory) {
        res = await updateCategoryAction(editingCategory.id, payload);
      } else {
        res = await createCategoryAction(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.message || "Gagal menyimpan kategori");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryData) => {
    if (cat.isSystem) {
      alert("Kategori sistem bawaan tidak dapat dihapus.");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
      setDeletingId(cat.id);
      try {
        const res = await deleteCategoryAction(cat.id);
        if (!res.success) {
          alert(res.message || "Gagal menghapus kategori");
        }
      } catch {
        alert("Gagal menghapus kategori");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Tabs & Add Button */}
        <div className="card-fintrack p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("EXPENSE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "EXPENSE"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
              <span>Kategori Pengeluaran</span>
            </button>
            <button
              onClick={() => setActiveTab("INCOME")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "INCOME"
                  ? "bg-white text-emerald-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>Kategori Pemasukan</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Kategori Pribadi</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const txCount = cat._count?.transactions || 0;
            const budgetCount = cat._count?.budgets || 0;

            return (
              <div
                key={cat.id}
                className="card-fintrack p-5 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${cat.color || "#0f766e"}15`,
                      color: cat.color || "#0f766e",
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {cat.name}
                      </h3>
                      {cat.isSystem ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                          <Lock className="w-3 h-3" /> Sistem
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Pribadi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {txCount} transaksi {budgetCount > 0 && `• ${budgetCount} anggaran`}
                    </p>
                  </div>
                </div>

                {!cat.isSystem && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Ubah Kategori"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus Kategori"
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">
                {editingCategory ? "Ubah Kategori Pribadi" : "Tambah Kategori Pribadi"}
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
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Online, Kopi Harian, Bonus Kinerja"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Pilih Warna Label
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                        color === c
                          ? "ring-2 ring-offset-2 ring-slate-800 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        icon === iconName
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-white"
                      }`}
                      title={iconName}
                    >
                      <CategoryIcon name={iconName} className="w-5 h-5" />
                    </button>
                  ))}
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
                  <span>{editingCategory ? "Simpan Perubahan" : "Buat Kategori"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
