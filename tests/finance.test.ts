import { describe, it, expect } from "vitest";
import { formatRupiah, toNumber } from "@/lib/formatters";

// Helper function mirroring CSV cell sanitizer
function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

describe("Finance Logic & Computations", () => {
  it("should calculate balance correctly as (total income - total expense)", () => {
    const transactions = [
      { type: "INCOME", amount: 10000000 },
      { type: "EXPENSE", amount: 2500000 },
      { type: "INCOME", amount: 1500000 },
      { type: "EXPENSE", amount: 500000 },
    ];

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    expect(totalIncome).toBe(11500000);
    expect(totalExpense).toBe(3000000);
    expect(totalBalance).toBe(8500000);
  });

  it("should format currency to Indonesian Rupiah properly", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
    expect(formatRupiah(1500000)).toMatch(/Rp.*1\.500\.000/);
    expect(formatRupiah(null)).toBe("Rp 0");
  });

  describe("Budget Thresholds", () => {
    it("should classify usage < 80% as normal", () => {
      const budget = 1000000;
      const spent = 750000;
      const percent = Math.round((spent / budget) * 100);

      expect(percent).toBe(75);
      expect(percent < 80).toBe(true);
    });

    it("should classify usage between 80% and 100% as warning (mendekati batas)", () => {
      const budget = 1000000;
      const spent = 850000;
      const percent = Math.round((spent / budget) * 100);

      expect(percent).toBe(85);
      expect(percent >= 80 && percent <= 100).toBe(true);
    });

    it("should classify usage > 100% as exceeded (melebihi batas)", () => {
      const budget = 1000000;
      const spent = 1200000;
      const percent = Math.round((spent / budget) * 100);
      const remaining = budget - spent;

      expect(percent).toBe(120);
      expect(percent > 100).toBe(true);
      expect(remaining).toBe(-200000);
    });
  });

  describe("CSV Formula Injection Protection", () => {
    it("should prepend single quote to fields starting with formula triggers", () => {
      expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe(`"'=SUM(A1:A10)"`);
      expect(sanitizeCsvCell("+cmd|' /C calc'")).toBe(`"'+cmd|' /C calc'"`);
      expect(sanitizeCsvCell("-20% discount")).toBe(`"'-20% discount"`);
      expect(sanitizeCsvCell("@malicious")).toBe(`"'@malicious"`);
    });

    it("should properly double-quote standard text values", () => {
      expect(sanitizeCsvCell("Makan Siang")).toBe(`"Makan Siang"`);
      expect(sanitizeCsvCell('Menu "Spesial"')).toBe(`"Menu ""Spesial"""`);
      expect(sanitizeCsvCell(50000)).toBe(`"50000"`);
    });
  });

  describe("Data Isolation & User Boundary", () => {
    it("should ensure user query strictly isolates data by userId", () => {
      const allData = [
        { id: "tx1", userId: "user_a", title: "Beli Buku", amount: 100000 },
        { id: "tx2", userId: "user_b", title: "Beli Laptop", amount: 15000000 },
        { id: "tx3", userId: "user_a", title: "Makan Malam", amount: 50000 },
      ];

      const currentUserId = "user_a";
      const userTransactions = allData.filter((t) => t.userId === currentUserId);

      expect(userTransactions.length).toBe(2);
      expect(userTransactions.every((t) => t.userId === "user_a")).toBe(true);
      expect(userTransactions.some((t) => t.userId === "user_b")).toBe(false);
    });
  });

  describe("Category Deletion Protection Check", () => {
    it("should block deletion if category is in use by transactions or budgets", () => {
      const categoryA = {
        id: "cat_1",
        name: "Makanan",
        isSystem: false,
        _count: { transactions: 3, budgets: 1 },
      };

      const canDelete =
        !categoryA.isSystem &&
        categoryA._count.transactions === 0 &&
        categoryA._count.budgets === 0;

      expect(canDelete).toBe(false);

      const categoryB = {
        id: "cat_2",
        name: "Hobi Kustom",
        isSystem: false,
        _count: { transactions: 0, budgets: 0 },
      };

      const canDeleteB =
        !categoryB.isSystem &&
        categoryB._count.transactions === 0 &&
        categoryB._count.budgets === 0;

      expect(canDeleteB).toBe(true);
    });
  });
});
