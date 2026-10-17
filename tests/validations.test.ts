import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  transactionSchema,
  categorySchema,
  budgetSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const data = {
        name: "Ahmad Fauzi",
        email: "ahmad@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched password confirmation", () => {
      const data = {
        name: "Ahmad Fauzi",
        email: "ahmad@example.com",
        password: "password123",
        confirmPassword: "differentPassword",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
      }
    });

    it("should reject password shorter than 6 characters", () => {
      const data = {
        name: "Ahmad",
        email: "ahmad@example.com",
        password: "123",
        confirmPassword: "123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const data = {
        name: "Ahmad",
        email: "invalid-email-string",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("transactionSchema", () => {
    it("should accept valid transaction data", () => {
      const data = {
        title: "Gaji Bulanan",
        type: "INCOME",
        amount: 5000000,
        categoryId: "cat_123",
        date: "2026-10-17",
        notes: "Gaji bulan Oktober",
      };
      const result = transactionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject zero or negative amount", () => {
      const zeroData = {
        title: "Kopi",
        type: "EXPENSE",
        amount: 0,
        categoryId: "cat_123",
        date: "2026-10-17",
      };
      expect(transactionSchema.safeParse(zeroData).success).toBe(false);

      const negativeData = {
        ...zeroData,
        amount: -50000,
      };
      expect(transactionSchema.safeParse(negativeData).success).toBe(false);
    });

    it("should reject invalid transaction type", () => {
      const invalidType = {
        title: "Investasi",
        type: "UNKNOWN_TYPE",
        amount: 100000,
        categoryId: "cat_123",
        date: "2026-10-17",
      };
      expect(transactionSchema.safeParse(invalidType).success).toBe(false);
    });
  });

  describe("budgetSchema", () => {
    it("should validate month between 1 and 12 and positive amount", () => {
      const valid = {
        categoryId: "cat_exp",
        month: 10,
        year: 2026,
        amount: 2000000,
      };
      expect(budgetSchema.safeParse(valid).success).toBe(true);

      const invalidMonth = {
        ...valid,
        month: 13,
      };
      expect(budgetSchema.safeParse(invalidMonth).success).toBe(false);

      const invalidAmount = {
        ...valid,
        amount: -100,
      };
      expect(budgetSchema.safeParse(invalidAmount).success).toBe(false);
    });
  });

  describe("categorySchema", () => {
    it("should accept valid category with valid hex color", () => {
      const valid = {
        name: "Kopi & Kafe",
        type: "EXPENSE",
        color: "#f97316",
        icon: "Coffee",
      };
      expect(categorySchema.safeParse(valid).success).toBe(true);
    });

    it("should reject invalid hex color format", () => {
      const invalid = {
        name: "Kopi",
        type: "EXPENSE",
        color: "red-color-not-hex",
        icon: "Coffee",
      };
      expect(categorySchema.safeParse(invalid).success).toBe(false);
    });
  });
});
