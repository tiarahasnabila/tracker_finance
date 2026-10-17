"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  AlertTriangle,
  Search,
  Mail,
  Lock,
  Plus,
  Trash2,
  TrendingUp,
  Tag,
  Calendar,
  Layers,
  Palette,
  Type,
  Component,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon, AVAILABLE_ICONS } from "@/components/CategoryIcon";
import { formatRupiah } from "@/lib/formatters";

export default function DesignSystemPage() {
  const [sampleInput, setSampleInput] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const colors = [
    { name: "Primary (Emerald Deep)", hex: "#047857", var: "--primary", usage: "Tombol utama, active link, brand identity" },
    { name: "Primary Hover", hex: "#065f46", var: "--primary-hover", usage: "Hover state button & link" },
    { name: "Primary Subtle", hex: "#ecfdf5", var: "--primary-light", usage: "Background pill, badge sukses" },
    { name: "Secondary (Slate Navy)", hex: "#0f172a", var: "--secondary", usage: "Kartu saldo utama, heading teks" },
    { name: "Income (Emerald)", hex: "#10b981", var: "--income", usage: "Pemasukan, progress normal < 80%" },
    { name: "Expense (Rose Red)", hex: "#ef4444", var: "--expense", usage: "Pengeluaran, over-budget > 100%" },
    { name: "Warning (Amber)", hex: "#f59e0b", var: "--warning", usage: "Anggaran mendekati batas (80-100%)" },
    { name: "Canvas Background", hex: "#f8fafc", var: "--background", usage: "Background aplikasi" },
    { name: "Card Surface", hex: "#ffffff", var: "--card-bg", usage: "Latar kartu komponen & modal" },
    { name: "Border Neutral", hex: "#e2e8f0", var: "--border", usage: "Border kartu, tabel, dan input" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Banner */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base">FinTrack Design System</span>
                <span className="block text-[10px] text-slate-400 font-medium">Design Tokens, Atomic UI & Guidelines</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button size="sm" variant="outline">
                Ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Intro */}
        <div>
          <Badge variant="success" className="mb-3">
            v1.0.0 Component Library
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            FinTrack Design System & Tokens
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-1.5 leading-relaxed">
            Sistem desain standar berfokus pada kejelasan data finansial, hierarki visual yang tegas, palet warna harmonis untuk pemasukan/pengeluaran, serta komponen atomic yang dapat digunakan ulang di seluruh aplikasi.
          </p>
        </div>

        {/* 1. Color Palette Tokens */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">1. Palet Warna (Color Tokens)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {colors.map((c) => (
              <div
                key={c.name}
                className="card-fintrack p-3 bg-white flex flex-col justify-between overflow-hidden"
              >
                <div
                  className="w-full h-16 rounded-xl border border-slate-200/60 shadow-xs mb-3"
                  style={{ backgroundColor: c.hex }}
                />
                <div>
                  <h3 className="font-bold text-xs text-slate-900 truncate">{c.name}</h3>
                  <p className="text-[11px] font-mono font-semibold text-slate-600 mt-0.5">{c.hex}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography & Formats */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Type className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">2. Tipografi & Standar Finansial</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hierarki Tipografi Teks</CardTitle>
                <CardDescription>Font Family: Geist Sans / Inter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Heading 1 (36px, Bold)</p>
                  <h1 className="text-3xl font-extrabold text-slate-900">Total Saldo Bersih</h1>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Heading 2 (24px, Bold)</p>
                  <h2 className="text-2xl font-bold text-slate-900">Alokasi Anggaran Bulanan</h2>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Heading 3 (18px, SemiBold)</p>
                  <h3 className="text-lg font-semibold text-slate-800">Ringkasan Arus Kas</h3>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Body Regular (14px)</p>
                  <p className="text-sm text-slate-600">Catat transaksi pengeluaran dan pemasukan dengan presisi.</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Caption / Metadata (12px)</p>
                  <p className="text-xs text-slate-400">17 Oktober 2026 • Akumulasi seluruh transaksi</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format Mata Uang Rupiah (IDR)</CardTitle>
                <CardDescription>Format angka keuangan Indonesia tanpa desimal membingungkan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Saldo Nominal Besar</span>
                  <span className="font-extrabold text-lg text-slate-900">{formatRupiah(45250000)}</span>
                </div>
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Pemasukan
                  </span>
                  <span className="font-extrabold text-lg text-emerald-600">+{formatRupiah(18500000)}</span>
                </div>
                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-800 flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-rose-600" /> Pengeluaran
                  </span>
                  <span className="font-extrabold text-lg text-rose-600">-{formatRupiah(11750000)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Buttons Component Showcase */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Component className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">3. Komponen Tombol (Buttons)</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Varian & Ukuran Button</CardTitle>
              <CardDescription>Semua varian memiliki transisi, active scale 95%, dan state loading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variants */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Varian Tombol</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Primary Action
                  </Button>
                  <Button variant="secondary">Secondary Action</Button>
                  <Button variant="destructive" leftIcon={<Trash2 className="w-4 h-4" />}>
                    Destructive
                  </Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="subtle">Subtle Emerald</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ukuran Button</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small (sm)</Button>
                  <Button size="md">Medium (md)</Button>
                  <Button size="lg">Large (lg)</Button>
                </div>
              </div>

              {/* Loading State Toggle */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Interactive Loading State</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    isLoading={btnLoading}
                    onClick={() => {
                      setBtnLoading(true);
                      setTimeout(() => setBtnLoading(false), 2000);
                    }}
                  >
                    {btnLoading ? "Memproses Data..." : "Klik untuk Tes Loading (2s)"}
                  </Button>
                  <Button variant="outline" disabled>
                    Disabled Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Form Controls & Badges */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">4. Form Input, Badges & Progress Indicators</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Input Field Controls</CardTitle>
                <CardDescription>Input dengan left icon, nominal addon, dan validasi error</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Cari transaksi..."
                  leftAddon={<Search className="w-4 h-4" />}
                />
                <Input
                  type="number"
                  placeholder="0"
                  leftAddon={<span className="font-bold text-xs text-slate-500">Rp</span>}
                />
                <Input
                  type="email"
                  placeholder="email@anda.com"
                  leftAddon={<Mail className="w-4 h-4" />}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  error={sampleInput && !sampleInput.includes("@") ? "Alamat email harus valid" : undefined}
                />
              </CardContent>
            </Card>

            {/* Badges & Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Status Badges & Progress Bar</CardTitle>
                <CardDescription>Indikator status anggaran dengan threshold dinamis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Varian Badge</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">Normal (&lt; 80%)</Badge>
                    <Badge variant="warning">Mendekati Batas (85%)</Badge>
                    <Badge variant="destructive">Lewat Batas (120%)</Badge>
                    <Badge variant="info">Kategori Sistem</Badge>
                    <Badge variant="default">Kategori Pribadi</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Progress Anggaran Otomatis</p>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">Makanan & Minuman (60%)</span>
                      <span className="font-bold text-emerald-600">Aman</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">Belanja Bulanan (88%)</span>
                      <span className="font-bold text-amber-600">Perhatian</span>
                    </div>
                    <Progress value={88} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">Hiburan & Rekreasi (125%)</span>
                      <span className="font-bold text-rose-600">Over Budget</span>
                    </div>
                    <Progress value={125} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Category Icons Preview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">5. Kategori Ikon & Color Pills</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ikon Finansial Kategori Lucide</CardTitle>
              <CardDescription>Digunakan di dropdown kategori, tabel transaksi, dan bar alokasi anggaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Object.keys(AVAILABLE_ICONS).slice(0, 18).map((iconName) => (
                  <div
                    key={iconName}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-800 flex items-center justify-center shrink-0">
                      <CategoryIcon name={iconName} className="w-4 h-4" />
                    </div>
                    <span className="truncate">{iconName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
