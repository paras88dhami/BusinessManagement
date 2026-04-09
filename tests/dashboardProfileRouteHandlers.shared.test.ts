import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { createDashboardProfileRouteHandlers } from "@/feature/profile/screen/factory/dashboardProfileRouteHandlers.shared";
import { describe, expect, it, vi } from "vitest";

describe("dashboardProfileRouteHandlers.shared", () => {
  it("navigates to account-specific home routes", () => {
    const replaceCalls: string[] = [];

    const handlers = createDashboardProfileRouteHandlers({
      activeUserRemoteId: "user-1",
      activeAccountRemoteId: "acct-1",
      activeAccountType: AccountType.Business,
      navigateReplace: (targetPath) => replaceCalls.push(targetPath),
      navigatePush: vi.fn(),
      clearUserSession: async () => {},
      refreshSession: async () => {},
    });

    handlers.onNavigateHome(AccountType.Personal);
    handlers.onBackToHome();

    expect(replaceCalls).toEqual([
      "/(dashboard)/personal",
      "/(dashboard)/business",
    ]);
  });

  it("falls back to personal home when active account type is missing", () => {
    const replace = vi.fn();

    const handlers = createDashboardProfileRouteHandlers({
      activeUserRemoteId: "user-1",
      activeAccountRemoteId: "acct-1",
      activeAccountType: null,
      navigateReplace: replace,
      navigatePush: vi.fn(),
      clearUserSession: async () => {},
      refreshSession: async () => {},
    });

    handlers.onBackToHome();
    expect(replace).toHaveBeenCalledWith("/(dashboard)/personal");
  });

  it("runs logout flow in order", async () => {
    const calls: string[] = [];

    const handlers = createDashboardProfileRouteHandlers({
      activeUserRemoteId: "user-1",
      activeAccountRemoteId: "acct-1",
      activeAccountType: AccountType.Personal,
      navigateReplace: vi.fn(),
      navigatePush: vi.fn(),
      clearUserSession: async () => {
        calls.push("clear");
      },
      refreshSession: async () => {
        calls.push("refresh");
      },
    });

    await handlers.onLogout();
    expect(calls).toEqual(["clear", "refresh"]);
  });

  it("captures logout errors without throwing", async () => {
    const refreshSessionSpy = vi.fn(async () => {});

    const handlers = createDashboardProfileRouteHandlers({
      activeUserRemoteId: "user-1",
      activeAccountRemoteId: "acct-1",
      activeAccountType: AccountType.Personal,
      navigateReplace: vi.fn(),
      navigatePush: vi.fn(),
      clearUserSession: async () => {
        throw new Error("clear-failed");
      },
      refreshSession: refreshSessionSpy,
    });

    await expect(handlers.onLogout()).resolves.toBeUndefined();
    expect(refreshSessionSpy).not.toHaveBeenCalled();
  });

  it("opens dashboard settings from profile actions", () => {
    const push = vi.fn();

    const handlers = createDashboardProfileRouteHandlers({
      activeUserRemoteId: "user-1",
      activeAccountRemoteId: "acct-1",
      activeAccountType: AccountType.Personal,
      navigateReplace: vi.fn(),
      navigatePush: push,
      clearUserSession: async () => {},
      refreshSession: async () => {},
    });

    handlers.onOpenSettings();
    expect(push).toHaveBeenCalledWith("/(dashboard)/settings");
  });
});
