import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/layout/AppHeader";
import { AntiImpulseChecker } from "@/components/anti-impulse/AntiImpulseChecker";

export const metadata: Metadata = {
  title: "AI Anti-Impulse Check",
  description: "Cek rasionalitas rencana belanja dengan audit jam kerja & anggaran riil berbasis AI.",
};

export default async function AntiImpulsePage() {
  const user = await requireAuth();

  // Fetch all categories for AppHeader quick transaction modal
  const allCategories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
      icon: true,
    },
    orderBy: [
      { isSystem: "desc" },
      { name: "asc" },
    ],
  });

  // Filter only expense categories for Anti-Impulse evaluation
  const expenseCategories = allCategories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
    }));

  return (
    <div className="space-y-6">
      <AppHeader
        title="AI Reality Check"
        subtitle="Uji kelayakan rencana belanja sebelum uangmu lenyap."
        categories={allCategories}
      />

      <AntiImpulseChecker categories={expenseCategories} />
    </div>
  );
}
