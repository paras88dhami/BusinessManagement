import { BillingDocumentType } from "@/feature/billing/types/billing.types";
import { LedgerBalanceDirection } from "@/feature/ledger/types/ledger.entity.types";
import type {
  ReportBillingDocumentRecord,
  ReportDualSeriesPoint,
  ReportInventoryMovementRecord,
  ReportLedgerEntryRecord,
  ReportMoneyAccountRecord,
  ReportProductRecord,
  ReportSeriesPoint,
  ReportTransactionRecord,
} from "@/feature/reports/types/report.entity.types";

export const isWithinRange = (
  value: number,
  startMs: number,
  endMs: number,
): boolean => {
  return value >= startMs && value <= endMs;
};

export const buildSeriesForBuckets = (
  buckets: readonly { label: string; startMs: number; endMs: number }[],
  valueBuilder: (startMs: number, endMs: number) => number,
): ReportSeriesPoint[] => {
  return buckets.map((bucket) => ({
    label: bucket.label,
    value: valueBuilder(bucket.startMs, bucket.endMs),
  }));
};

export const buildDualSeriesForBuckets = (
  buckets: readonly { label: string; startMs: number; endMs: number }[],
  primaryBuilder: (startMs: number, endMs: number) => number,
  secondaryBuilder: (startMs: number, endMs: number) => number,
): ReportDualSeriesPoint[] => {
  return buckets.map((bucket) => ({
    label: bucket.label,
    primaryValue: primaryBuilder(bucket.startMs, bucket.endMs),
    secondaryValue: secondaryBuilder(bucket.startMs, bucket.endMs),
  }));
};

export const normalizeReportLabel = (
  value: string | null | undefined,
): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeReportKeyPart = (
  value: string | null | undefined,
): string => {
  return normalizeReportLabel(value)?.toLowerCase() ?? "";
};

