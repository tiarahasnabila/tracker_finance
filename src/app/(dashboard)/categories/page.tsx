import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/layout/AppHeader";
import { CategoryManager } from "@/components/categories/CategoryManager";

export const metadata: Metadata = {
  title: "Kategori",
  description: "Kelola kategori transaksi pemasukan dan pengeluaran Anda.",
};

export default async function CategoriesPage() {
  const user = await requireAuth();

  // Fetch categories: system categories + user's personal categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    include: {
      _count: {
        select: {
          transactions: {
            where: { userId: user.id },
          },
          budgets: {
            where: { userId: user.id },
          },
        },
      },
    },
    orderBy: [
      { isSystem: "desc" },
      { name: "asc" },
    ],
  });

  return (
    <div>
      <AppHeader
        title="Kategori Transaksi"
        subtitle="Atur kategori sistem dan tambahkan kategori kustom sesuai gaya hidup Anda"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }))}
      />

      <CategoryManager categories={categories} />
    </div>
  );
}
