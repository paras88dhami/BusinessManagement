import {
  Transaction,
  TransactionDirection,
} from "@/feature/transactions/types/transaction.entity.types";
import { GetTransactionsUseCase } from "@/feature/transactions/useCase/getTransactions.useCase";
import { LedgerEntry } from "@/feature/ledger/types/ledger.entity.types";
import { GetLedgerEntriesUseCase } from "@/feature/ledger/useCase/getLedgerEntries.useCase";
import { buildLedgerPartyBalances } from "@/feature/ledger/viewModel/ledger.shared";
import {
  formatCurrencyAmount,
  resolveCurrencyPrefix,
} from "@/shared/utils/currency/accountCurrency";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BusinessDashboardProfitPoint,
  BusinessDashboardQuickAction,
  BusinessDashboardSummaryCard,
  BusinessDashboardTransactionRow,
} from "../types/businessDashboard.types";
import { BusinessDashboardViewModel } from "./businessDashboard.viewModel";

const quickActions: readonly BusinessDashboardQuickAction[] = [
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "billing", label: "Billing" },
  { id: "contacts", label: "Contacts" },
];
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

type UseBusinessDashboardViewModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  hasQuickActionAccess: (actionId: BusinessDashboardQuickAction["id"]) => boolean;
  onQuickActionPress: (actionId: BusinessDashboardQuickAction["id"]) => void;
  getTransactionsUseCase: GetTransactionsUseCase;
  getLedgerEntriesUseCase: GetLedgerEntriesUseCase;
};

export const useBusinessDashboardViewModel = ({
  activeUserRemoteId,
  activeAccountRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  hasQuickActionAccess,
  onQuickActionPress,
  getTransactionsUseCase,
  getLedgerEntriesUseCase,
}: UseBusinessDashboardViewModelParams): BusinessDashboardViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<readonly Transaction[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<readonly LedgerEntry[]>([]);

  const loadDashboard = useCallback(async (): Promise<void> => {
    if (!activeUserRemoteId || !activeAccountRemoteId) {
      setTransactions([]);
      setLedgerEntries([]);
      setErrorMessage("Active account context is required.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [transactionResult, ledgerResult] = await Promise.all([
      getTransactionsUseCase.execute({
        ownerUserRemoteId: activeUserRemoteId,
        accountRemoteId: activeAccountRemoteId,
      }),
      getLedgerEntriesUseCase.execute({
        businessAccountRemoteId: activeAccountRemoteId,
      }),
    ]);

    if (transactionResult.success) {
      setTransactions(transactionResult.value);
    } else {
      setTransactions([]);
    }

    if (ledgerResult.success) {
      setLedgerEntries(ledgerResult.value);
    } else {
      setLedgerEntries([]);
    }

    if (!transactionResult.success && !ledgerResult.success) {
      setErrorMessage(
        `${transactionResult.error.message} ${ledgerResult.error.message}`.trim(),
      );
    } else if (!transactionResult.success) {
      setErrorMessage(transactionResult.error.message);
    } else if (!ledgerResult.success) {
      setErrorMessage(ledgerResult.error.message);
    } else {
      setErrorMessage(null);
    }

    setIsLoading(false);
  }, [
    activeAccountRemoteId,
    activeUserRemoteId,
    getLedgerEntriesUseCase,
    getTransactionsUseCase,
  ]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const currencyCode = activeAccountCurrencyCode;
  const countryCode = activeAccountCountryCode;
  const currencyPrefix = useMemo(
    () =>
      resolveCurrencyPrefix({
        currencyCode,
        countryCode,
      }),
    [countryCode, currencyCode],
  );

  const partyBalances = useMemo(
    () => buildLedgerPartyBalances(ledgerEntries),
    [ledgerEntries],
  );
  const availableQuickActions = useMemo(
    () => quickActions.filter((quickAction) => hasQuickActionAccess(quickAction.id)),
    [hasQuickActionAccess],
  );

  const summaryCards = useMemo<readonly BusinessDashboardSummaryCard[]>(() => {
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
        value: formatCurrencyAmount({
          amount: toReceiveAmount,
          currencyCode,
          countryCode,
        }),
        tone: "receive",
      },
      {
        id: "to-pay",
        title: "To Pay",
        value: formatCurrencyAmount({
          amount: toPayAmount,
          currencyCode,
          countryCode,
        }),
        tone: "pay",
      },
    ];
  }, [countryCode, currencyCode, partyBalances]);

  const todayInAmount = useMemo(
    () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const startTime = start.getTime();
      const endTime = startTime + 24 * 60 * 60 * 1000;

      return transactions.reduce((sum, transaction) => {
        const isToday =
          transaction.happenedAt >= startTime &&
          transaction.happenedAt < endTime;
        if (!isToday || transaction.direction !== TransactionDirection.In) {
          return sum;
        }

        return sum + transaction.amount;
      }, 0);
    },
    [transactions],
  );

  const todayOutAmount = useMemo(
    () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const startTime = start.getTime();
      const endTime = startTime + 24 * 60 * 60 * 1000;

      return transactions.reduce((sum, transaction) => {
        const isToday =
          transaction.happenedAt >= startTime &&
          transaction.happenedAt < endTime;
        if (!isToday || transaction.direction !== TransactionDirection.Out) {
          return sum;
        }

        return sum + transaction.amount;
      }, 0);
    },
    [transactions],
  );

  const overdueCountLabel = useMemo(
    () =>
      String(
        partyBalances.filter((partyBalance) => partyBalance.overdueAmount > 0)
          .length,
      ),
    [partyBalances],
  );

  const profitOverviewSeries = useMemo<readonly BusinessDashboardProfitPoint[]>(() => {
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

    const totalsByDayStart = new Map<number, { inAmount: number; outAmount: number }>();

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
  }, [transactions]);

  const todayTransactionRows = useMemo<readonly BusinessDashboardTransactionRow[]>(() => {
    const today = new Date();
    const startOfTodayTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    const endOfTodayTime = startOfTodayTime + ONE_DAY_IN_MS;

    return [...transactions]
      .filter(
        (transaction) =>
          transaction.happenedAt >= startOfTodayTime &&
          transaction.happenedAt < endOfTodayTime,
      )
      .sort((left, right) => right.happenedAt - left.happenedAt)
      .slice(0, 8)
      .map((transaction, index) => {
        const isIncoming = transaction.direction === TransactionDirection.In;
        const amount = formatCurrencyAmount({
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
  }, [countryCode, currencyCode, transactions]);

  const todayInValue = useMemo(
    () =>
      formatCurrencyAmount({
        amount: todayInAmount,
        currencyCode,
        countryCode,
      }),
    [countryCode, currencyCode, todayInAmount],
  );

  const todayOutValue = useMemo(
    () =>
      formatCurrencyAmount({
        amount: todayOutAmount,
        currencyCode,
        countryCode,
      }),
    [countryCode, currencyCode, todayOutAmount],
  );

  return useMemo<BusinessDashboardViewModel>(
    () => ({
      isLoading,
      errorMessage,
      currencyPrefix,
      summaryCards,
      quickActions: availableQuickActions,
      onQuickActionPress,
      todayInValue,
      todayOutValue,
      overdueCountLabel,
      profitOverviewSeries,
      todayTransactionRows,
    }),
    [
      availableQuickActions,
      currencyPrefix,
      errorMessage,
      isLoading,
      onQuickActionPress,
      overdueCountLabel,
      profitOverviewSeries,
      summaryCards,
      todayTransactionRows,
      todayInValue,
      todayOutValue,
    ],
  );
};
