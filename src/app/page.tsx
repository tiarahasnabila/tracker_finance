import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  PieChart,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FinTrack — Personal Finance Tracker Modern & Aman",
  description: "Aplikasi pengelolaan keuangan pribadi untuk mencatat arus kas, mengatur anggaran bulanan, dan mencapai tujuan finansial Anda.",
};

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                FinTrack
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Portofolio Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm shadow-emerald-700/20 hover:shadow-md transition-all active:scale-95"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-blue-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aplikasi Pengelolaan Keuangan Pribadi Berbasis Next.js & Neon PostgreSQL</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              Kendalikan Arus Kas, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600">
                Wujudkan Masa Depan Finansial
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
              Catat pemasukan dan pengeluaran harian, pantau alokasi anggaran bulanan secara visual, dan nikmati analisis keuangan interaktif dengan keamanan data terisolasi.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-700/25 hover:shadow-xl transition-all active:scale-95"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-xs transition-all"
              >
                <span>Masuk ke Akun</span>
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 text-left">
              <div className="card-fintrack p-6 bg-white">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Catat Arus Kas</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Operasi CRUD lengkap untuk pemasukan dan pengeluaran dengan filter dan pencarian instan.
                </p>
              </div>

              <div className="card-fintrack p-6 bg-white">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Batas Anggaran</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Peringatan visual otomatis ketika pengeluaran mendekati atau melampaui batas bulanan.
                </p>
              </div>

              <div className="card-fintrack p-6 bg-white">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Ekspor Laporan CSV</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unduh data transaksi terfilter ke CSV dengan proteksi formula injection dan format UTF-8.
                </p>
              </div>

              <div className="card-fintrack p-6 bg-white">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Privasi Terjamin</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Setiap pengguna memiliki akses data terisolasi dengan otorisasi dan hashing bcrypt aman.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">
              F
            </div>
            <span className="font-semibold text-slate-700">FinTrack — Personal Finance Tracker</span>
          </div>
          <p>© {new Date().getFullYear()} FinTrack. Dibangun dengan Next.js App Router, Prisma ORM & Neon PostgreSQL.</p>
        </div>
      </footer>
    </div>
  );
}
