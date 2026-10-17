"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { transactionSchema, TransactionInput } from "@/lib/validations";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

export interface TransactionActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function createTransactionAction(
  data: TransactionInput
): Promise<TransactionActionResult> {
  try {
    const user = await requireAuth();

    const validated = transactionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data transaksi tidak valid. Periksa kembali form.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { title, type, amount, categoryId, date, notes } = validated.data;

    // Verify category exists and belongs to system OR current user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isSystem: true }, { userId: user.id }],
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Kategori yang dipilih tidak valid atau tidak dapat diakses.",
      };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return {
        success: false,
        message: "Tanggal transaksi tidak valid.",
      };
    }

    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        title: title.trim(),
        type,
        amount: new Decimal(amount),
        date: parsedDate,
        notes: notes?.trim() || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return {
      success: true,
      message: "Transaksi berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Error createTransactionAction:", error);
    return {
      success: false,
      message: "Gagal menyimpan transaksi.",
    };
  }
}

export async function updateTransactionAction(
  id: string,
  data: TransactionInput
): Promise<TransactionActionResult> {
  try {
    const user = await requireAuth();

    const validated = transactionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data transaksi tidak valid.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    // Verify ownership
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses.",
      };
    }

    const { title, type, amount, categoryId, date, notes } = validated.data;

    // Verify category accessibility
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isSystem: true }, { userId: user.id }],
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Kategori tidak valid.",
      };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return {
        success: false,
        message: "Tanggal transaksi tidak valid.",
      };
    }

    await prisma.transaction.update({
      where: { id },
      data: {
        title: title.trim(),
        type,
        amount: new Decimal(amount),
        categoryId: category.id,
        date: parsedDate,
        notes: notes?.trim() || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return {
      success: true,
      message: "Transaksi berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error updateTransactionAction:", error);
    return {
      success: false,
      message: "Gagal memperbarui transaksi.",
    };
  }
}

export async function deleteTransactionAction(
  id: string
): Promise<TransactionActionResult> {
  try {
    const user = await requireAuth();

    // Verify ownership
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses.",
      };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return {
      success: true,
      message: "Transaksi berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleteTransactionAction:", error);
    return {
      success: false,
      message: "Gagal menghapus transaksi.",
    };
  }
}
