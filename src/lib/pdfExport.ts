import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah, formatIndonesianDate } from "@/lib/formatters";

interface ExportPdfParams {
  userName?: string;
  startDate?: string;
  endDate?: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactions: Array<{
    date: Date | string;
    title: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: {
      name: string;
    };
    notes?: string | null;
  }>;
}

export function exportTransactionsToPdf({
  userName = "Pengguna FinTrack",
  startDate,
  endDate,
  totalIncome,
  totalExpense,
  netBalance,
  transactions,
}: ExportPdfParams) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald 700
  const textColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const mutedColor: [number, number, number] = [100, 116, 139]; // Slate 500

  // 1. Header & Logo Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text("FinTrack", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Personal Finance Tracker Platform", 14, 25);

  // Garis batas atas
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 28, 196, 28);

  // 2. Info Dokumen & Periode
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.text("LAPORAN KEUANGAN PRIBADI", 14, 37);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);

  const periodeText =
    startDate || endDate
      ? `${startDate ? formatIndonesianDate(startDate) : "Awal"} s/d ${
          endDate ? formatIndonesianDate(endDate) : "Sekarang"
        }`
      : "Seluruh Periode";

  doc.text(`Pemilik Akun : ${userName}`, 14, 43);
  doc.text(`Periode Filter: ${periodeText}`, 14, 48);
  doc.text(
    `Waktu Cetak   : ${formatIndonesianDate(new Date(), true)}`,
    14,
    53
  );

  // 3. Ringkasan Kartu Finansial (Summary Box)
  // Box background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 58, 182, 22, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 58, 182, 22, 3, 3, "D");

  // Kolom 1: Total Pemasukan
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129); // Green
  doc.text("TOTAL PEMASUKAN", 20, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text(`+ ${formatRupiah(totalIncome)}`, 20, 73);

  // Kolom 2: Total Pengeluaran
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(239, 68, 68); // Red
  doc.text("TOTAL PENGELUARAN", 80, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(239, 68, 68);
  doc.text(`- ${formatRupiah(totalExpense)}`, 80, 73);

  // Kolom 3: Selisih Bersih (Net)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textColor);
  doc.text("SELISIH BERSIH (NET)", 140, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(netBalance >= 0 ? 15 : 239, netBalance >= 0 ? 23 : 68, netBalance >= 0 ? 42 : 68);
  doc.text(formatRupiah(netBalance), 140, 73);

  // 4. Tabel Transaksi (AutoTable)
  const tableRows = transactions.map((t, index) => [
    index + 1,
    formatIndonesianDate(t.date),
    t.title,
    t.category.name,
    t.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
    `${t.type === "INCOME" ? "+" : "-"} ${formatRupiah(t.amount)}`,
    t.notes || "-",
  ]);

  autoTable(doc, {
    startY: 86,
    head: [
      [
        "No",
        "Tanggal",
        "Nama Transaksi",
        "Kategori",
        "Jenis",
        "Nominal",
        "Catatan",
      ],
    ],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textColor,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: 42, fontStyle: "bold" },
      3: { cellWidth: 30 },
      4: { cellWidth: 22 },
      5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 22 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer Nomor Halaman
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(...mutedColor);
      doc.text(
        `FinTrack • Dokumen Resmi Pengelolaan Keuangan • Halaman ${currentPage} dari ${pageCount}`,
        14,
        290
      );
    },
  });

  // 5. Unduh file PDF
  const filename = `FinTrack_Laporan_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
