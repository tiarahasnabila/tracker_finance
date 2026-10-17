"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { categorySchema, CategoryInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export interface CategoryActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function createCategoryAction(
  data: CategoryInput
): Promise<CategoryActionResult> {
  try {
    const user = await requireAuth();

    const validated = categorySchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data kategori tidak valid.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, type, color, icon } = validated.data;

    // Check duplicate personal category for this user
    const existing = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
        type,
      },
    });

    if (existing) {
      return {
        success: false,
        message: `Kategori "${name}" untuk jenis ini sudah ada di daftar Anda.`,
      };
    }

    await prisma.category.create({
      data: {
        name,
        type,
        color: color || (type === "INCOME" ? "#10b981" : "#ef4444"),
        icon: icon || "Tag",
        isSystem: false,
        userId: user.id,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Kategori baru berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Error createCategoryAction:", error);
    return {
      success: false,
      message: "Gagal membuat kategori.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  data: CategoryInput
): Promise<CategoryActionResult> {
  try {
    const user = await requireAuth();

    const validated = categorySchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Data kategori tidak valid.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    // Verify ownership
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, message: "Kategori tidak ditemukan." };
    }

    if (category.isSystem) {
      return {
        success: false,
        message: "Kategori sistem bawaan tidak dapat diubah.",
      };
    }

    if (category.userId !== user.id) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mengubah kategori ini.",
      };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        type: validated.data.type,
        color: validated.data.color,
        icon: validated.data.icon,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Kategori berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error updateCategoryAction:", error);
    return {
      success: false,
      message: "Gagal memperbarui kategori.",
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult> {
  try {
    const user = await requireAuth();

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: { where: { userId: user.id } },
            budgets: { where: { userId: user.id } },
          },
        },
      },
    });

    if (!category) {
      return { success: false, message: "Kategori tidak ditemukan." };
    }

    if (category.isSystem) {
      return {
        success: false,
        message: "Kategori sistem bawaan tidak dapat dihapus.",
      };
    }

    if (category.userId !== user.id) {
      return {
        success: false,
        message: "Anda tidak memiliki akses untuk menghapus kategori ini.",
      };
    }

    // Check if category is currently used in transactions or budgets
    if (category._count.transactions > 0) {
      return {
        success: false,
        message: `Kategori ini masih digunakan oleh ${category._count.transactions} transaksi. Hapus atau pindahkan transaksi terkait terlebih dahulu.`,
      };
    }

    if (category._count.budgets > 0) {
      return {
        success: false,
        message: `Kategori ini masih memiliki alokasi anggaran aktif. Hapus anggaran terkait terlebih dahulu.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Kategori berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleteCategoryAction:", error);
    return {
      success: false,
      message: "Gagal menghapus kategori.",
    };
  }
}