export const getTransactionIncomeExpense = (
  transactions: readonly ReportTransactionRecord[],
  startMs: number,
  endMs: number,
) => {
  const totalIncome = transactions
    .filter(
      (item) =>
        item.direction === "in" && isWithinRange(item.happenedAt, startMs, endMs),
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter(
      (item) =>
        item.direction === "out" && isWithinRange(item.happenedAt, startMs, endMs),
    )
    .reduce((sum, item) => sum + item.amount, 0);

  return { totalIncome, totalExpense };
};

export const toSignedBillingDocumentAmount = (
  document: ReportBillingDocumentRecord,
): number => {
  return document.documentType === BillingDocumentType.CreditNote
    ? -document.totalAmount
    : document.totalAmount;
};

type StockRow = {
  productRemoteId: string;
  productName: string;
  categoryLabel: string;
  unitLabel: string;
  stockQuantity: number;
  valuation: number;
  tone: "positive" | "negative";
};

export const buildStockRows = (params: {
  products: readonly ReportProductRecord[];
  inventoryMovements: readonly ReportInventoryMovementRecord[];
}): StockRow[] => {
  const movementMap = new Map<
    string,
    {
      productName: string;
      unitLabel: string;
      quantity: number;
      latestUnitRate: number | null;
      lastMovementAt: number;
    }
  >();

  params.inventoryMovements.forEach((movement) => {
    const current = movementMap.get(movement.productRemoteId) ?? {
      productName: movement.productNameSnapshot,
      unitLabel: movement.productUnitLabelSnapshot ?? "units",
      quantity: 0,
      latestUnitRate: null,
      lastMovementAt: 0,
    };

    current.quantity += movement.deltaQuantity;

    if (movement.movementAt >= current.lastMovementAt) {
      current.productName = movement.productNameSnapshot;
      current.unitLabel = movement.productUnitLabelSnapshot ?? current.unitLabel;
      current.latestUnitRate = movement.unitRate ?? current.latestUnitRate;
      current.lastMovementAt = movement.movementAt;
    }

    movementMap.set(movement.productRemoteId, current);
  });

  const consumedMovementIds = new Set<string>();

  const productRows: StockRow[] = params.products.map((product) => {
    const movementAggregate = movementMap.get(product.remoteId);
    consumedMovementIds.add(product.remoteId);

    const stockQuantity = movementAggregate?.quantity ?? 0;
    const unitRate =
      product.costPrice ?? movementAggregate?.latestUnitRate ?? product.salePrice ?? 0;

    return {
      productRemoteId: product.remoteId,
      productName: product.name,
      categoryLabel: product.categoryName ?? "General",
      unitLabel: product.unitLabel ?? movementAggregate?.unitLabel ?? "units",
      stockQuantity,
      valuation: stockQuantity * unitRate,
      tone: stockQuantity <= 5 ? "negative" : "positive",
    };
  });

  const orphanMovementRows: StockRow[] = [...movementMap.entries()]
    .filter(([productRemoteId]) => !consumedMovementIds.has(productRemoteId))
    .map(([productRemoteId, aggregate]) => ({
      productRemoteId,
      productName: aggregate.productName,
      categoryLabel: "General",
      unitLabel: aggregate.unitLabel,
      stockQuantity: aggregate.quantity,
      valuation: aggregate.quantity * (aggregate.latestUnitRate ?? 0),
      tone: aggregate.quantity <= 5 ? "negative" : "positive",
    }));

  return [...productRows, ...orphanMovementRows].sort((left, right) => {
    if (right.valuation !== left.valuation) {
      return right.valuation - left.valuation;
    }
    return left.productName.localeCompare(right.productName);
  });
};

type PartyBalanceGroup = {
  id: string;
  displayName: string;
  displayPhone: string | null;
  receive: number;
  pay: number;
  lastAt: number;
};

const resolvePartyGroupDisplayName = (
  entry: ReportLedgerEntryRecord,
): string => {
  return (
    normalizeReportLabel(entry.partyName) ??
    normalizeReportLabel(entry.partyPhone) ??
    "Unknown Party"
  );
};

const buildPartyBalanceGroupId = (entry: ReportLedgerEntryRecord): string => {
  const contactRemoteId = normalizeReportLabel(entry.contactRemoteId);
  if (contactRemoteId) {
    return `contact:${contactRemoteId}`;
  }

  const partyNameKey = normalizeReportKeyPart(entry.partyName) || "unknown";
  const partyPhoneKey = normalizeReportKeyPart(entry.partyPhone) || "no-phone";

  return `unlinked:${partyNameKey}:${partyPhoneKey}`;
};

export const buildPartyBalanceGroups = (
  ledgerEntries: readonly ReportLedgerEntryRecord[],
): PartyBalanceGroup[] => {
  const grouped = new Map<string, PartyBalanceGroup>();

  ledgerEntries.forEach((entry) => {
    const groupId = buildPartyBalanceGroupId(entry);
    const current = grouped.get(groupId) ?? {
      id: groupId,
      displayName: resolvePartyGroupDisplayName(entry),
      displayPhone: normalizeReportLabel(entry.partyPhone),
      receive: 0,
      pay: 0,
      lastAt: 0,
    };

    if (entry.balanceDirection === LedgerBalanceDirection.Receive) {
      current.receive += entry.amount;
    } else {
      current.pay += entry.amount;
    }

    if (entry.happenedAt >= current.lastAt) {
      current.lastAt = entry.happenedAt;
      current.displayName = resolvePartyGroupDisplayName(entry);
      current.displayPhone = normalizeReportLabel(entry.partyPhone);
    }

    grouped.set(groupId, current);
  });

  return [...grouped.values()];
};

type AccountStatementGroup = {
  id: string;
  displayName: string;
  totalIn: number;
  totalOut: number;
  lastAt: number;
};

const buildMoneyAccountNameMap = (
  moneyAccounts: readonly ReportMoneyAccountRecord[],
): Map<string, string> => {
  const map = new Map<string, string>();

  moneyAccounts.forEach((account) => {
    const remoteId = normalizeReportLabel(account.remoteId);
    const name = normalizeReportLabel(account.name);

    if (!remoteId || !name) {
      return;
    }

    map.set(remoteId, name);
  });

  return map;
};

const buildAccountStatementGroupId = (
  transaction: ReportTransactionRecord,
): string => {
  const settlementMoneyAccountRemoteId = normalizeReportLabel(
    transaction.settlementMoneyAccountRemoteId,
  );
  if (settlementMoneyAccountRemoteId) {
    return `money_account:${settlementMoneyAccountRemoteId}`;
  }

  const snapshotLabel = normalizeReportLabel(
    transaction.settlementMoneyAccountDisplayNameSnapshot,
  );
  if (snapshotLabel) {
    return `snapshot:${snapshotLabel.toLowerCase()}`;
  }

  return "unassigned";
};

const resolveAccountStatementDisplayName = (params: {
  transaction: ReportTransactionRecord;
  moneyAccountNameMap: ReadonlyMap<string, string>;
}): string => {
  const settlementMoneyAccountRemoteId = normalizeReportLabel(
    params.transaction.settlementMoneyAccountRemoteId,
  );

  if (settlementMoneyAccountRemoteId) {
    return (
      params.moneyAccountNameMap.get(settlementMoneyAccountRemoteId) ??
      normalizeReportLabel(
        params.transaction.settlementMoneyAccountDisplayNameSnapshot,
      ) ??
      "Unknown Account"
    );
  }

  return (
    normalizeReportLabel(
      params.transaction.settlementMoneyAccountDisplayNameSnapshot,
    ) ?? "Unassigned Account"
  );
};

export const buildAccountStatementGroups = (params: {
  transactions: readonly ReportTransactionRecord[];
  moneyAccounts: readonly ReportMoneyAccountRecord[];
}): AccountStatementGroup[] => {
  const moneyAccountNameMap = buildMoneyAccountNameMap(params.moneyAccounts);
  const grouped = new Map<string, AccountStatementGroup>();

  params.transactions.forEach((transaction) => {
    const groupId = buildAccountStatementGroupId(transaction);
    const current = grouped.get(groupId) ?? {
      id: groupId,
      displayName: resolveAccountStatementDisplayName({
        transaction,
        moneyAccountNameMap,
      }),
      totalIn: 0,
      totalOut: 0,
      lastAt: 0,
    };

    if (transaction.direction === "in") {
      current.totalIn += transaction.amount;
    } else {
      current.totalOut += transaction.amount;
    }

    current.lastAt = Math.max(current.lastAt, transaction.happenedAt);
    current.displayName = resolveAccountStatementDisplayName({
      transaction,
      moneyAccountNameMap,
    });

    grouped.set(groupId, current);
  });

  return [...grouped.values()].sort((left, right) => {
    const rightActivity = right.totalIn + right.totalOut;
    const leftActivity = left.totalIn + left.totalOut;

    if (rightActivity !== leftActivity) {
      return rightActivity - leftActivity;
    }

    return left.displayName.localeCompare(right.displayName);
  });
};
