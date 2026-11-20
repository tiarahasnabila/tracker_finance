"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { planSchema, planItemSchema, PlanInput, PlanItemInput } from "@/lib/validations";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

export interface PlanActionResult {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string[]>;
}

// ----------------- PLAN ACTIONS -----------------

export async function createPlanAction(data: PlanInput): Promise<PlanActionResult> {
  try {
    const user = await requireAuth();

    const validated = planSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data rencana tidak valid.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { title, description, targetDate, targetBudget, status } = validated.data;

    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        targetBudget: targetBudget !== undefined && targetBudget !== null ? new Decimal(targetBudget) : null,
        status: status || "PLANNING",
      },
    });

    revalidatePath("/plans");
    return {
      success: true,
      message: "Rencana berhasil dibuat.",
      data: plan,
    };
  } catch (error) {
    console.error("createPlanAction error:", error);
    return {
      success: false,
      message: "Gagal membuat rencana. Terjadi kesalahan pada server.",
    };
  }
}

export async function updatePlanAction(
  id: string,
  data: Partial<PlanInput>
): Promise<PlanActionResult> {
  try {
    const user = await requireAuth();

    const existing = await prisma.plan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return {
        success: false,
        message: "Rencana tidak ditemukan atau bukan milik Anda.",
      };
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }
    if (data.targetBudget !== undefined) {
      updateData.targetBudget =
        data.targetBudget !== null && data.targetBudget !== undefined
          ? new Decimal(data.targetBudget)
          : null;
    }
    if (data.status !== undefined) updateData.status = data.status;

    await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/plans");
    revalidatePath(`/plans/${id}`);
    return {
      success: true,
      message: "Rencana berhasil diperbarui.",
    };
  } catch (error) {
    console.error("updatePlanAction error:", error);
    return {
      success: false,
      message: "Gagal memperbarui rencana.",
    };
  }
}

export async function deletePlanAction(id: string): Promise<PlanActionResult> {
  try {
    const user = await requireAuth();

    const existing = await prisma.plan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return {
        success: false,
        message: "Rencana tidak ditemukan atau bukan milik Anda.",
      };
    }

    await prisma.plan.delete({
      where: { id },
    });

    revalidatePath("/plans");
    return {
      success: true,
      message: "Rencana beserta item di dalamnya berhasil dihapus.",
    };
  } catch (error) {
    console.error("deletePlanAction error:", error);
    return {
      success: false,
      message: "Gagal menghapus rencana.",
    };
  }
}

// ----------------- PLAN ITEM ACTIONS -----------------

export async function createPlanItemAction(data: PlanItemInput): Promise<PlanActionResult> {
  try {
    const user = await requireAuth();

    const validated = planItemSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data item tidak valid.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { planId, title, category, estimated, actual, status, notes } = validated.data;

    // Verify ownership of the plan
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId: user.id },
    });

    if (!plan) {
      return {
        success: false,
        message: "Rencana tidak ditemukan atau bukan milik Anda.",
      };
    }

    const item = await prisma.planItem.create({
      data: {
        planId,
        title,
        category: category?.trim() || "Lain-lain",
        estimated: new Decimal(estimated),
        actual: new Decimal(actual || 0),
        status: status || "UNPAID",
        notes: notes || null,
      },
    });

    revalidatePath("/plans");
    revalidatePath(`/plans/${planId}`);
    return {
      success: true,
      message: "Kebutuhan berhasil ditambahkan ke rencana.",
      data: {
        id: item.id,
        planId: item.planId,
        title: item.title,
        category: item.category,
        estimated: Number(item.estimated),
        actual: Number(item.actual),
        status: item.status,
        notes: item.notes,
      },
    };
  } catch (error) {
    console.error("createPlanItemAction error:", error);
    return {
      success: false,
      message: "Gagal menambahkan item kebutuhan.",
    };
  }
}

export async function updatePlanItemAction(
  id: string,
  data: Partial<PlanItemInput>
): Promise<PlanActionResult> {
  try {
    const user = await requireAuth();

    // Verify ownership via relation
    const item = await prisma.planItem.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!item || item.plan.userId !== user.id) {
      return {
        success: false,
        message: "Item kebutuhan tidak ditemukan.",
      };
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category?.trim() || "Lain-lain";
    if (data.estimated !== undefined) updateData.estimated = new Decimal(data.estimated);
    if (data.actual !== undefined) updateData.actual = new Decimal(data.actual);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    await prisma.planItem.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/plans");
    revalidatePath(`/plans/${item.planId}`);
    return {
      success: true,
      message: "Item kebutuhan berhasil diperbarui.",
    };
  } catch (error) {
    console.error("updatePlanItemAction error:", error);
    return {
      success: false,
      message: "Gagal memperbarui item kebutuhan.",
    };
  }
}

export async function deletePlanItemAction(id: string): Promise<PlanActionResult> {
  try {
    const user = await requireAuth();

    const item = await prisma.planItem.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!item || item.plan.userId !== user.id) {
      return {
        success: false,
        message: "Item kebutuhan tidak ditemukan.",
      };
    }

    await prisma.planItem.delete({
      where: { id },
    });

    revalidatePath("/plans");
    revalidatePath(`/plans/${item.planId}`);
    return {
      success: true,
      message: "Item kebutuhan berhasil dihapus.",
    };
  } catch (error) {
    console.error("deletePlanItemAction error:", error);
    return {
      success: false,
      message: "Gagal menghapus item kebutuhan.",
    };
  }
}
