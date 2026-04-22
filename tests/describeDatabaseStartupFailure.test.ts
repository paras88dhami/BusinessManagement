import { beforeEach, describe, expect, it, vi } from "vitest";

const getDatabaseSetupErrorMock = vi.fn();

vi.mock("@/shared/database/createDatabase", () => ({
  getDatabaseSetupError: getDatabaseSetupErrorMock,
}));

describe("describeDatabaseStartupFailure", () => {
  beforeEach(() => {
    getDatabaseSetupErrorMock.mockReset();
  });

  it("classifies adapter setup failures from stored setup error", async () => {
    getDatabaseSetupErrorMock.mockReturnValue(
      new Error("JSI SQLiteAdapter not available."),
    );

    const { describeDatabaseStartupFailure } = await import(
      "@/shared/database/describeDatabaseStartupFailure"
    );

    const result = describeDatabaseStartupFailure(
      new Error("Ignored runtime wrapper message."),
    );

    expect(result).toEqual({
      source: "adapter_setup",
      reasonCode: "DB_ADAPTER_SETUP_FAILED",
      safeMessage: "The app could not open local data storage.",
      technicalMessage: "JSI SQLiteAdapter not available.",
    });
  });

  it("classifies database integrity failures", async () => {
    getDatabaseSetupErrorMock.mockReturnValue(null);

    const { describeDatabaseStartupFailure } = await import(
      "@/shared/database/describeDatabaseStartupFailure"
    );

    const result = describeDatabaseStartupFailure(
      new Error(
        "Database integrity check failed: missing unique index contacts_account_contact_type_identity_phone_active_unique_idx.",
      ),
    );

    expect(result).toEqual({
      source: "integrity_check",
      reasonCode: "DB_INTEGRITY_CHECK_FAILED",
      safeMessage:
        "The app found a local data issue and could not continue safely.",
      technicalMessage:
        "Database integrity check failed: missing unique index contacts_account_contact_type_identity_phone_active_unique_idx.",
    });
  });

  it("falls back to generic database startup failure", async () => {
    getDatabaseSetupErrorMock.mockReturnValue(null);

    const { describeDatabaseStartupFailure } = await import(
      "@/shared/database/describeDatabaseStartupFailure"
    );

    const result = describeDatabaseStartupFailure(
      new Error("Unexpected database startup failure."),
    );

    expect(result).toEqual({
      source: "unknown",
      reasonCode: "DB_STARTUP_FAILED",
      safeMessage: "The app could not initialize local data storage.",
      technicalMessage: "Unexpected database startup failure.",
    });
  });
});
