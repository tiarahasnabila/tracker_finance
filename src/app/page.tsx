import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Database,
  Calendar,
  ChevronRight,
  CreditCard,
  BarChart3,
  Coffee,
  ShoppingBag,
  Laptop,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FinTrack — Personal Finance Tracker Modern & Elegan",
  description: "Aplikasi pengelolaan keuangan pribadi modern untuk memantau arus kas, batas anggaran bulanan, dan analitik finansial secara presisi.",
};

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-emerald-600 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-emerald-300/30 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -top-20 right-1/4 w-[450px] h-[450px] bg-teal-300/25 rounded-full blur-[130px]" />
        <div className="absolute top-96 left-1/3 w-[350px] h-[350px] bg-cyan-200/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Navigation Header */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-between border border-slate-200/70 shadow-sm">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  FinTrack
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200/50">
                  v2.0
                </span>
              </div>
              <span className="block text-[11px] font-medium text-slate-400 -mt-0.5">
                Personal Finance Platform
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-emerald-700 transition-colors">
              Fitur Utama
            </a>
            <a href="#keamanan" className="hover:text-emerald-700 transition-colors">
              Arsitektur & Keamanan
            </a>
            <a href="#laporan" className="hover:text-emerald-700 transition-colors">
              Laporan CSV
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/60 rounded-xl transition-all"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm shadow-emerald-700/25 hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Mulai Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="pt-16 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Badge Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-xs mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-800">
              Modern Full-Stack Finance Tracker
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Next.js & Neon PostgreSQL
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12] max-w-4xl mx-auto mb-6">
            Kendalikan Keuanganmu, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-600 to-emerald-600">
              Rencanakan Masa Depan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
            Aplikasi pencatat keuangan pribadi dengan presisi tinggi. Pantau arus kas masuk-keluar, kunci batas anggaran bulanan per kategori, dan nikmati grafik analitik interaktif tanpa kompromi.
          </p>

          {/* Call to actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 hover:shadow-xl transition-all active:scale-95"
            >
              <span>Buka Akun Saya — Gratis</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Masuk Demo / Akun</span>
            </Link>
          </div>

          {/* Social Proof Pills */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-500 mb-16">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Format Mata Uang Rupiah (IDR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Data Terisolasi Antar Pengguna</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Presisi PostgreSQL Decimal(14,2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ekspor CSV Anti-Injection</span>
            </div>
          </div>

          {/* LIVE INTERACTIVE DASHBOARD PREVIEW MOCKUP */}
          <div className="relative max-w-5xl mx-auto">
            {/* Glowing Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 rounded-3xl blur-2xl -z-10" />

            {/* Dashboard Mockup Frame */}
            <div className="card-fintrack p-3 sm:p-5 bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl text-left overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-slate-400 font-mono text-[11px]">
                    fintrack.app/dashboard
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-400">Neon PostgreSQL Connected</span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="space-y-4">
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total Saldo Bersih
                    </span>
                    <p className="text-xl font-extrabold text-white mt-1">
                      Rp 24.850.000
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
                      <ArrowUpRight className="w-3 h-3" /> +18.4% bulan ini
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pemasukan (Oktober)
                    </span>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">
                      Rp 15.000.000
                    </p>
                    <span className="text-[10px] text-slate-400">Gaji Pokok & Freelance</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pengeluaran (Oktober)
                    </span>
                    <p className="text-xl font-extrabold text-rose-400 mt-1">
                      Rp 4.250.000
                    </p>
                    <span className="text-[10px] text-slate-400">Belanja & Utilitas</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Sisa Anggaran
                    </span>
                    <p className="text-xl font-extrabold text-teal-300 mt-1">
                      Rp 2.750.000
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 font-semibold mt-1">
                      Terpakai 60% (Aman)
                    </span>
                  </div>
                </div>

                {/* Split Mockup: Recent transactions & Budget bars */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                  {/* Recent Transactions List */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-white">Transaksi Terkini</span>
                      <span className="text-emerald-400 font-semibold">Live Real-Time</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-800/90 flex items-center justify-between border border-slate-700/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Honor Freelance Web</p>
                            <p className="text-[10px] text-slate-400">Pemasukan • Hari ini</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">+Rp 4.500.000</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/90 flex items-center justify-between border border-slate-700/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                            <Coffee className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Kopi Kenangan Mantan</p>
                            <p className="text-[10px] text-slate-400">Makanan • Kemarin</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-rose-400">-Rp 45.000</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/90 flex items-center justify-between border border-slate-700/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Belanja Bulanan Supermarket</p>
                            <p className="text-[10px] text-slate-400">Belanja • 15 Okt</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-rose-400">-Rp 825.000</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Allocation Progress */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="font-bold text-white">Status Anggaran Kategori</span>
                        <span className="text-slate-400">Oktober 2026</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-300 font-medium">Makanan & Minuman</span>
                            <span className="text-emerald-400 font-bold">55% (Rp 1.100.000 / Rp 2.000.000)</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full w-[55%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-300 font-medium">Transportasi & Bensin</span>
                            <span className="text-amber-400 font-bold">85% (Mendekati Batas)</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full w-[85%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-300 font-medium">Tagihan & Listrik</span>
                            <span className="text-teal-400 font-bold">30% (Rp 450.000 / Rp 1.500.000)</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-teal-400 h-2 rounded-full w-[30%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Perhitungan otomatis dari database Neon</span>
                      <Link href="/register" className="text-emerald-400 font-bold hover:underline">
                        Mulai Atur Anggaran →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="fitur" className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                Fitur Unggulan
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                Didesain Khusus untuk Efisiensi & Kemudahan Pengguna
              </h2>
              <p className="text-slate-500 text-sm mt-3">
                Kombinasi antarmuka intuitif dan arsitektur data teruji untuk hasil pelacakan yang akurat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="card-fintrack p-8 bg-slate-50/60 border border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Pencatatan Arus Kas Lengkap
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Operasi CRUD instan untuk pemasukan dan pengeluaran. Dilengkapi filter tanggal, kategori, pencarian teks, dan pagination responsif.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card-fintrack p-8 bg-slate-50/60 border border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6">
                  <PieChart className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Anggaran Cerdas 3 Tingkat
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pasang batas pengeluaran bulanan. Indikator visual otomatis memberi peringatan saat penggunaan mencapai 80% atau melampaui 100%.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card-fintrack p-8 bg-slate-50/60 border border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-6">
                  <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Laporan Finansial & Ekspor CSV
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh ringkasan transaksi ke file CSV standar UTF-8 BOM yang langsung rapi di Microsoft Excel, dilengkapi proteksi formula injection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Architecture Highlights */}
        <section id="keamanan" className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Keamanan & Keandalan
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-6 leading-tight">
                  Data Pribadi Anda Aman, Terisolasi, dan Akurat
                </h2>
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p>
                      <strong className="text-white">Isolasi Multi-Tenant Mutlak:</strong> Setiap query database dipagari dengan ID pengguna aktif. Tidak ada celah bagi pengguna lain untuk melihat atau memodifikasi data Anda.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <p>
                      <strong className="text-white">Bcrypt Salt Hashing & Sesi Terenkripsi:</strong> Password tidak pernah disimpan dalam bentuk teks biasa. Sesi disimpan di database dan dikunci dalam cookie HTTP-only.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Database className="w-4 h-4" />
                    </div>
                    <p>
                      <strong className="text-white">Tipe Data PostgreSQL Decimal:</strong> Seluruh nominal mata uang dihitung tanpa distorsi komputasi floating-point demi keakuratan pembukuan.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    <span>Daftar Akun Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Stack Architecture Specs Card */}
              <div className="card-fintrack p-6 bg-slate-800/90 border border-slate-700 text-xs font-mono space-y-3">
                <div className="text-emerald-400 font-bold pb-2 border-b border-slate-700">
                  // FinTrack Technical Architecture
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Framework:</span>
                  <span className="text-white font-semibold">Next.js 16 (App Router)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Database:</span>
                  <span className="text-white font-semibold">Neon Serverless PostgreSQL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">ORM & Migrations:</span>
                  <span className="text-white font-semibold">Prisma ORM v6.4.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Currency Precision:</span>
                  <span className="text-emerald-400 font-semibold">DECIMAL(14, 2)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Validation:</span>
                  <span className="text-white font-semibold">Zod Client & Server</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Unit Tests:</span>
                  <span className="text-emerald-400 font-semibold">19 Passed (Vitest)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                Pertanyaan Umum
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="card-fintrack p-5 bg-white">
                <h4 className="font-bold text-slate-900 mb-1">
                  Apakah aplikasi FinTrack gratis digunakan?
                </h4>
                <p className="text-xs text-slate-600">
                  Ya, FinTrack 100% gratis digunakan. Anda dapat mendaftar akun, mencatat transaksi tanpa batas, mengatur anggaran bulanan, dan mengekspor laporan ke CSV.
                </p>
              </div>

              <div className="card-fintrack p-5 bg-white">
                <h4 className="font-bold text-slate-900 mb-1">
                  Bagaimana saldo akumulasi dihitung?
                </h4>
                <p className="text-xs text-slate-600">
                  Saldo bersih dihitung dari seluruh akumulasi transaksi pemasukan dikurangi pengeluaran yang tercatat secara nyata di database Neon PostgreSQL milik Anda.
                </p>
              </div>

              <div className="card-fintrack p-5 bg-white">
                <h4 className="font-bold text-slate-900 mb-1">
                  Bisakah saya menambahkan kategori sendiri?
                </h4>
                <p className="text-xs text-slate-600">
                  Tentu saja! Selain kategori sistem bawaan (seperti Gaji, Makanan, Tagihan), Anda dapat membuat kategori pribadi di menu Kategori lengkap dengan pemilihan warna dan ikon kustom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Siap Mengatur Keuangan Lebih Terencana?
            </h2>
            <p className="text-emerald-100 text-sm mb-8">
              Mulai dalam 30 detik. Tanpa kartu kredit, tanpa setup rumit.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-emerald-900 font-extrabold text-sm shadow-xl transition-all active:scale-95"
            >
              <span>Daftar Akun Gratis Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">FinTrack — Personal Finance Tracker</span>
          </div>
          <p>© {new Date().getFullYear()} FinTrack. Dibangun dengan Next.js App Router, Tailwind CSS, Prisma ORM & Neon PostgreSQL.</p>
        </div>
      </footer>
    </div>
  );
}
