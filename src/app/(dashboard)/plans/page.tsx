import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/formatters";
import { AppHeader } from "@/components/layout/AppHeader";
import { PlanManager, FormattedPlan } from "@/components/plans/PlanManager";

export const metadata: Metadata = {
  title: "Rencana Biaya & Kebutuhan",
  description: "Hitung dan kelola estimasi kebutuhan seluruh biaya acara atau wisuda Anda.",
};

export default async function PlansPage() {
  const user = await requireAuth();

  // 1. Fetch user plans and all their item breakdowns
  const plans = await prisma.plan.findMany({
    where: { userId: user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch categories for quick transaction modal in header
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { name: "asc" },
  });

  const formattedPlans: FormattedPlan[] = plans.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    targetDate: p.targetDate ? p.targetDate.toISOString() : null,
    status: p.status,
    targetBudget: p.targetBudget ? toNumber(p.targetBudget) : null,
    createdAt: p.createdAt.toISOString(),
    items: p.items.map((item) => ({
      id: item.id,
      planId: item.planId,
      title: item.title,
      category: item.category || "Lain-lain",
      estimated: toNumber(item.estimated),
      actual: toNumber(item.actual),
      status: item.status,
      notes: item.notes,
    })),
  }));

  return (
    <div>
      <AppHeader
        title="Rencana Biaya & Acara"
        subtitle="Kalkulasikan seluruh kebutuhan biaya acara besar (seperti wisuda) dengan rapi dan terkontrol"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }))}
      />

      <PlanManager initialPlans={formattedPlans} />
    </div>
  );
}
