import type { LedgerEntry } from "@/feature/ledger/types/ledger.entity.types";
import { buildLedgerPartyBalances } from "@/feature/ledger/viewModel/ledger.shared";
import type { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import {
  type Transaction,
  TransactionDirection,
} from "@/feature/transactions/types/transaction.entity.types";
import type { GetTransactionsUseCase } from "@/feature/transactions/useCase/getTransactions.useCase";
import {
  formatCurrencyAmount,
} from "@/shared/utils/currency/accountCurrency";
import type {
  BusinessDashboardProfitPoint,
  BusinessDashboardSummaryCard,
  BusinessDashboardTransactionRow,
} from "../../types/businessDashboard.types";
import type {
  BusinessDashboardReadModel,
  GetBusinessDashboardReadModelUseCase,
} from "./getBusinessDashboardReadModel.useCase";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

type CreateGetBusinessDashboardReadModelUseCaseParams = {
  getTransactionsUseCase: GetTransactionsUseCase;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
};

const getTodayRange = (): {
  startTime: number;
  endTime: number;
} => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const startTime = start.getTime();

  return {
    startTime,
    endTime: startTime + ONE_DAY_IN_MS,
  };
};

const formatDashboardCurrency = ({
  amount,
  currencyCode,
  countryCode,
}: {
  amount: number;
  currencyCode: string | null;
  countryCode: string | null;
}): string =>
  formatCurrencyAmount({
    amount,
    currencyCode,
    countryCode,
  });

const buildSummaryCards = ({
  ledgerEntries,
  currencyCode,
  countryCode,
}: {
  ledgerEntries: readonly LedgerEntry[];
  currencyCode: string | null;
  countryCode: string | null;
}): readonly BusinessDashboardSummaryCard[] => {
  const partyBalances = buildLedgerPartyBalances(ledgerEntries);

  const toReceiveAmount = partyBalances
    .filter((partyBalance) => partyBalance.balanceDirection === "receive")
    .reduce((sum, partyBalance) => sum + partyBalance.balanceAmount, 0);

  const toPayAmount = partyBalances
    .filter((partyBalance) => partyBalance.balanceDirection === "pay")
    .reduce((sum, partyBalance) => sum + partyBalance.balanceAmount, 0);

  return [
    {
      id: "to-receive",
      title: "To Receive",
      value: formatDashboardCurrency({
        amount: toReceiveAmount,
        currencyCode,
        countryCode,
      }),
      tone: "receive",
    },
    {
      id: "to-pay",
      title: "To Pay",
      value: formatDashboardCurrency({
        amount: toPayAmount,
        currencyCode,
        countryCode,
      }),
      tone: "pay",
    },
  ];
};

const calculateTodayAmount = ({
  transactions,
  direction,
}: {
  transactions: readonly Transaction[];
  direction: typeof TransactionDirection[keyof typeof TransactionDirection];
}): number => {
  const { startTime, endTime } = getTodayRange();

  return transactions.reduce((sum, transaction) => {
    const isToday =
      transaction.happenedAt >= startTime && transaction.happenedAt < endTime;

    if (!isToday || transaction.direction !== direction) {
      return sum;
    }

    return sum + transaction.amount;
  }, 0);
};

const buildOverdueCountLabel = (
  ledgerEntries: readonly LedgerEntry[],
): string => {
  const partyBalances = buildLedgerPartyBalances(ledgerEntries);

  return String(
    partyBalances.filter((partyBalance) => partyBalance.overdueAmount > 0)
      .length,
  );
};

const buildProfitOverviewSeries = (
  transactions: readonly Transaction[],
): readonly BusinessDashboardProfitPoint[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const firstDay = new Date(startOfToday);
  firstDay.setDate(firstDay.getDate() - 6);

  const firstDayStartTime = firstDay.getTime();
  const todayEndTime = startOfToday.getTime() + ONE_DAY_IN_MS;

  const totalsByDayStart = new Map<
    number,
    { inAmount: number; outAmount: number }
  >();

  for (const transaction of transactions) {
    if (
      transaction.happenedAt < firstDayStartTime ||
      transaction.happenedAt >= todayEndTime
    ) {
      continue;
    }

    const transactionDate = new Date(transaction.happenedAt);
    const dayStartTime = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate(),
    ).getTime();

    const current = totalsByDayStart.get(dayStartTime) ?? {
      inAmount: 0,
      outAmount: 0,
    };

    if (transaction.direction === TransactionDirection.In) {
      current.inAmount += transaction.amount;
    } else if (transaction.direction === TransactionDirection.Out) {
      current.outAmount += transaction.amount;
    }

    totalsByDayStart.set(dayStartTime, current);
  }

  return Array.from({ length: 7 }, (_, offset) => {
    const currentDate = new Date(firstDay);
    currentDate.setDate(firstDay.getDate() + offset);

    const dayStartTime = currentDate.getTime();
    const totals = totalsByDayStart.get(dayStartTime) ?? {
      inAmount: 0,
      outAmount: 0,
    };

    return {
      label: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
      value: totals.inAmount - totals.outAmount,
    };
  });
};

