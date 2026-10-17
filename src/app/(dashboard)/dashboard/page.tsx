import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, INDONESIAN_MONTHS } from "@/lib/formatters";
import { AppHeader } from "@/components/layout/AppHeader";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { FinanceCharts } from "@/components/dashboard/FinanceCharts";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetProgressList } from "@/components/dashboard/BudgetProgressList";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan kondisi keuangan pribadi dan progres anggaran Anda.",
};

interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const user = await requireAuth();
  const searchParams = await props.searchParams;

  const now = new Date();
  const currentMonth = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth() + 1;
  const currentYear = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear();

  // 1. Calculate Total Saldo (Accumulation of all-time transactions for this user)
  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    select: { type: true, amount: true },
  });

  const totalAllIncome = allTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

  const totalAllExpense = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

  const totalBalance = totalAllIncome - totalAllExpense;

  // 2. Calculate Period Income & Expense (Selected Month and Year)
  const startDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

  const periodTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const periodIncome = periodTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

  const periodExpense = periodTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

  // 3. Budgets for Current Period
  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month: currentMonth,
      year: currentYear,
    },
    include: {
      category: true,
    },
  });

  const totalBudget = budgets.reduce((acc, curr) => acc + toNumber(curr.amount), 0);
  const remainingBudget = totalBudget - periodExpense;

  // Map budget progress per category
  const budgetProgress = budgets.map((b) => {
    const spent = periodTransactions
      .filter((t) => t.type === "EXPENSE" && t.categoryId === b.categoryId)
      .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

    return {
      id: b.id,
      category: {
        name: b.category.name,
        icon: b.category.icon,
        color: b.category.color,
      },
      budgetAmount: toNumber(b.amount),
      spentAmount: spent,
    };
  });

  // 4. Data for Category Expense Donut Chart
  const categoryExpenseMap = new Map<string, { name: string; value: number; color: string }>();
  periodTransactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const catName = t.category.name;
      const amount = toNumber(t.amount);
      if (categoryExpenseMap.has(catName)) {
        categoryExpenseMap.get(catName)!.value += amount;
      } else {
        categoryExpenseMap.set(catName, {
          name: catName,
          value: amount,
          color: t.category.color || "#ef4444",
        });
      }
    });

  const categoryExpenseData = Array.from(categoryExpenseMap.values());

  // 5. Data for 6-Month Cash Flow Trend Chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const trendTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      date: true,
      type: true,
      amount: true,
    },
  });

  // Group 6 months in chronological order
  const monthlyComparison: Array<{ month: string; pemasukan: number; pengeluaran: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    const label = `${INDONESIAN_MONTHS[m].substring(0, 3)} ${y}`;

    const inMonth = trendTransactions.filter(
      (tx) => tx.date.getMonth() === m && tx.date.getFullYear() === y
    );

    const inc = inMonth
      .filter((t) => t.type === "INCOME")
      .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

    const exp = inMonth
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, curr) => acc + toNumber(curr.amount), 0);

    monthlyComparison.push({
      month: label,
      pemasukan: inc,
      pengeluaran: exp,
    });
  }

  // 6. Recent Transactions (latest 5)
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    take: 5,
    orderBy: { date: "desc" },
    include: { category: true },
  });

  const formattedRecent = recentTransactions.map((tx) => ({
    id: tx.id,
    title: tx.title,
    type: tx.type,
    amount: toNumber(tx.amount),
    date: tx.date,
    notes: tx.notes,
    category: {
      id: tx.category.id,
      name: tx.category.name,
      color: tx.category.color,
      icon: tx.category.icon,
    },
  }));

  // 7. Categories for quick transaction modal
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { name: "asc" },
  });

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
        title={`Dashboard Keuangan`}
        subtitle={`Ringkasan periode ${INDONESIAN_MONTHS[currentMonth - 1]} ${currentYear}`}
        categories={categoryOptions}
      />

      {/* Overview Metric Cards */}
      <OverviewCards
        totalBalance={totalBalance}
        totalIncome={periodIncome}
        totalExpense={periodExpense}
        totalBudget={totalBudget}
        remainingBudget={remainingBudget}
      />

      {/* Analytics Charts */}
      <FinanceCharts
        monthlyComparison={monthlyComparison}
        categoryExpenseData={categoryExpenseData}
      />

      {/* Lower Row: Recent Transactions & Budget Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions
          transactions={formattedRecent}
          categories={categoryOptions}
        />
        <BudgetProgressList budgets={budgetProgress} />
      </div>
    </div>
  );
}
