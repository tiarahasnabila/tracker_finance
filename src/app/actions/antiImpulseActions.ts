"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { groq, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/groq";
import { toNumber } from "@/lib/formatters";

export interface ImpulseEvaluationInput {
  itemName: string;
  price: number;
  categoryId: string;
  urgency: "NEED" | "WANT" | "FOMO";
  reason?: string;
}

export interface ImpulseEvaluationResult {
  success: boolean;
  message?: string;
  data?: {
    verdict: "DISETUJUI" | "PERTIMBANGKAN" | "DITOLAK_KERAS";
    verdictTagline: string;
    workHoursEquivalent: number;
    workDaysText: string;
    hourlyWage: number;
    remainingBudgetBefore: number;
    remainingBudgetAfter: number;
    budgetImpactPercent: number;
    hasBudget: boolean;
    realityCheck: string;
    opportunityCost: string;
    actionableRule: string;
    coolingOffHours: number;
    cheaperAlternative?: string;
    itemName: string;
    price: number;
    categoryName: string;
  };
}

export async function evaluateImpulsePurchaseAction(
  input: ImpulseEvaluationInput
): Promise<ImpulseEvaluationResult> {
  try {
    const user = await requireAuth();

    const { itemName, price, categoryId, urgency, reason } = input;

    if (!itemName || !itemName.trim()) {
      return { success: false, message: "Nama barang / rencana belanja harus diisi." };
    }
    if (!price || price <= 0) {
      return { success: false, message: "Nominal harga harus lebih dari Rp 0." };
    }

    // 1. Fetch category info
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isSystem: true }, { userId: user.id }],
      },
    });

    const categoryName = category?.name || "Kategori Umum";

    // 2. Fetch user's financial profile
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

    // Get current month income and expense
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { type: true, amount: true, categoryId: true },
    });

    const monthIncome = monthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    const monthExpense = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    // If current month has 0 income, estimate from last 3 months average
    let baselineIncome = monthIncome;
    if (baselineIncome <= 0) {
      const threeMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 4, 1));
      const pastIncomes = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: "INCOME",
          date: { gte: threeMonthsAgo, lte: endOfMonth },
        },
        select: { amount: true },
      });
      const totalPast = pastIncomes.reduce((sum, t) => sum + toNumber(t.amount), 0);
      baselineIncome = pastIncomes.length > 0 ? Math.round(totalPast / 3) : 5000000; // Default estimate 5jt
    }

    // Standard working hours: 160 hours/month (20 days x 8 hours)
    const hourlyWage = Math.max(Math.round(baselineIncome / 160), 20000);
    const workHoursEquivalent = parseFloat((price / hourlyWage).toFixed(1));
    const workDays = (workHoursEquivalent / 8).toFixed(1);
    const workDaysText =
      workHoursEquivalent < 8
        ? `${workHoursEquivalent} jam kerja`
        : `${workDays} hari kerja (${workHoursEquivalent} jam)`;

    // 3. Category budget check
    const budget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    const categorySpentSoFar = monthTransactions
      .filter((t) => t.type === "EXPENSE" && t.categoryId === categoryId)
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    const hasBudget = !!budget;
    const budgetAmount = budget ? toNumber(budget.amount) : 0;
    const remainingBudgetBefore = budgetAmount - categorySpentSoFar;
    const remainingBudgetAfter = remainingBudgetBefore - price;
    const budgetImpactPercent =
      budgetAmount > 0 ? Math.round((price / budgetAmount) * 100) : 0;

    // 4. Construct AI prompt
    const prompt = `Kamu adalah "FinTrack Anti-Impulse Reality Check AI", asisten penasihat keuangan pribadi yang jujur, tajam, cerdas, bersahabat, dan berpikiran realistis (ala Financial Coach Indonesia).
Tugasmu adalah menganalisis apakah rencana pembelian pengguna ini layak dibeli sekarang, perlu ditunda dengan cooling-off period, atau harus ditolak keras agar tidak boncos.

DATA PENGGUNA SAAT INI:
- Nama Barang: "${itemName}"
- Harga Barang: Rp ${price.toLocaleString("id-ID")}
- Kategori: "${categoryName}"
- Tingkat Urgensi yang diklaim user: "${urgency}" (NEED = Sangat Butuh/Pokok, WANT = Keinginan/Hiburan, FOMO = Emosi sesaat/Lagi diskon/Tren)
- Alasan user mau beli: "${reason || "Tidak ada alasan spesifik yang dituliskan"}"
- Estimasi Penghasilan Bulanan: Rp ${baselineIncome.toLocaleString("id-ID")}
- Nilai 1 Jam Kerja Pengguna: Rp ${hourlyWage.toLocaleString("id-ID")}/jam
- Beban Kerja untuk Barang Ini: ${workDaysText}
- Anggaran Kategori "${categoryName}" Bulan Ini: ${hasBudget ? `Rp ${budgetAmount.toLocaleString("id-ID")} (Sudah terpakai Rp ${categorySpentSoFar.toLocaleString("id-ID")}, Sisa Rp ${remainingBudgetBefore.toLocaleString("id-ID")})` : "Belum ada anggaran khusus yang di-set"}
- Sisa Budget Setelah Beli: ${hasBudget ? `Rp ${remainingBudgetAfter.toLocaleString("id-ID")}` : "Tidak terdata"}
- Total Pengeluaran Bulan Ini: Rp ${monthExpense.toLocaleString("id-ID")}

ATURAN PENILAIAN:
1. "DISETUJUI": Hanya jika memang NEED (pokok) ATAU harganya sangat terjangkau dibanding penghasilan (<3% penghasilan) dan tidak membuat kategori overbudget.
2. "PERTIMBANGKAN": Jika WANT, atau menghabiskan 20-50% sisa budget, atau butuh lebih dari 8 jam kerja keras. Rekomendasikan cooling-off period 24-48 jam.
3. "DITOLAK_KERAS": Jika FOMO, atau membuat budget defisit (remainingBudgetAfter < 0), atau harga barang sangat tidak proporsional dengan jam kerja/penghasilan bulanan.

FORMAT OUTPUT WAJIB JSON VALID TANPA MARKDOWN TEXT LAIN:
{
  "verdict": "DISETUJUI" | "PERTIMBANGKAN" | "DITOLAK_KERAS",
  "verdictTagline": "Judul vonis singkat, tajam & menarik (maks 6-8 kata)",
  "realityCheck": "Tamparan realita 2-3 kalimat yang membuka mata dengan cerdas dan empatik, sebutkan analogi jam kerja atau pengorbanan yang relevan.",
  "opportunityCost": "Analogi biaya peluang konkret dalam rupiah atau kehidupan sehari-hari (contoh: setara N porsi makan siang, atau jadi Rp X jika diinvestasikan 2 tahun di reksadana return 7% p.a)",
  "actionableRule": "Langkah praktis yang harus dilakukan pengguna saat ini sebelum mengambil keputusan.",
  "coolingOffHours": 0 jika DISETUJUI, 24 atau 48 jika PERTIMBANGKAN/DITOLAK_KERAS,
  "cheaperAlternative": "Saran alternatif lebih hemat atau cara lain memenuhi keinginan ini (1 kalimat singkat)"
}`;

    let aiResultText = "";
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
      });
      aiResultText = completion.choices[0]?.message?.content || "{}";
    } catch (apiError) {
      console.warn("Retrying with fallback model due to:", apiError);
      const fallbackCompletion = await groq.chat.completions.create({
        model: GROQ_FALLBACK_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
      });
      aiResultText = fallbackCompletion.choices[0]?.message?.content || "{}";
    }

    const parsedAi = JSON.parse(aiResultText);

    return {
      success: true,
      data: {
        verdict: parsedAi.verdict || (remainingBudgetAfter < 0 ? "DITOLAK_KERAS" : "PERTIMBANGKAN"),
        verdictTagline: parsedAi.verdictTagline || "Evaluasi Realita Finansial",
        workHoursEquivalent,
        workDaysText,
        hourlyWage,
        remainingBudgetBefore,
        remainingBudgetAfter,
        budgetImpactPercent,
        hasBudget,
        realityCheck:
          parsedAi.realityCheck ||
          `Barang ini menuntut sekitar ${workDaysText} dari energimu. Pertimbangkan apakah kepuasan yang didapat sebanding dengan jam kerja tersebut.`,
        opportunityCost:
          parsedAi.opportunityCost ||
          `Dana Rp ${price.toLocaleString("id-ID")} ini bisa menjadi dana cadangan darurat yang berharga.`,
        actionableRule:
          parsedAi.actionableRule ||
          "Berikan waktu jeda minimal 24 jam sebelum menekan tombol beli.",
        coolingOffHours: parsedAi.coolingOffHours ?? 24,
        cheaperAlternative: parsedAi.cheaperAlternative,
        itemName,
        price,
        categoryName,
      },
    };
  } catch (error) {
    console.error("Error in evaluateImpulsePurchaseAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat evaluasi AI.",
    };
  }
}
