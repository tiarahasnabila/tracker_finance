import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatIndonesianDate } from "@/lib/formatters";

/**
 * Sanitize cell to prevent CSV formula injection (OWASP CSV Injection)
 */
function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // If text starts with dangerous formula triggers: = + - @ \t \r
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type"); // "INCOME" | "EXPENSE"
    const categoryId = searchParams.get("categoryId");

    const whereClause: any = {
      userId: user.id,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      whereClause.type = type;
    }

    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        whereClause.date.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // CSV Headers
    const headers = [
      "No",
      "Tanggal",
      "Nama Transaksi",
      "Jenis",
      "Kategori",
      "Nominal (IDR)",
      "Catatan",
    ];

    const rows = transactions.map((t, index) => [
      index + 1,
      t.date.toISOString().split("T")[0],
      t.title,
      t.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      t.category.name,
      t.amount.toString(),
      t.notes || "",
    ]);

    // Build CSV with BOM (\uFEFF) for Excel UTF-8 compatibility
    const csvContent =
      "\uFEFF" +
      [
        headers.map((h) => sanitizeCsvCell(h)).join(","),
        ...rows.map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(",")),
      ].join("\r\n");

    const filename = `FinTrack_Laporan_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error in CSV export:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
