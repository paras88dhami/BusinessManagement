import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { DashboardTab } from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import {
    isDashboardRouteAllowed,
    isSlotOnlyDashboardRoute,
    resolveDashboardActiveTab,
    resolveDashboardHeaderConfig,
    resolveDashboardRouteKey,
} from "@/feature/dashboard/shell/viewModel/dashboardShell.shared";
import { describe, expect, it } from "vitest";

describe("dashboardShell.shared", () => {
  it("resolves dashboard route keys from route segments", () => {
    expect(resolveDashboardRouteKey(["(dashboard)", "business"])).toBe(
      "business",
    );
    expect(resolveDashboardRouteKey(["(dashboard)", "profile"])).toBe(
      "profile",
    );
    expect(resolveDashboardRouteKey(["(dashboard)", "settings"])).toBe(
      "settings",
    );
    expect(resolveDashboardRouteKey(["(dashboard)", "products"])).toBe(
      "products",
    );
    expect(resolveDashboardRouteKey(["(dashboard)", "inventory"])).toBe(
      "inventory",
    );
    expect(resolveDashboardRouteKey(["(dashboard)", "user-management"])).toBe(
      "user-management",
    );
    expect(resolveDashboardRouteKey(["(dashboard)", "unknown"])).toBeNull();
  });

  it("maps header and active tab configuration", () => {
    const businessHeader = resolveDashboardHeaderConfig({
      routeKey: "business",
      activeAccountDisplayName: "Dhami Suppliers",
      profileName: "Kapil Dhami",
    });
    expect(businessHeader.title).toBe("Dhami Suppliers");
    expect(businessHeader.showProfile).toBe(true);

    const personalHeader = resolveDashboardHeaderConfig({
      routeKey: "personal",
      activeAccountDisplayName: "Dhami Suppliers",
      profileName: "Kapil Dhami",
    });
    expect(personalHeader.title).toBe("Kapil Dhami");

    expect(resolveDashboardActiveTab("business")).toBe(DashboardTab.Home);
    expect(resolveDashboardActiveTab("products")).toBe(DashboardTab.More);
    expect(resolveDashboardActiveTab("inventory")).toBe(DashboardTab.More);
    expect(resolveDashboardActiveTab("personal-budget")).toBe(
      DashboardTab.Budget,
    );
  });

  it("applies account-type route guards", () => {
    expect(isDashboardRouteAllowed("ledger", AccountType.Business)).toBe(true);
    expect(isDashboardRouteAllowed("ledger", AccountType.Personal)).toBe(false);
    expect(isDashboardRouteAllowed("products", AccountType.Business)).toBe(
      true,
    );
    expect(isDashboardRouteAllowed("products", AccountType.Personal)).toBe(
      false,
    );
    expect(isDashboardRouteAllowed("inventory", AccountType.Business)).toBe(
      true,
    );
    expect(isDashboardRouteAllowed("inventory", AccountType.Personal)).toBe(
      false,
    );
    expect(
      isDashboardRouteAllowed("personal-transactions", AccountType.Personal),
    ).toBe(true);
    expect(
      isDashboardRouteAllowed("personal-transactions", AccountType.Business),
    ).toBe(false);
    expect(isDashboardRouteAllowed("profile", AccountType.Business)).toBe(true);
    expect(
      isDashboardRouteAllowed("user-management", AccountType.Business),
    ).toBe(true);
    expect(
      isDashboardRouteAllowed("user-management", AccountType.Personal),
    ).toBe(false);
  });

  it("marks slot-only routes correctly", () => {
    expect(isSlotOnlyDashboardRoute("profile")).toBe(true);
    expect(isSlotOnlyDashboardRoute("settings")).toBe(true);
    expect(isSlotOnlyDashboardRoute("user-management")).toBe(true);
    expect(isSlotOnlyDashboardRoute("business")).toBe(false);
  });
});
