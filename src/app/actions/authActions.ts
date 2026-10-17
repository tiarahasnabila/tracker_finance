"use server";

import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getCurrentUser,
  requireAuth,
} from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  profileSchema,
  changePasswordSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function registerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal. Periksa kembali isian formulir.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validated.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        message: "Email ini sudah terdaftar. Silakan gunakan email lain atau login.",
      };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    await createSession(user.id);

    return {
      success: true,
      message: "Pendaftaran berhasil! Mengalihkan ke dashboard...",
    };
  } catch (error) {
    console.error("Error registerAction:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memproses pendaftaran. Coba beberapa saat lagi.",
    };
  }
}

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Email atau password tidak valid.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Email atau password tidak cocok.",
      };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        message: "Email atau password tidak cocok.",
      };
    }

    await createSession(user.id);

    return {
      success: true,
      message: "Login berhasil! Membuka aplikasi...",
    };
  } catch (error) {
    console.error("Error loginAction:", error);
    return {
      success: false,
      message: "Gagal memproses login. Periksa koneksi Anda dan coba lagi.",
    };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    await destroySession();
    return { success: true };
  } catch (error) {
    console.error("Error logoutAction:", error);
    return { success: false, message: "Gagal keluar sesi." };
  }
}

export async function updateProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const currentUser = await requireAuth();

    const rawData = {
      name: formData.get("name"),
      avatar: formData.get("avatar") || undefined,
    };

    const validated = profileSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi data profil gagal.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validated.data.name,
        avatar: validated.data.avatar || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profil Anda berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error updateProfileAction:", error);
    return {
      success: false,
      message: "Gagal memperbarui profil. Pastikan Anda telah login.",
    };
  }
}

export async function changePasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const currentUser = await requireAuth();

    const rawData = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmNewPassword: formData.get("confirmNewPassword"),
    };

    const validated = changePasswordSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi password baru gagal.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return { success: false, message: "Pengguna tidak ditemukan." };
    }

    const isMatch = await verifyPassword(validated.data.currentPassword, user.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        message: "Password saat ini tidak sesuai.",
      };
    }

    const newHash = await hashPassword(validated.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return {
      success: true,
      message: "Password Anda berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error changePasswordAction:", error);
    return {
      success: false,
      message: "Gagal mengganti password.",
    };
  }
}
