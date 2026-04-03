import { describe, expect, it } from "vitest";
import { MORE_DASHBOARD_MENU_PERMISSION_CODE } from "@/feature/dashboard/more/types/moreDashboardPermission.constants";

describe("moreDashboardPermission.constants", () => {
  it("maps dashboard menu items to permission codes", () => {
    expect(MORE_DASHBOARD_MENU_PERMISSION_CODE.profile).toBe("profile.view");
    expect(MORE_DASHBOARD_MENU_PERMISSION_CODE.ledger).toBe("ledger.view");
    expect(MORE_DASHBOARD_MENU_PERMISSION_CODE.products).toBe("products.view");
    expect(MORE_DASHBOARD_MENU_PERMISSION_CODE.inventory).toBe("inventory.view");
    expect(MORE_DASHBOARD_MENU_PERMISSION_CODE.userManagement).toBe(
      "user_management.view",
    );
  });
});
