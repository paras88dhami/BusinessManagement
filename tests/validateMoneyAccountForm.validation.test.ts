import { validateMoneyAccountForm } from "@/feature/accounts/validation/validateMoneyAccountForm";
import { describe, expect, it } from "vitest";

describe("validateMoneyAccountForm", () => {
  it("returns inline errors for missing create fields", () => {
    const result = validateMoneyAccountForm({
      mode: "create",
      name: "",
      balance: "",
    });

    expect(result).toEqual({
      name: "Account name is required.",
      balance: "Opening balance is required.",
    });
  });

  it("returns inline errors for invalid create balance", () => {
    expect(
      validateMoneyAccountForm({
        mode: "create",
        name: "Cash Box",
        balance: "abc",
      }),
    ).toEqual({
      balance: "Opening balance must be a valid number.",
    });

    expect(
      validateMoneyAccountForm({
        mode: "create",
        name: "Cash Box",
        balance: "-1",
      }),
    ).toEqual({
      balance: "Opening balance cannot be negative.",
    });
  });

  it("does not require editable opening balance in edit mode", () => {
    const result = validateMoneyAccountForm({
      mode: "edit",
      name: "Bank Account",
      balance: "",
    });

    expect(result).toEqual({});
  });
});
