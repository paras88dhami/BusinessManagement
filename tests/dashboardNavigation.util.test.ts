import { describe, expect, it } from "vitest";
import { DashboardTab } from "@/feature/dashboard/shared/types/dashboardNavigation.types";
import {
  buildInitials,
  getDashboardHomePath,
  getDashboardTabPath,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";

describe("dashboardNavigation.util", () => {
  it("returns account-specific home paths", () => {
    expect(getDashboardHomePath(AccountType.Business)).toBe(
      "/(dashboard)/business",
    );
    expect(getDashboardHomePath(AccountType.Personal)).toBe(
      "/(dashboard)/personal",
    );
  });

  it("maps shared tabs to role-specific target routes", () => {
    expect(getDashboardTabPath(DashboardTab.Ledger, AccountType.Business)).toBe(
      "/(dashboard)/ledger",
    );
    expect(getDashboardTabPath(DashboardTab.Ledger, AccountType.Personal)).toBe(
      "/(dashboard)/personal-transactions",
    );
    expect(getDashboardTabPath(DashboardTab.Pos, AccountType.Personal)).toBe(
      "/(dashboard)/personal",
    );
  });

  it("builds initials safely for edge-case names", () => {
    expect(buildInitials("")).toBe("EL");
    expect(buildInitials("kapil")).toBe("KA");
    expect(buildInitials("kapil dev")).toBe("KD");
    expect(buildInitials("  s  ")).toBe("S");
  });
});
