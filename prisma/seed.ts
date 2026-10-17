import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const systemCategories = [
  // Income
  { name: "Gaji", type: TransactionType.INCOME, color: "#10b981", icon: "Briefcase", isSystem: true },
  { name: "Freelance", type: TransactionType.INCOME, color: "#06b6d4", icon: "Laptop", isSystem: true },
  { name: "Bisnis", type: TransactionType.INCOME, color: "#3b82f6", icon: "Store", isSystem: true },
  { name: "Investasi", type: TransactionType.INCOME, color: "#8b5cf6", icon: "TrendingUp", isSystem: true },
  { name: "Hadiah", type: TransactionType.INCOME, color: "#ec4899", icon: "Gift", isSystem: true },
  { name: "Lainnya (Pemasukan)", type: TransactionType.INCOME, color: "#64748b", icon: "PlusCircle", isSystem: true },

  // Expense
  { name: "Makanan & Minuman", type: TransactionType.EXPENSE, color: "#f97316", icon: "Utensils", isSystem: true },
  { name: "Transportasi", type: TransactionType.EXPENSE, color: "#eab308", icon: "Car", isSystem: true },
  { name: "Tempat Tinggal", type: TransactionType.EXPENSE, color: "#6366f1", icon: "Home", isSystem: true },
  { name: "Pendidikan", type: TransactionType.EXPENSE, color: "#0ea5e9", icon: "GraduationCap", isSystem: true },
  { name: "Tagihan & Utilitas", type: TransactionType.EXPENSE, color: "#ef4444", icon: "Receipt", isSystem: true },
  { name: "Kesehatan", type: TransactionType.EXPENSE, color: "#14b8a6", icon: "HeartPulse", isSystem: true },
  { name: "Hiburan", type: TransactionType.EXPENSE, color: "#d946ef", icon: "Gamepad2", isSystem: true },
  { name: "Belanja", type: TransactionType.EXPENSE, color: "#f43f5e", icon: "ShoppingBag", isSystem: true },
  { name: "Tabungan & Investasi", type: TransactionType.EXPENSE, color: "#22c55e", icon: "PiggyBank", isSystem: true },
  { name: "Lainnya (Pengeluaran)", type: TransactionType.EXPENSE, color: "#94a3b8", icon: "MoreHorizontal", isSystem: true },
];

async function main() {
  console.log("Seeding default system categories...");
  for (const cat of systemCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        type: cat.type,
        isSystem: true,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
    }
  }
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
