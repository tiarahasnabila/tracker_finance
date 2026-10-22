import { describe, it, expect } from "vitest";

describe("Anti-Impulse Sweat Cost & Financial Calculations", () => {
  it("should accurately convert price into working hours based on hourly wage", () => {
    const monthlyIncome = 8000000;
    const workingHoursPerMonth = 160; // 20 days x 8 hours
    const hourlyWage = Math.round(monthlyIncome / workingHoursPerMonth); // Rp 50.000/jam

    expect(hourlyWage).toBe(50000);

    const sneakerPrice = 1500000;
    const workHoursEquivalent = parseFloat((sneakerPrice / hourlyWage).toFixed(1));
    const workDays = parseFloat((workHoursEquivalent / 8).toFixed(1));

    expect(workHoursEquivalent).toBe(30.0);
    expect(workDays).toBe(3.8); // 3.8 days of hard work!
  });

  it("should detect if a purchase will cause a category budget deficit", () => {
    const budgetAmount = 1500000;
    const spentSoFar = 850000;
    const remainingBefore = budgetAmount - spentSoFar; // 650.000

    const itemPrice = 900000;
    const remainingAfter = remainingBefore - itemPrice; // -250.000

    expect(remainingBefore).toBe(650000);
    expect(remainingAfter).toBe(-250000);
    expect(remainingAfter < 0).toBe(true); // Triggers budget deficit warning
  });

  it("should calculate investment opportunity cost correctly", () => {
    const principal = 1000000;
    const annualRate = 0.07; // 7% p.a
    const years = 3;

    // Compound interest: A = P(1 + r)^t
    const futureValue = Math.round(principal * Math.pow(1 + annualRate, years));
    expect(futureValue).toBe(1225043); // Rp 1.225.043
  });
});