const buildTodayTransactionRows = ({
  transactions,
  currencyCode,
  countryCode,
}: {
  transactions: readonly Transaction[];
  currencyCode: string | null;
  countryCode: string | null;
}): readonly BusinessDashboardTransactionRow[] => {
  const { startTime, endTime } = getTodayRange();

  return [...transactions]
    .filter(
      (transaction) =>
        transaction.happenedAt >= startTime && transaction.happenedAt < endTime,
    )
    .sort((left, right) => right.happenedAt - left.happenedAt)
    .slice(0, 8)
    .map((transaction, index) => {
      const isIncoming = transaction.direction === TransactionDirection.In;
      const amount = formatDashboardCurrency({
        amount: transaction.amount,
        currencyCode,
        countryCode,
      });

      return {
        id: `${transaction.remoteId}-${transaction.happenedAt}-${index}`,
        title: transaction.title,
        subtitle: `${transaction.categoryLabel ?? "General"} | ${new Date(
          transaction.happenedAt,
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        amount: `${isIncoming ? "+" : "-"} ${amount}`,
        tone: isIncoming ? "positive" : "negative",
      };
    });
};

const buildDashboardReadModel = ({
  transactions,
  ledgerEntries,
  currencyCode,
  countryCode,
}: {
  transactions: readonly Transaction[];
  ledgerEntries: readonly LedgerEntry[];
  currencyCode: string | null;
  countryCode: string | null;
}): BusinessDashboardReadModel => {
  const todayInAmount = calculateTodayAmount({
    transactions,
    direction: TransactionDirection.In,
  });

  const todayOutAmount = calculateTodayAmount({
    transactions,
    direction: TransactionDirection.Out,
  });

  return {
    summaryCards: buildSummaryCards({
      ledgerEntries,
      currencyCode,
      countryCode,
    }),
    todayInValue: formatDashboardCurrency({
      amount: todayInAmount,
      currencyCode,
      countryCode,
    }),
    todayOutValue: formatDashboardCurrency({
      amount: todayOutAmount,
      currencyCode,
      countryCode,
    }),
    overdueCountLabel: buildOverdueCountLabel(ledgerEntries),
    profitOverviewSeries: buildProfitOverviewSeries(transactions),
    todayTransactionRows: buildTodayTransactionRows({
      transactions,
      currencyCode,
      countryCode,
    }),
  };
};

export const createGetBusinessDashboardReadModelUseCase = ({
  getTransactionsUseCase,
  getLedgerEntriesUseCase,
}: CreateGetBusinessDashboardReadModelUseCaseParams): GetBusinessDashboardReadModelUseCase => ({
  async execute(params) {
    const activeUserRemoteId = params.activeUserRemoteId?.trim() ?? "";
    const activeAccountRemoteId = params.activeAccountRemoteId?.trim() ?? "";

    if (!activeUserRemoteId || !activeAccountRemoteId) {
      return {
        success: false,
        error: {
          message: "Active account context is required.",
        },
      };
    }

    const [transactionResult, ledgerResult] = await Promise.all([
      getTransactionsUseCase.execute({
        ownerUserRemoteId: activeUserRemoteId,
        accountRemoteId: activeAccountRemoteId,
      }),
      getLedgerEntriesUseCase.execute({
        businessAccountRemoteId: activeAccountRemoteId,
      }),
    ]);

    if (!transactionResult.success && !ledgerResult.success) {
      return {
        success: false,
        error: {
          message: `${transactionResult.error.message} ${ledgerResult.error.message}`.trim(),
        },
      };
    }

    if (!transactionResult.success) {
      return {
        success: false,
        error: {
          message: transactionResult.error.message,
        },
      };
    }

    if (!ledgerResult.success) {
      return {
        success: false,
        error: {
          message: ledgerResult.error.message,
        },
      };
    }

    return {
      success: true,
      value: buildDashboardReadModel({
        transactions: transactionResult.value,
        ledgerEntries: ledgerResult.value,
        currencyCode: params.currencyCode,
        countryCode: params.countryCode,
      }),
    };
  },
});
