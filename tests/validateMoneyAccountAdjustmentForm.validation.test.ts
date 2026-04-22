import { validateMoneyAccountAdjustmentForm } from "@/feature/accounts/validation/validateMoneyAccountAdjustmentForm";
import { describe, expect, it } from "vitest";

describe("validateMoneyAccountAdjustmentForm", () => {
  it("returns inline errors for missing fields", () => {
    const result = validateMoneyAccountAdjustmentForm({
      targetBalance: "",
      reason: "",
    });

    expect(result).toEqual({
      targetBalance: "Correct balance is required.",
      reason: "Reason is required.",
    });
  });

  it("returns inline errors for invalid balance values", () => {
    expect(
      validateMoneyAccountAdjustmentForm({
        targetBalance: "abc",
        reason: "Counted at close",
      }),
    ).toEqual({
      targetBalance: "Correct balance must be a valid number.",
    });

    expect(
      validateMoneyAccountAdjustmentForm({
        targetBalance: "-1",
        reason: "Counted at close",
      }),
    ).toEqual({
      targetBalance: "Correct balance must be zero or greater.",
    });
  });

  it("passes valid values", () => {
    const result = validateMoneyAccountAdjustmentForm({
      targetBalance: "1200.50",
      reason: "Cash counted at closing",
    });

    expect(result).toEqual({});
  });
});
