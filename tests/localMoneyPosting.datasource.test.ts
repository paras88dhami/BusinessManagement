import { MoneyAccountSyncStatus, MoneyAccountType } from "@/feature/accounts/types/moneyAccount.types";
import { createLocalMoneyPostingDatasource } from "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl";
import { mapTransactionModelToDomain } from "@/feature/transactions/data/repository/mapper/transaction.mapper";
import {
  SaveTransactionPayload,
  TransactionDirection,
  TransactionPostingStatus,
  TransactionSourceModule,
  TransactionSyncStatus,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import type { Database, Model } from "@nozbe/watermelondb";
import { describe, expect, it, vi } from "vitest";

type WhereClause = {
  type: "where";
  left: string;
  comparison: {
    operator: string;
    right?: {
      value?: unknown;
      values?: unknown[];
    };
  };
};

type MockTransactionRecord = {
  _raw: Record<string, number>;
  remoteId: string;
  ownerUserRemoteId: string;
  accountRemoteId: string;
  accountDisplayNameSnapshot: string;
  transactionType: string;
  direction: string;
  title: string;
  amount: number;
  currencyCode: string | null;
  categoryLabel: string | null;
  note: string | null;
  happenedAt: number;
  settlementMoneyAccountRemoteId: string | null;
  settlementMoneyAccountDisplayNameSnapshot: string | null;
  sourceModule: string | null;
  sourceRemoteId: string | null;
  sourceAction: string | null;
  idempotencyKey: string | null;
  postingStatus: string;
  contactRemoteId: string | null;
  recordSyncStatus: string;
  lastSyncedAt: number | null;
  deletedAt: number | null;
  createdAt: Date;
  updatedAt: Date;
  update: (mutator: (record: Model) => void) => Promise<void>;
};

type MockMoneyAccountRecord = {
  _raw: Record<string, number>;
  remoteId: string;
  ownerUserRemoteId: string;
  scopeAccountRemoteId: string;
  name: string;
  accountType: string;
  currentBalance: number;
  description: string | null;
  currencyCode: string | null;
  isPrimary: boolean;
  isActive: boolean;
  recordSyncStatus: string;
  lastSyncedAt: number | null;
  deletedAt: number | null;
  createdAt: Date;
  updatedAt: Date;
  update: (mutator: (record: Model) => void) => Promise<void>;
};

const isWhereClause = (clause: unknown): clause is WhereClause =>
  typeof clause === "object" &&
  clause !== null &&
  "type" in clause &&
  (clause as { type?: string }).type === "where" &&
  "left" in clause;

const createTransactionRecord = (
  overrides: Partial<MockTransactionRecord> = {},
): MockTransactionRecord => {
  const createdAtMs = overrides.createdAt?.getTime() ?? 1_700_000_000_000;
  const updatedAtMs = overrides.updatedAt?.getTime() ?? createdAtMs;

  const record: MockTransactionRecord = {
    _raw: {
      created_at: createdAtMs,
      updated_at: updatedAtMs,
    },
    remoteId: overrides.remoteId ?? "",
    ownerUserRemoteId: overrides.ownerUserRemoteId ?? "user-1",
    accountRemoteId: overrides.accountRemoteId ?? "business-1",
    accountDisplayNameSnapshot: overrides.accountDisplayNameSnapshot ?? "Main",
    transactionType: overrides.transactionType ?? TransactionType.Income,
    direction: overrides.direction ?? TransactionDirection.In,
    title: overrides.title ?? "Movement",
    amount: overrides.amount ?? 0,
    currencyCode: overrides.currencyCode ?? "NPR",
    categoryLabel: overrides.categoryLabel ?? "General",
    note: overrides.note ?? null,
    happenedAt: overrides.happenedAt ?? 1_710_000_000_000,
    settlementMoneyAccountRemoteId:
      overrides.settlementMoneyAccountRemoteId ?? "cash-1",
    settlementMoneyAccountDisplayNameSnapshot:
      overrides.settlementMoneyAccountDisplayNameSnapshot ?? "Cash",
    sourceModule: overrides.sourceModule ?? TransactionSourceModule.Manual,
    sourceRemoteId: overrides.sourceRemoteId ?? null,
    sourceAction: overrides.sourceAction ?? null,
    idempotencyKey: overrides.idempotencyKey ?? null,
    postingStatus: overrides.postingStatus ?? TransactionPostingStatus.Posted,
    contactRemoteId: overrides.contactRemoteId ?? null,
    recordSyncStatus:
      overrides.recordSyncStatus ?? TransactionSyncStatus.PendingCreate,
    lastSyncedAt: overrides.lastSyncedAt ?? null,
    deletedAt: overrides.deletedAt ?? null,
    createdAt: overrides.createdAt ?? new Date(createdAtMs),
    updatedAt: overrides.updatedAt ?? new Date(updatedAtMs),
    update: vi.fn(async (mutator: (record: Model) => void) => {
      mutator(record as unknown as Model);
      record.createdAt = new Date(record._raw.created_at);
      record.updatedAt = new Date(record._raw.updated_at);
    }),
  };

  return record;
};

const createMoneyAccountRecord = (
  overrides: Partial<MockMoneyAccountRecord> = {},
): MockMoneyAccountRecord => {
  const updatedAtMs = overrides.updatedAt?.getTime() ?? 1_700_000_000_000;

  const record: MockMoneyAccountRecord = {
    _raw: {
      updated_at: updatedAtMs,
    },
    remoteId: overrides.remoteId ?? "cash-1",
    ownerUserRemoteId: overrides.ownerUserRemoteId ?? "user-1",
    scopeAccountRemoteId: overrides.scopeAccountRemoteId ?? "business-1",
    name: overrides.name ?? "Cash Drawer",
    accountType: overrides.accountType ?? MoneyAccountType.Cash,
    currentBalance: overrides.currentBalance ?? 0,
    description: overrides.description ?? null,
    currencyCode: overrides.currencyCode ?? "NPR",
    isPrimary: overrides.isPrimary ?? true,
    isActive: overrides.isActive ?? true,
    recordSyncStatus: overrides.recordSyncStatus ?? MoneyAccountSyncStatus.Synced,
    lastSyncedAt: overrides.lastSyncedAt ?? null,
    deletedAt: overrides.deletedAt ?? null,
    createdAt: overrides.createdAt ?? new Date(updatedAtMs),
    updatedAt: overrides.updatedAt ?? new Date(updatedAtMs),
    update: vi.fn(async (mutator: (record: Model) => void) => {
      mutator(record as unknown as Model);
      record.updatedAt = new Date(record._raw.updated_at);
    }),
  };

  return record;
};

const createPayload = (
  overrides: Partial<SaveTransactionPayload> = {},
): SaveTransactionPayload => ({
  remoteId: overrides.remoteId ?? "txn-1",
  ownerUserRemoteId: overrides.ownerUserRemoteId ?? "user-1",
  accountRemoteId: overrides.accountRemoteId ?? "business-1",
  accountDisplayNameSnapshot: overrides.accountDisplayNameSnapshot ?? "Main Business",
  transactionType: overrides.transactionType ?? TransactionType.Income,
  direction: overrides.direction ?? TransactionDirection.In,
  title: overrides.title ?? "Movement",
  amount: overrides.amount ?? 100,
  currencyCode: overrides.currencyCode ?? "NPR",
  categoryLabel: overrides.categoryLabel ?? "General",
  note: overrides.note ?? null,
  happenedAt: overrides.happenedAt ?? 1_710_000_000_000,
  settlementMoneyAccountRemoteId:
    overrides.settlementMoneyAccountRemoteId ?? "cash-1",
  settlementMoneyAccountDisplayNameSnapshot:
    overrides.settlementMoneyAccountDisplayNameSnapshot ?? "Cash Drawer",
  sourceModule: overrides.sourceModule ?? TransactionSourceModule.Manual,
  sourceRemoteId: overrides.sourceRemoteId ?? null,
  sourceAction: overrides.sourceAction ?? null,
  idempotencyKey: overrides.idempotencyKey ?? null,
  postingStatus: overrides.postingStatus ?? TransactionPostingStatus.Posted,
  contactRemoteId: overrides.contactRemoteId ?? null,
});

const createDatasourceHarness = ({
  transactions = [],
  moneyAccounts = [],
}: {
  transactions?: MockTransactionRecord[];
  moneyAccounts?: MockMoneyAccountRecord[];
}) => {
  const transactionRecords = [...transactions];
  const moneyAccountRecords = [...moneyAccounts];

  const transactionsCollection = {
    query: (...clauses: unknown[]) => ({
      fetch: async () => {
        let filtered = [...transactionRecords];

        for (const clause of clauses) {
          if (!isWhereClause(clause)) {
            continue;
          }

          const rightValue = clause.comparison.right?.value;

          if (clause.left === "remote_id" && typeof rightValue === "string") {
            filtered = filtered.filter((record) => record.remoteId === rightValue);
          }

          if (
            clause.left === "idempotency_key" &&
            typeof rightValue === "string"
          ) {
            filtered = filtered.filter(
              (record) => record.idempotencyKey === rightValue,
            );
          }

          if (clause.left === "deleted_at" && rightValue === null) {
            filtered = filtered.filter((record) => record.deletedAt === null);
          }
        }

        return filtered as unknown as Model[];
      },
    }),
    create: vi.fn(async (builder: (record: Model) => void) => {
      const now = Date.now();
      const record = createTransactionRecord({
        createdAt: new Date(now),
        updatedAt: new Date(now),
      });

      builder(record as unknown as Model);
      record.createdAt = new Date(record._raw.created_at);
      record.updatedAt = new Date(record._raw.updated_at);
      transactionRecords.push(record);

      return record as unknown as Model;
    }),
  };

  const moneyAccountsCollection = {
    query: (...clauses: unknown[]) => ({
      fetch: async () => {
        let filtered = [...moneyAccountRecords];

        for (const clause of clauses) {
          if (!isWhereClause(clause)) {
            continue;
          }

          const rightValue = clause.comparison.right?.value;

          if (clause.left === "remote_id" && typeof rightValue === "string") {
            filtered = filtered.filter((record) => record.remoteId === rightValue);
          }

          if (clause.left === "deleted_at" && rightValue === null) {
            filtered = filtered.filter((record) => record.deletedAt === null);
          }
        }

        return filtered as unknown as Model[];
      },
    }),
  };

  const database = {
    get: vi.fn((table: string) => {
      if (table === "transactions") {
        return transactionsCollection;
      }

      if (table === "money_accounts") {
        return moneyAccountsCollection;
      }

      throw new Error(`Unexpected table lookup: ${table}`);
    }),
    write: vi.fn(async (action: () => Promise<unknown>) => action()),
  } as unknown as Database;

  return {
    datasource: createLocalMoneyPostingDatasource(database),
    transactionRecords,
    moneyAccountRecords,
  };
};

describe("local.moneyPosting.datasource", () => {
  it("persists contactRemoteId on create and preserves it through domain mapping", async () => {
    const harness = createDatasourceHarness({
      moneyAccounts: [createMoneyAccountRecord({ currentBalance: 500 })],
    });

    const result = await harness.datasource.postMoneyMovement(
      createPayload({
        remoteId: "txn-create",
        amount: 75,
        contactRemoteId: "contact-1",
      }),
    );

    expect(result.success).toBe(true);
    expect(harness.transactionRecords).toHaveLength(1);
    expect(harness.transactionRecords[0].contactRemoteId).toBe("contact-1");

    if (!result.success) {
      return;
    }

    const mapped = await mapTransactionModelToDomain(result.value);
    expect(mapped.contactRemoteId).toBe("contact-1");
  });

  it("persists changed contactRemoteId on update", async () => {
    const existing = createTransactionRecord({
      remoteId: "txn-update",
      amount: 50,
      contactRemoteId: "contact-old",
      settlementMoneyAccountRemoteId: "cash-1",
      postingStatus: TransactionPostingStatus.Posted,
      recordSyncStatus: TransactionSyncStatus.Synced,
    });
    const harness = createDatasourceHarness({
      transactions: [existing],
      moneyAccounts: [createMoneyAccountRecord({ currentBalance: 500 })],
    });

    const result = await harness.datasource.postMoneyMovement(
      createPayload({
        remoteId: "txn-update",
        amount: 80,
        contactRemoteId: "contact-new",
      }),
    );

    expect(result.success).toBe(true);
    expect(existing.contactRemoteId).toBe("contact-new");
    expect(harness.moneyAccountRecords[0].currentBalance).toBe(530);
  });

  it("stores null contactRemoteId when caller omits it", async () => {
    const harness = createDatasourceHarness({
      moneyAccounts: [createMoneyAccountRecord({ currentBalance: 200 })],
    });
    const payloadWithoutContact = createPayload({
      remoteId: "txn-no-contact",
      amount: 25,
    });

    delete (payloadWithoutContact as { contactRemoteId?: string | null })
      .contactRemoteId;

    const result =
      await harness.datasource.postMoneyMovement(payloadWithoutContact);

    expect(result.success).toBe(true);
    expect(harness.transactionRecords[0].contactRemoteId).toBeNull();
  });

  it("keeps money-account balance behavior unchanged regardless of contactRemoteId", async () => {
    const withContact = createDatasourceHarness({
      moneyAccounts: [createMoneyAccountRecord({ currentBalance: 300 })],
    });
    const withoutContact = createDatasourceHarness({
      moneyAccounts: [createMoneyAccountRecord({ currentBalance: 300 })],
    });

    const withContactResult = await withContact.datasource.postMoneyMovement(
      createPayload({
        remoteId: "txn-with-contact",
        amount: 45,
        contactRemoteId: "contact-1",
      }),
    );
    const withoutContactResult =
      await withoutContact.datasource.postMoneyMovement(
        createPayload({
          remoteId: "txn-without-contact",
          amount: 45,
          contactRemoteId: null,
        }),
      );

    expect(withContactResult.success).toBe(true);
    expect(withoutContactResult.success).toBe(true);
    expect(withContact.moneyAccountRecords[0].currentBalance).toBe(345);
    expect(withoutContact.moneyAccountRecords[0].currentBalance).toBe(345);
  });
});
