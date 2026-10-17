import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/formatters";
import { AppHeader } from "@/components/layout/AppHeader";
import { ReportView } from "@/components/reports/ReportView";

export const metadata: Metadata = {
  title: "Laporan Keuangan",
  description: "Analisis kondisi keuangan, arus kas, dan ekspor laporan ke CSV.",
};

export default async function ReportsPage() {
  const user = await requireAuth();

  // Fetch all transactions for this user
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Fetch accessible categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { name: "asc" },
  });

  const formattedTransactions = transactions.map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type,
    amount: toNumber(t.amount),
    date: t.date,
    notes: t.notes,
    categoryId: t.categoryId,
    category: {
      id: t.category.id,
      name: t.category.name,
      color: t.category.color,
      icon: t.category.icon,
    },
  }));

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    color: c.color,
    icon: c.icon,
  }));

  return (
    <div>
      <AppHeader
        title="Laporan & Analisis Finansial"
        subtitle="Evaluasi tren arus kas, proporsi pengeluaran, dan ekspor data resmi ke CSV"
        categories={categoryOptions}
      />

      <ReportView
        initialTransactions={formattedTransactions}
        categories={categoryOptions}
      />
    </div>
  );
}
