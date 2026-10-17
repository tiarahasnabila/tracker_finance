"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { budgetSchema, BudgetInput } from "@/lib/validations";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

export interface BudgetActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function upsertBudgetAction(
  data: BudgetInput
): Promise<BudgetActionResult> {
  try {
    const user = await requireAuth();

    const validated = budgetSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data anggaran tidak valid.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { categoryId, month, year, amount } = validated.data;

    // Verify category exists and is an EXPENSE category
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        type: "EXPENSE",
        OR: [{ isSystem: true }, { userId: user.id }],
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Kategori tidak valid atau bukan kategori pengeluaran.",
      };
    }

    // Upsert budget for unique [userId, categoryId, month, year]
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId,
          month,
          year,
        },
      },
      update: {
        amount: new Decimal(amount),
      },
      create: {
        userId: user.id,
        categoryId,
        month,
        year,
        amount: new Decimal(amount),
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Anggaran berhasil disimpan.",
    };
  } catch (error) {
    console.error("Error upsertBudgetAction:", error);
    return {
      success: false,
      message: "Gagal menyimpan alokasi anggaran.",
    };
  }
}

export async function deleteBudgetAction(
  id: string
): Promise<BudgetActionResult> {
  try {
    const user = await requireAuth();

    const existing = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        message: "Anggaran tidak ditemukan atau Anda tidak memiliki akses.",
      };
    }

    await prisma.budget.delete({
      where: { id },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Anggaran berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleteBudgetAction:", error);
    return {
      success: false,
      message: "Gagal menghapus anggaran.",
    };
  }
}
