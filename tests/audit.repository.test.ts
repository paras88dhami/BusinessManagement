import { createAuditRepository } from "@/feature/audit/data/repository/audit.repository.impl";
import {
  AuditModule,
  AuditOutcome,
  AuditSeverity,
} from "@/feature/audit/types/audit.entity.types";
import { describe, expect, it, vi } from "vitest";

describe("audit.repository", () => {
  it("maps AuditEventModel to AuditEvent", async () => {
    const datasource = {
      saveAuditEvent: vi.fn(async () => ({
        success: true as const,
        value: {
          remoteId: "audit-1",
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
          metadataJson: "{}",
          createdAt: new Date(1710000000000),
          syncStatus: "pending" as const,
          lastSyncedAt: null,
          deletedAt: null,
        },
      })),
    };
    const repository = createAuditRepository(datasource as never);

    const result = await repository.saveAuditEvent({
      remoteId: "audit-1",
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
      metadataJson: "{}",
      createdAt: 1710000000000,
    });

    expect(result).toEqual({
      success: true,
      value: {
        remoteId: "audit-1",
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
        metadataJson: "{}",
        createdAt: 1710000000000,
        syncStatus: "pending",
        lastSyncedAt: null,
        deletedAt: null,
      },
    });
  });

  it("maps datasource failure to AuditDatabaseError", async () => {
    const datasource = {
      saveAuditEvent: vi.fn(async () => ({
        success: false as const,
        error: new Error("database busy"),
      })),
    };
    const repository = createAuditRepository(datasource as never);

    const result = await repository.saveAuditEvent({
      remoteId: "audit-1",
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
      metadataJson: "{}",
      createdAt: 1710000000000,
    });

    expect(result).toEqual({
      success: false,
      error: {
        type: "DATABASE",
        message: "database busy",
      },
    });
  });
});
