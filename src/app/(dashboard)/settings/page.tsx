import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/layout/AppHeader";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
  description: "Kelola profil pribadi, kata sandi, dan preferensi akun Anda.",
};

export default async function SettingsPage() {
  const user = await requireAuth();

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AppHeader
        title="Pengaturan Akun"
        subtitle="Kelola informasi profil, keamanan akun, dan preferensi pengguna"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }))}
      />

      <SettingsView user={user} />
    </div>
  );
}
