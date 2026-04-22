import {
  validateOrderMoneyForm,
} from "@/feature/orders/validation/validateOrderMoneyForm";
import { describe, expect, it } from "vitest";

describe("validateOrderMoneyForm", () => {
  it("returns inline errors for missing required fields", () => {
    const result = validateOrderMoneyForm({
      amount: "",
      happenedAt: "",
      settlementMoneyAccountRemoteId: "",
      selectedMoneyAccountExists: false,
    });

    expect(result).toEqual({
      amount: "Amount is required.",
      happenedAt: "Enter a valid date in YYYY-MM-DD format.",
      settlementMoneyAccountRemoteId: "Choose a valid money account.",
    });
  });

  it("returns inline errors for invalid values", () => {
    const result = validateOrderMoneyForm({
      amount: "0",
      happenedAt: "2026-02-30",
      settlementMoneyAccountRemoteId: "money-1",
      selectedMoneyAccountExists: false,
    });

    expect(result).toEqual({
      amount: "Amount must be greater than zero.",
      happenedAt: "Enter a valid date in YYYY-MM-DD format.",
      settlementMoneyAccountRemoteId: "Choose a valid money account.",
    });
  });

  it("passes valid values", () => {
    const result = validateOrderMoneyForm({
      amount: "100",
      happenedAt: "2026-04-22",
      settlementMoneyAccountRemoteId: "money-1",
      selectedMoneyAccountExists: true,
    });

    expect(result).toEqual({});
  });
});
