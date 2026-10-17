import { Decimal } from "@prisma/client/runtime/library";

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Format numbers or Prisma Decimals to Indonesian Rupiah currency format.
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | Decimal | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "Rp 0";
  }

  const num = typeof amount === "number" ? amount : Number(amount);
  if (isNaN(num)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Convert numeric/Decimal to standard number safely
 */
export function toNumber(value: number | string | Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format date to standard Indonesian localized format: "17 Oktober 2026"
 */
export function formatIndonesianDate(
  date: Date | string | null | undefined,
  includeTime = false
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

/**
 * Format ISO date string to YYYY-MM-DD for HTML input[type=date]
 */
export function toInputDate(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
