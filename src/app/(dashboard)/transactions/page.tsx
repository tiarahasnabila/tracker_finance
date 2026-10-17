import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/formatters";
import { AppHeader } from "@/components/layout/AppHeader";
import { TransactionTable } from "@/components/transactions/TransactionTable";

export const metadata: Metadata = {
  title: "Transaksi",
  description: "Kelola seluruh riwayat transaksi pemasukan dan pengeluaran Anda.",
};

export default async function TransactionsPage() {
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
    orderBy: {
      name: "asc",
    },
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
        title="Riwayat Transaksi"
        subtitle="Kelola, cari, dan pantau seluruh transaksi pemasukan dan pengeluaran"
        categories={categoryOptions}
      />

      <TransactionTable
        initialTransactions={formattedTransactions}
        categories={categoryOptions}
      />
    </div>
  );
}
