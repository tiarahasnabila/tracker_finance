"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldAlert,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  Flame,
  Timer,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Info,
} from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import {
  evaluateImpulsePurchaseAction,
  ImpulseEvaluationResult,
} from "@/app/actions/antiImpulseActions";
import Link from "next/link";

interface CategoryOption {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface AntiImpulseCheckerProps {
  categories: CategoryOption[];
}

interface SavedCoolingOff {
  id: string;
  itemName: string;
  price: number;
  verdict: string;
  endTime: number; // timestamp ms
  createdAt: number;
}

export function AntiImpulseChecker({ categories }: AntiImpulseCheckerProps) {
  const [itemName, setItemName] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [urgency, setUrgency] = useState<"NEED" | "WANT" | "FOMO">("WANT");
  const [reason, setReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<
    ImpulseEvaluationResult["data"] | null
  >(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Cooling-off saved list in localStorage
  const [coolingList, setCoolingList] = useState<SavedCoolingOff[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fintrack_cooling_off_items");
      if (saved) {
        setCoolingList(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Loading animation message sequence
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 3);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    "Memeriksa saldo riil & sisa anggaranmu...",
    "Menghitung keringat & jam kerja yang ditukar...",
    "Mengkonsultasikan rasionalitas belanja ke Groq AI...",
  ];

  const presets = [
    {
      name: "Sneakers Tren Baru",
      price: "1500000",
      urgency: "WANT" as const,
      categoryGuess: "Belanja",
      reason: "Model baru lagi hype di media sosial",
    },
    {
      name: "Kopi Fancy & Croissant",
      price: "85000",
      urgency: "WANT" as const,
      categoryGuess: "Makanan & Minuman",
      reason: "Mau self-reward sore hari setelah capek kerja",
    },
    {
      name: "Headphone / TWS Wireless",
      price: "2400000",
      urgency: "FOMO" as const,
      categoryGuess: "Belanja",
      reason: "Lagi flash sale 40% cuma hari ini doang",
    },
    {
      name: "Servis Rem & Ganti Oli",
      price: "450000",
      urgency: "NEED" as const,
      categoryGuess: "Transportasi",
      reason: "Sudah bunyi berdecit berbahaya di jalan",
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setItemName(p.name);
    setPriceInput(p.price);
    setUrgency(p.urgency);
    setReason(p.reason);

    const matchedCat = categories.find((c) =>
      c.name.toLowerCase().includes(p.categoryGuess.toLowerCase())
    );
    if (matchedCat) {
      setCategoryId(matchedCat.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numericPrice = parseFloat(priceInput.replace(/\D/g, ""));
    if (!itemName.trim()) {
      setErrorMsg("Mohon masukkan nama barang atau rencana belanja.");
      return;
    }
    if (!numericPrice || numericPrice <= 0) {
      setErrorMsg("Mohon masukkan estimasi harga yang valid.");
      return;
    }

    setIsLoading(true);
    setEvaluationResult(null);

    try {
      const res = await evaluateImpulsePurchaseAction({
        itemName,
        price: numericPrice,
        categoryId: categoryId || categories[0]?.id || "",
        urgency,
        reason,
      });

      if (res.success && res.data) {
        setEvaluationResult(res.data);
      } else {
        setErrorMsg(res.message || "Gagal melakukan evaluasi AI.");
      }
    } catch {
      setErrorMsg("Terjadi kegagalan jaringan saat menghubungi AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCoolingOff = (hours: number) => {
    if (!evaluationResult) return;

    const newItem: SavedCoolingOff = {
      id: "cool_" + Date.now(),
      itemName: evaluationResult.itemName,
      price: evaluationResult.price,
      verdict: evaluationResult.verdict,
      endTime: Date.now() + hours * 3600 * 1000,
      createdAt: Date.now(),
    };

    const updated = [newItem, ...coolingList.slice(0, 9)];
    setCoolingList(updated);
    try {
      localStorage.setItem("fintrack_cooling_off_items", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const formatRemainingTime = (endTime: number) => {
    const diff = endTime - currentTime;
    if (diff <= 0) return "Selesai (Sudah Dingin)";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}j ${minutes}m ${seconds}s`;
  };

  const removeCoolingItem = (id: string) => {
    const updated = coolingList.filter((item) => item.id !== id);
    setCoolingList(updated);
    try {
      localStorage.setItem("fintrack_cooling_off_items", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-500/30 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Anti-Impulse Reality Check • Powered by Groq
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Boleh Gak Aku Beli Ini?
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Hentikan penyesalan belanja sebelum uangmu lenyap. AI mengaudit sisa budget riil,
            mengonversi harga ke dalam <strong>jam kerja kerasmu</strong>, dan memberi tamparan realita
            yang objektif.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Coba Contoh Godaan Belanja Cepat:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                {p.name}
              </div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                {formatRupiah(parseInt(p.price, 10))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Input Rencana Pembelian
          </h2>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Nama Barang / Jasa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Sepatu Sneakers Nike Pegasus"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Harga Barang (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={priceInput ? Number(priceInput.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                  onChange={(e) => setPriceInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="1.500.000"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Kategori Terkait
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Tingkat Urgensi
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency("NEED")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    urgency === "NEED"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Primer (Need)
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency("WANT")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    urgency === "WANT"
                      ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Keinginan (Want)
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency("FOMO")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    urgency === "FOMO"
                      ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  FOMO / Diskon
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Alasan / Pembenaran Beli (Opsional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Kenapa kamu merasa ingin beli sekarang? Misal: lagi flash sale, biar lebih semangat kerja, dsb."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Mengevaluasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tanyakan Vonis AI Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Evaluation Output on Right */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  AI Sedang Melakukan Audit Realita
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 animate-fade-in">
                  {loadingMessages[loadingStep]}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !evaluationResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-sm border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Belum Ada Evaluasi Aktif
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Pilih salah satu contoh godaan belanja di atas atau masukkan rencana belanja di form sebelah kiri untuk melihat vonis AI.
              </p>
            </div>
          )}

          {!isLoading && evaluationResult && (
            <div className="space-y-6 animate-fade-in">
              {/* Verdict Card */}
              <div
                className={`rounded-2xl p-6 sm:p-7 shadow-md border ${
                  evaluationResult.verdict === "DISETUJUI"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80"
                    : evaluationResult.verdict === "PERTIMBANGKAN"
                    ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80"
                    : "bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                        evaluationResult.verdict === "DISETUJUI"
                          ? "bg-emerald-600"
                          : evaluationResult.verdict === "PERTIMBANGKAN"
                          ? "bg-amber-500"
                          : "bg-rose-600"
                      }`}
                    >
                      {evaluationResult.verdict === "DISETUJUI" ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : evaluationResult.verdict === "PERTIMBANGKAN" ? (
                        <AlertTriangle className="w-7 h-7" />
                      ) : (
                        <XCircle className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          evaluationResult.verdict === "DISETUJUI"
                            ? "bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                            : evaluationResult.verdict === "PERTIMBANGKAN"
                            ? "bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                            : "bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        Vonis: {evaluationResult.verdict.replace("_", " ")}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                        {evaluationResult.verdictTagline}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Rencana Biaya:
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {formatRupiah(evaluationResult.price)}
                    </span>
                  </div>
                </div>

                {/* Reality Check Quote */}
                <div className="mt-5 space-y-4">
                  <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-black/5 dark:border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Tamparan Realita AI:
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                      &ldquo;{evaluationResult.realityCheck}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Sweat Cost */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Biaya Keringat
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {evaluationResult.workHoursEquivalent} Jam
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Setara dengan <strong>{evaluationResult.workDaysText}</strong> duduk bekerja keras.
                  </p>
                </div>

                {/* 2. Budget Impact */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Coins className="w-4 h-4 text-amber-500" />
                    Dampak Anggaran
                  </div>
                  {evaluationResult.hasBudget ? (
                    <>
                      <div
                        className={`text-xl font-black ${
                          evaluationResult.remainingBudgetAfter < 0
                            ? "text-rose-600"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {formatRupiah(evaluationResult.remainingBudgetAfter)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {evaluationResult.remainingBudgetAfter < 0
                          ? "⚠️ Kategori ini langsung overbudget/defisit!"
                          : `Sisa anggaran kategori ${evaluationResult.categoryName}.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                        Belum Dianggarkan
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Belum ada limit bulanan untuk {evaluationResult.categoryName}.
                      </p>
                    </>
                  )}
                </div>

                {/* 3. Opportunity Cost */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <TrendingDown className="w-4 h-4 text-teal-500" />
                    Biaya Peluang
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {evaluationResult.opportunityCost}
                  </p>
                </div>
              </div>

              {/* Actionable Advice & Alternative */}
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Rekomendasi Langkah:
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {evaluationResult.actionableRule}
                    </p>
                  </div>
                </div>

                {evaluationResult.cheaperAlternative && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Alternatif Hemat:
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {evaluationResult.cheaperAlternative}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Cooling off & Proceed */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {evaluationResult.coolingOffHours > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStartCoolingOff(evaluationResult.coolingOffHours)}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Timer className="w-4 h-4" />
                    <span>Aktifkan Jeda {evaluationResult.coolingOffHours} Jam (Cooling-Off)</span>
                  </button>
                )}

                <Link
                  href={`/transactions?new=1&title=${encodeURIComponent(
                    evaluationResult.itemName
                  )}&amount=${evaluationResult.price}&type=EXPENSE&categoryId=${categoryId}`}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Tetap Beli & Catat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Cooling-off Wishlist Tracker */}
      {coolingList.length > 0 && (
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" />
              Daftar Barang dalam Masa Pikir Ulang (Cooling-Off)
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {coolingList.length} barang terpantau
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coolingList.map((item) => {
              const isCold = item.endTime <= currentTime;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    isCold
                      ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-90"
                      : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.itemName}
                      </h4>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCoolingItem(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                      title="Hapus dari daftar"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {formatRemainingTime(item.endTime)}
                    </span>

                    {isCold ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Masih Mau Beli?
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        Menenangkan Diri...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
