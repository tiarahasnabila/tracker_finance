"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Receipt,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatRupiah, formatIndonesianDate } from "@/lib/formatters";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { deleteTransactionAction } from "@/app/actions/transactionActions";

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

interface TransactionTableProps {
  initialTransactions: TransactionItem[];
  categories: CategoryOption[];
}

export function TransactionTable({
  initialTransactions,
  categories,
}: TransactionTableProps) {
  // Filters & State
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & Actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return initialTransactions.filter((tx) => {
      // Search
      const matchesSearch =
        tx.title.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

      // Type filter
      const matchesType =
        selectedType === "ALL" || tx.type === selectedType;

      // Category filter
      const matchesCategory =
        selectedCategory === "ALL" || tx.categoryId === selectedCategory;

      // Date Range filter
      const txDate = new Date(tx.date);
      const matchesStart = !startDate || txDate >= new Date(`${startDate}T00:00:00`);
      const matchesEnd = !endDate || txDate <= new Date(`${endDate}T23:59:59`);

      return matchesSearch && matchesType && matchesCategory && matchesStart && matchesEnd;
    }).sort((a, b) => {
      if (sortBy === "date") {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      } else {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
    });
  }, [
    initialTransactions,
    search,
    selectedType,
    selectedCategory,
    sortBy,
    sortOrder,
    startDate,
    endDate,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${title}"?`)) {
      setDeletingId(id);
      try {
        await deleteTransactionAction(id);
      } catch (err) {
        alert("Gagal menghapus transaksi.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (tx: TransactionItem) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <>
      <div className="card-fintrack overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi berdasarkan nama atau catatan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              />
            </div>

            {/* Add Transaction Button */}
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Transaksi</span>
            </button>
          </div>

          {/* Secondary Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Type */}
            <div>
              <label className="block font-medium text-slate-500 mb-1">Jenis</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium text-slate-500 mb-1">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === "INCOME" ? "Masuk" : "Keluar"})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block font-medium text-slate-500 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block font-medium text-slate-500 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th
                  onClick={() => toggleSort("date")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-700 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tanggal</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-5">Nama Transaksi</th>
                <th className="py-3 px-5">Kategori</th>
                <th
                  onClick={() => toggleSort("amount")}
                  className="py-3 px-5 cursor-pointer hover:text-slate-700 select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Nominal</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Date */}
                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap text-xs">
                      {formatIndonesianDate(tx.date)}
                    </td>

                    {/* Title & Notes */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-800">{tx.title}</div>
                      {tx.notes && (
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {tx.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: `${tx.category.color || "#0f766e"}15`,
                          color: tx.category.color || "#0f766e",
                        }}
                      >
                        <CategoryIcon name={tx.category.icon} className="w-3.5 h-3.5" />
                        <span>{tx.category.name}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span
                        className={`font-bold tracking-tight ${
                          tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"} {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Ubah Transaksi"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.title)}
                          disabled={deletingId === tx.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Transaksi"
                        >
                          {deletingId === tx.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau filter Anda
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan{" "}
            <strong>
              {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{" "}
            -{" "}
            <strong>
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </strong>{" "}
            dari <strong>{filteredData.length}</strong> transaksi
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTransaction(null);
          }}
          categories={categories}
          transactionToEdit={editingTransaction}
        />
      )}
    </>
  );
}
