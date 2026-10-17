import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama maksimal 50 karakter"),
    email: z.string().email("Format email tidak valid").toLowerCase(),
    password: z.string().min(6, "Password minimal 6 karakter").max(100, "Password maksimal 100 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama maksimal 50 karakter"),
  avatar: z.string().url("URL avatar tidak valid").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(100),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmNewPassword"],
  });

export const transactionSchema = z.object({
  title: z.string().min(2, "Nama transaksi minimal 2 karakter").max(100, "Nama transaksi maksimal 100 karakter"),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Jenis transaksi harus berupa Pemasukan atau Pengeluaran",
  }),
  amount: z
    .number({ message: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih besar dari 0"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  date: z.string().min(1, "Tanggal transaksi wajib diisi"),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(50, "Nama kategori maksimal 50 karakter"),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Tipe kategori harus INCOME atau EXPENSE",
  }),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Format warna tidak valid").optional(),
  icon: z.string().min(1, "Ikon wajib dipilih").optional(),
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  amount: z
    .number({ message: "Batas anggaran harus berupa angka" })
    .positive("Batas anggaran harus lebih besar dari 0"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
