import { MoneyAccountModel } from "@/feature/accounts/data/dataSource/db/moneyAccount.model";
import { MoneyAccountSyncStatus } from "@/feature/accounts/types/moneyAccount.types";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import {
  SaveTransactionPayload,
  TransactionDirection,
  TransactionPostingStatus,
  TransactionSyncStatus,
} from "@/feature/transactions/types/transaction.entity.types";
import { Result } from "@/shared/types/result.types";
import { Collection, Database, Q } from "@nozbe/watermelondb";
import { MoneyPostingDatasource } from "./moneyPosting.datasource";

const TRANSACTIONS_TABLE = "transactions";
const MONEY_ACCOUNTS_TABLE = "money_accounts";

const setTransactionCreatedAndUpdatedAt = (
  record: TransactionModel,
  now: number,
) => {
  (record as unknown as { _raw: Record<string, number> })._raw.created_at = now;
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const setTransactionUpdatedAt = (record: TransactionModel, now: number) => {
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const updateTransactionSyncStatusOnMutation = (record: TransactionModel) => {
  if (!record.recordSyncStatus) {
    record.recordSyncStatus = TransactionSyncStatus.PendingUpdate;
    return;
  }

  if (record.recordSyncStatus === TransactionSyncStatus.Synced) {
    record.recordSyncStatus = TransactionSyncStatus.PendingUpdate;
  }
};

const setMoneyAccountUpdatedAt = (record: MoneyAccountModel, now: number) => {
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const updateMoneyAccountSyncStatusOnMutation = (record: MoneyAccountModel) => {
  if (!record.recordSyncStatus) {
    record.recordSyncStatus = MoneyAccountSyncStatus.PendingUpdate;
    return;
  }

  if (record.recordSyncStatus === MoneyAccountSyncStatus.Synced) {
    record.recordSyncStatus = MoneyAccountSyncStatus.PendingUpdate;
  }
};

const toSignedAmount = (amount: number, direction: string): number => {
  return direction === TransactionDirection.In ? amount : amount * -1;
};

const roundToCurrencyScale = (value: number): number => {
  return Number(value.toFixed(2));
};

const adjustMoneyAccountBalance = async ({
  collection,
  remoteId,
  delta,
}: {
  collection: Collection<MoneyAccountModel>;
  remoteId: string | null;
  delta: number;
}): Promise<void> => {
  if (!remoteId || Math.abs(delta) < 0.000001) {
    return;
  }

  const matching = await collection
    .query(Q.where("remote_id", remoteId), Q.where("deleted_at", Q.eq(null)))
    .fetch();

  const moneyAccount = matching[0];

  if (!moneyAccount) {
    throw new Error("Settlement money account not found.");
  }

  await moneyAccount.update((record) => {
    record.currentBalance = roundToCurrencyScale(record.currentBalance + delta);
    updateMoneyAccountSyncStatusOnMutation(record);
    setMoneyAccountUpdatedAt(record, Date.now());
  });
};

export const createLocalMoneyPostingDatasource = (
  database: Database,
): MoneyPostingDatasource => ({
  async postMoneyMovement(
    payload: SaveTransactionPayload,
  ): Promise<Result<TransactionModel>> {
    try {
      const transactionsCollection =
        database.get<TransactionModel>(TRANSACTIONS_TABLE);
      const moneyAccountsCollection = database.get<MoneyAccountModel>(
        MONEY_ACCOUNTS_TABLE,
      );

      const existingByRemoteId = await transactionsCollection
        .query(Q.where("remote_id", payload.remoteId))
        .fetch();
      let existing = existingByRemoteId[0] ?? null;

      if (!existing && payload.idempotencyKey) {
        const existingByIdempotency = await transactionsCollection
          .query(
            Q.where("idempotency_key", payload.idempotencyKey),
            Q.where("deleted_at", Q.eq(null)),
          )
          .fetch();

        existing = existingByIdempotency[0] ?? null;

        if (existing) {
          return {
            success: true,
            value: existing,
          };
        }
      }

      let persisted!: TransactionModel;

      await database.write(async () => {
        if (existing) {
          const oldPostingStatus =
            existing.postingStatus ?? TransactionPostingStatus.Posted;
          const oldSignedAmount =
            oldPostingStatus === TransactionPostingStatus.Posted
              ? toSignedAmount(existing.amount, existing.direction)
              : 0;
          const newPostingStatus =
            payload.postingStatus ?? TransactionPostingStatus.Posted;
          const newSignedAmount =
            newPostingStatus === TransactionPostingStatus.Posted
              ? toSignedAmount(payload.amount, payload.direction)
              : 0;

          await adjustMoneyAccountBalance({
            collection: moneyAccountsCollection,
            remoteId: existing.settlementMoneyAccountRemoteId,
            delta: oldSignedAmount * -1,
          });

          await adjustMoneyAccountBalance({
            collection: moneyAccountsCollection,
            remoteId: payload.settlementMoneyAccountRemoteId ?? null,
            delta: newSignedAmount,
          });

          await existing.update((record) => {
            record.ownerUserRemoteId = payload.ownerUserRemoteId;
            record.accountRemoteId = payload.accountRemoteId;
            record.accountDisplayNameSnapshot =
              payload.accountDisplayNameSnapshot;
            record.transactionType = payload.transactionType;
            record.direction = payload.direction;
            record.title = payload.title;
            record.amount = payload.amount;
            record.currencyCode = payload.currencyCode;
            record.categoryLabel = payload.categoryLabel;
            record.note = payload.note;
            record.happenedAt = payload.happenedAt;
            record.settlementMoneyAccountRemoteId =
              payload.settlementMoneyAccountRemoteId ?? null;
            record.settlementMoneyAccountDisplayNameSnapshot =
              payload.settlementMoneyAccountDisplayNameSnapshot ?? null;
            record.sourceModule = payload.sourceModule ?? null;
            record.sourceRemoteId = payload.sourceRemoteId ?? null;
            record.sourceAction = payload.sourceAction ?? null;
            record.idempotencyKey = payload.idempotencyKey ?? null;
            record.postingStatus = newPostingStatus;
            record.deletedAt = null;
            updateTransactionSyncStatusOnMutation(record);
            setTransactionUpdatedAt(record, Date.now());
          });

          persisted = existing;
          return;
        }

        persisted = await transactionsCollection.create((record) => {
          const now = Date.now();

          record.remoteId = payload.remoteId;
          record.ownerUserRemoteId = payload.ownerUserRemoteId;
          record.accountRemoteId = payload.accountRemoteId;
          record.accountDisplayNameSnapshot =
            payload.accountDisplayNameSnapshot;
          record.transactionType = payload.transactionType;
          record.direction = payload.direction;
          record.title = payload.title;
          record.amount = payload.amount;
          record.currencyCode = payload.currencyCode;
          record.categoryLabel = payload.categoryLabel;
          record.note = payload.note;
          record.happenedAt = payload.happenedAt;
          record.settlementMoneyAccountRemoteId =
            payload.settlementMoneyAccountRemoteId ?? null;
          record.settlementMoneyAccountDisplayNameSnapshot =
            payload.settlementMoneyAccountDisplayNameSnapshot ?? null;
          record.sourceModule = payload.sourceModule ?? null;
          record.sourceRemoteId = payload.sourceRemoteId ?? null;
          record.sourceAction = payload.sourceAction ?? null;
          record.idempotencyKey = payload.idempotencyKey ?? null;
          record.postingStatus =
            payload.postingStatus ?? TransactionPostingStatus.Posted;
          record.recordSyncStatus = TransactionSyncStatus.PendingCreate;
          record.lastSyncedAt = null;
          record.deletedAt = null;

          setTransactionCreatedAndUpdatedAt(record, now);
        });

        const signedAmount =
          payload.postingStatus === TransactionPostingStatus.Voided
            ? 0
            : toSignedAmount(payload.amount, payload.direction);

        await adjustMoneyAccountBalance({
          collection: moneyAccountsCollection,
          remoteId: payload.settlementMoneyAccountRemoteId ?? null,
          delta: signedAmount,
        });
      });

      return {
        success: true,
        value: persisted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async deleteMoneyMovementByRemoteId(
    remoteId: string,
  ): Promise<Result<boolean>> {
    try {
      const transactionsCollection =
        database.get<TransactionModel>(TRANSACTIONS_TABLE);
      const moneyAccountsCollection = database.get<MoneyAccountModel>(
        MONEY_ACCOUNTS_TABLE,
      );

      const matching = await transactionsCollection
        .query(Q.where("remote_id", remoteId))
        .fetch();

      const existing = matching[0] ?? null;

      if (!existing) {
        return {
          success: true,
          value: false,
        };
      }

      if (
        existing.deletedAt !== null &&
        existing.postingStatus !== TransactionPostingStatus.Voided
      ) {
        return {
          success: true,
          value: false,
        };
      }

      if (existing.postingStatus === TransactionPostingStatus.Voided) {
        return {
          success: true,
          value: true,
        };
      }

      await database.write(async () => {
        const signedAmount =
          (existing.postingStatus ?? TransactionPostingStatus.Posted) ===
          TransactionPostingStatus.Posted
            ? toSignedAmount(existing.amount, existing.direction)
            : 0;

        await adjustMoneyAccountBalance({
          collection: moneyAccountsCollection,
          remoteId: existing.settlementMoneyAccountRemoteId,
          delta: signedAmount * -1,
        });

        await existing.update((record) => {
          record.deletedAt = null;
          record.postingStatus = TransactionPostingStatus.Voided;
          updateTransactionSyncStatusOnMutation(record);
          setTransactionUpdatedAt(record, Date.now());
        });
      });

      return {
        success: true,
        value: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
