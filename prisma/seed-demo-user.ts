import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("Membuat akun demo dan data transaksi...");

  // 1. Pastikan kategori sistem tersedia
  const systemCategories = await prisma.category.findMany({
    where: { isSystem: true },
  });

  if (systemCategories.length === 0) {
    console.log("Kategori sistem belum ada, jalankan seeder terlebih dahulu.");
    return;
  }

  const categoryMap = new Map<string, string>();
  systemCategories.forEach((cat) => {
    categoryMap.set(cat.name, cat.id);
  });

  // 2. Buat / update User Demo
  const email = "demo@fintrack.id";
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 12);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // Hapus data lama akun demo untuk menghindari duplikasi
    await prisma.transaction.deleteMany({ where: { userId: user.id } });
    await prisma.budget.deleteMany({ where: { userId: user.id } });
    await prisma.category.deleteMany({ where: { userId: user.id, isSystem: false } });

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: "Budi Pratama",
        passwordHash,
      },
    });
    console.log("Akun demo yang sudah ada berhasil di-reset.");
  } else {
    user = await prisma.user.create({
      data: {
        name: "Budi Pratama",
        email,
        passwordHash,
      },
    });
    console.log("Akun demo baru berhasil dibuat.");
  }

  // 3. Tambahkan 2 Kategori Pribadi untuk Budi
  const catKopi = await prisma.category.create({
    data: {
      name: "Kopi & Kafe",
      type: TransactionType.EXPENSE,
      color: "#f97316",
      icon: "Coffee",
      isSystem: false,
      userId: user.id,
    },
  });

  const catBonus = await prisma.category.create({
    data: {
      name: "Bonus Kinerja & THR",
      type: TransactionType.INCOME,
      color: "#06b6d4",
      icon: "Zap",
      isSystem: false,
      userId: user.id,
    },
  });

  // Helper ID kategori
  const catGaji = categoryMap.get("Gaji") || systemCategories[0].id;
  const catFreelance = categoryMap.get("Freelance") || systemCategories[0].id;
  const catInvestasi = categoryMap.get("Investasi") || systemCategories[0].id;
  const catMakanan = categoryMap.get("Makanan & Minuman") || systemCategories[0].id;
  const catTransport = categoryMap.get("Transportasi") || systemCategories[0].id;
  const catTagihan = categoryMap.get("Tagihan & Utilitas") || systemCategories[0].id;
  const catTempatTinggal = categoryMap.get("Tempat Tinggal") || systemCategories[0].id;
  const catBelanja = categoryMap.get("Belanja") || systemCategories[0].id;
  const catHiburan = categoryMap.get("Hiburan") || systemCategories[0].id;
  const catPendidikan = categoryMap.get("Pendidikan") || systemCategories[0].id;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  // 4. Buat Anggaran Bulanan Periode Sekarang
  const budgets = [
    { categoryId: catMakanan, amount: 2500000 },
    { categoryId: catTransport, amount: 1000000 },
    { categoryId: catTagihan, amount: 1200000 },
    { categoryId: catBelanja, amount: 1500000 },
    { categoryId: catHiburan, amount: 500000 },
  ];

  for (const b of budgets) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: b.categoryId,
        month: currentMonth,
        year: currentYear,
        amount: new Decimal(b.amount),
      },
    });
  }

  // 5. Buat Transaksi Bulan Berjalan (Current Month)
  const currentTransactions = [
    {
      title: "Gaji Pokok Oktober",
      type: TransactionType.INCOME,
      amount: 14500000,
      categoryId: catGaji,
      date: new Date(currentYear, currentMonth - 1, 1, 9, 0),
      notes: "Transfer payroll kantor",
    },
    {
      title: "Proyek Landing Page Web",
      type: TransactionType.INCOME,
      amount: 4200000,
      categoryId: catFreelance,
      date: new Date(currentYear, currentMonth - 1, 5, 14, 30),
      notes: "Pembayaran termin 1 klien",
    },
    {
      title: "Dividen Reksadana Saham",
      type: TransactionType.INCOME,
      amount: 650000,
      categoryId: catInvestasi,
      date: new Date(currentYear, currentMonth - 1, 10, 10, 0),
      notes: "Pembagian dividen kuartal 3",
    },
    {
      title: "Sewa Tempat Tinggal / Kos",
      type: TransactionType.EXPENSE,
      amount: 2500000,
      categoryId: catTempatTinggal,
      date: new Date(currentYear, currentMonth - 1, 2, 8, 0),
      notes: "Sewa bulanan kamar",
    },
    {
      title: "Belanja Bulanan Supermarket",
      type: TransactionType.EXPENSE,
      amount: 1250000,
      categoryId: catBelanja,
      date: new Date(currentYear, currentMonth - 1, 3, 16, 0),
      notes: "Bahan makanan, sabun, dan kebutuhan rumah",
    },
    {
      title: "Tagihan Listrik PLN & Wi-Fi",
      type: TransactionType.EXPENSE,
      amount: 750000,
      categoryId: catTagihan,
      date: new Date(currentYear, currentMonth - 1, 4, 11, 0),
      notes: "Pembayaran via m-banking",
    },
    {
      title: "Makan Siang Resto Keluarga",
      type: TransactionType.EXPENSE,
      amount: 380000,
      categoryId: catMakanan,
      date: new Date(currentYear, currentMonth - 1, 7, 13, 0),
      notes: "Traktir keluarga akhir pekan",
    },
    {
      title: "Isi Bensin Mobil & Tol",
      type: TransactionType.EXPENSE,
      amount: 450000,
      categoryId: catTransport,
      date: new Date(currentYear, currentMonth - 1, 8, 9, 30),
      notes: "Pertamax + saldo e-toll",
    },
    {
      title: "Langganan Spotify & Netflix",
      type: TransactionType.EXPENSE,
      amount: 185000,
      categoryId: catHiburan,
      date: new Date(currentYear, currentMonth - 1, 9, 7, 0),
      notes: "Autodebet kartu debit",
    },
    {
      title: "Nongkrong & Es Kopi Susu",
      type: TransactionType.EXPENSE,
      amount: 65000,
      categoryId: catKopi.id,
      date: new Date(currentYear, currentMonth - 1, 12, 15, 0),
      notes: "Kopi Kenangan bareng rekan kerja",
    },
    {
      title: "Tiket Nonton Bioskop IMAX",
      type: TransactionType.EXPENSE,
      amount: 150000,
      categoryId: catHiburan,
      date: new Date(currentYear, currentMonth - 1, 14, 19, 0),
      notes: "Nonton film terbaru akhir pekan",
    },
    {
      title: "Buku Pemrograman TypeScript",
      type: TransactionType.EXPENSE,
      amount: 250000,
      categoryId: catPendidikan,
      date: new Date(currentYear, currentMonth - 1, 15, 12, 0),
      notes: "Gramedia online",
    },
  ];

  for (const t of currentTransactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: t.title,
        type: t.type,
        amount: new Decimal(t.amount),
        categoryId: t.categoryId,
        date: t.date,
        notes: t.notes,
      },
    });
  }

  // 6. Buat Transaksi untuk 5 Bulan Sebelumnya (agar Grafik Tren Arus Kas Terisi Cantik!)
  for (let offset = 1; offset <= 5; offset++) {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - offset);
    const m = pastDate.getMonth();
    const y = pastDate.getFullYear();

    // Pemasukan bulan lalu
    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: `Gaji Bulanan`,
        type: TransactionType.INCOME,
        amount: new Decimal(14000000 + offset * 200000),
        categoryId: catGaji,
        date: new Date(y, m, 1),
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: `Freelance / Pendapatan Sampingan`,
        type: TransactionType.INCOME,
        amount: new Decimal(2500000 + (offset % 2) * 1500000),
        categoryId: catFreelance,
        date: new Date(y, m, 12),
      },
    });

    // Pengeluaran bulan lalu
    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: `Sewa Tempat Tinggal`,
        type: TransactionType.EXPENSE,
        amount: new Decimal(2500000),
        categoryId: catTempatTinggal,
        date: new Date(y, m, 2),
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: `Kebutuhan Pokok & Makan`,
        type: TransactionType.EXPENSE,
        amount: new Decimal(2100000 + offset * 100000),
        categoryId: catMakanan,
        date: new Date(y, m, 10),
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: `Transportasi & Tagihan`,
        type: TransactionType.EXPENSE,
        amount: new Decimal(1100000 + offset * 50000),
        categoryId: catTransport,
        date: new Date(y, m, 18),
      },
    });
  }

  console.log("=========================================");
  console.log("SELESAI! Akun Demo FinTrack Siap Digunakan:");
  console.log(`Email    : ${email}`);
  console.log(`Password : ${password}`);
  console.log("Nama     : Budi Pratama");
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error("Error seeding demo user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
