import { describe, expect, it } from "vitest";
import { hasAccountPermissionWithAliases } from "@/feature/setting/accounts/userManagement/types/userManagementPermissionAlias.constants";

describe("userManagementPermissionAlias.constants", () => {
  it("grants direct permissions when code is present", () => {
    expect(
      hasAccountPermissionWithAliases(["products.view"], "products.view"),
    ).toBe(true);
  });

  it("grants compatibility access for products via POS view", () => {
    expect(hasAccountPermissionWithAliases(["pos.view"], "products.view")).toBe(
      true,
    );
  });

  it("grants compatibility access for inventory manage via POS checkout", () => {
    expect(
      hasAccountPermissionWithAliases(["pos.checkout"], "inventory.manage"),
    ).toBe(true);
  });

  it("denies when neither direct nor alias permissions exist", () => {
    expect(
      hasAccountPermissionWithAliases(["transactions.view"], "products.view"),
    ).toBe(false);
  });
});
