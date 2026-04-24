import { createRecordAuditEventUseCase } from "@/feature/audit/useCase/recordAuditEvent.useCase.impl";
import {
  AuditModule,
  AuditOutcome,
  AuditSeverity,
} from "@/feature/audit/types/audit.entity.types";
import { describe, expect, it, vi } from "vitest";

const buildPayload = (overrides: Record<string, unknown> = {}) => ({
  accountRemoteId: "account-1",
  ownerUserRemoteId: "owner-1",
  actorUserRemoteId: "actor-1",
  module: AuditModule.Transactions,
  action: "money_movement_posted",
  sourceModule: "transactions",
  sourceRemoteId: "txn-1",
  sourceAction: "post_money_movement",
  outcome: AuditOutcome.Success,
  severity: AuditSeverity.Info,
  summary: "Money movement posted.",
  metadataJson: JSON.stringify({ amount: 100 }),
  ...overrides,
});

describe("recordAuditEvent.useCase", () => {
  it("saves a valid audit event", async () => {
    const repository = {
      saveAuditEvent: vi.fn(async (payload) => ({
        success: true as const,
        value: {
          ...payload,
          syncStatus: "pending" as const,
          lastSyncedAt: null,
          deletedAt: null,
        },
      })),
    };
    const useCase = createRecordAuditEventUseCase(repository);

    const result = await useCase.execute(buildPayload());

    expect(result.success).toBe(true);
    expect(repository.saveAuditEvent).toHaveBeenCalledTimes(1);
  });

  it("rejects missing account context", async () => {
    const repository = {
      saveAuditEvent: vi.fn(),
    };
    const useCase = createRecordAuditEventUseCase(repository as never);

    const result = await useCase.execute(
      buildPayload({ accountRemoteId: "   " }) as never,
    );

    expect(result).toEqual({
      success: false,
      error: {
        type: "VALIDATION",
        message: "Audit account context is required.",
      },
    });
  });

  it("rejects missing actor context", async () => {
    const repository = {
      saveAuditEvent: vi.fn(),
    };
    const useCase = createRecordAuditEventUseCase(repository as never);

    const result = await useCase.execute(
      buildPayload({ actorUserRemoteId: "" }) as never,
    );

    expect(result).toEqual({
      success: false,
      error: {
        type: "VALIDATION",
        message: "Audit actor user context is required.",
      },
    });
  });

  it("rejects missing source record id", async () => {
    const repository = {
      saveAuditEvent: vi.fn(),
    };
    const useCase = createRecordAuditEventUseCase(repository as never);

    const result = await useCase.execute(
      buildPayload({ sourceRemoteId: "" }) as never,
    );

    expect(result).toEqual({
      success: false,
      error: {
        type: "VALIDATION",
        message: "Audit source record id is required.",
      },
    });
  });

  it("uses generated audit remote id when missing", async () => {
    const repository = {
      saveAuditEvent: vi.fn(async (payload) => ({
        success: true as const,
        value: {
          ...payload,
          syncStatus: "pending" as const,
          lastSyncedAt: null,
          deletedAt: null,
        },
      })),
    };
    const useCase = createRecordAuditEventUseCase(repository);

    await useCase.execute(
      buildPayload({
        remoteId: undefined,
      }) as never,
    );

    const savedPayload = repository.saveAuditEvent.mock.calls[0]?.[0];
    expect(savedPayload.remoteId.startsWith("audit-")).toBe(true);
  });
});
