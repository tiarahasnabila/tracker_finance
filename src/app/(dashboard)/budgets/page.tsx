import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, INDONESIAN_MONTHS } from "@/lib/formatters";
import { AppHeader } from "@/components/layout/AppHeader";
import { BudgetManager } from "@/components/budgets/BudgetManager";

export const metadata: Metadata = {
  title: "Anggaran",
  description: "Atur batas anggaran bulanan per kategori dan kendalikan pengeluaran Anda.",
};

interface BudgetsPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function BudgetsPage(props: BudgetsPageProps) {
  const user = await requireAuth();
  const searchParams = await props.searchParams;

  const now = new Date();
  const currentMonth = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth() + 1;
  const currentYear = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear();

  // Date range for current month
  const startDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

  // 1. Fetch budgets for this user and period
  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month: currentMonth,
      year: currentYear,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 2. Fetch actual expenses in this period
  const expenses = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  // Calculate spent per category
  const spentMap = new Map<string, number>();
  expenses.forEach((e) => {
    const current = spentMap.get(e.categoryId) || 0;
    spentMap.set(e.categoryId, current + toNumber(e.amount));
  });

  const formattedBudgets = budgets.map((b) => ({
    id: b.id,
    categoryId: b.categoryId,
    month: b.month,
    year: b.year,
    amount: toNumber(b.amount),
    spent: spentMap.get(b.categoryId) || 0,
    category: {
      id: b.category.id,
      name: b.category.name,
      color: b.category.color,
      icon: b.category.icon,
    },
  }));

  // 3. Fetch accessible expense categories (for creating new budgets)
  const expenseCategories = await prisma.category.findMany({
    where: {
      type: "EXPENSE",
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { name: "asc" },
  });

  // All categories for quick modal in header
  const allCategories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AppHeader
        title="Alokasi Anggaran Bulanan"
        subtitle={`Rencana batas pengeluaran untuk periode ${INDONESIAN_MONTHS[currentMonth - 1]} ${currentYear}`}
        categories={allCategories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }))}
      />

      <BudgetManager
        currentMonth={currentMonth}
        currentYear={currentYear}
        budgets={formattedBudgets}
        expenseCategories={expenseCategories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }))}
      />
    </div>
  );
}
