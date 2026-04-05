import {
  Transaction,
  TransactionDirection,
} from "@/feature/transactions/types/transaction.entity.types";
import { GetTransactionsUseCase } from "@/feature/transactions/useCase/getTransactions.useCase";
import {
  formatCurrencyAmount,
} from "@/shared/utils/currency/accountCurrency";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PersonalDashboardIncomeExpensePoint,
  PersonalDashboardQuickAction,
  PersonalDashboardSummaryCard,
  PersonalDashboardTransactionRow,
} from "../types/personalDashboard.types";
import { PersonalDashboardViewModel } from "./personalDashboard.viewModel";

const quickActions: readonly PersonalDashboardQuickAction[] = [
  { id: "transactions", label: "Transactions" },
  { id: "emi", label: "EMI & Loans" },
  { id: "budget", label: "Budget" },
  { id: "notes", label: "Notes" },
];
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

type UsePersonalDashboardViewModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  onQuickActionPress: (actionId: PersonalDashboardQuickAction["id"]) => void;
  getTransactionsUseCase: GetTransactionsUseCase;
};

export const usePersonalDashboardViewModel = ({
  activeUserRemoteId,
  activeAccountRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  onQuickActionPress,
  getTransactionsUseCase,
}: UsePersonalDashboardViewModelParams): PersonalDashboardViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<readonly Transaction[]>([]);

  const loadTransactions = useCallback(async (): Promise<void> => {
    if (!activeUserRemoteId || !activeAccountRemoteId) {
      setTransactions([]);
      setErrorMessage("Active account context is required.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await getTransactionsUseCase.execute({
      ownerUserRemoteId: activeUserRemoteId,
      accountRemoteId: activeAccountRemoteId,
    });

    if (!result.success) {
      setTransactions([]);
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    setTransactions(result.value);
    setErrorMessage(null);
    setIsLoading(false);
  }, [activeAccountRemoteId, activeUserRemoteId, getTransactionsUseCase]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const currencyCode = activeAccountCurrencyCode;
  const countryCode = activeAccountCountryCode;

  const monthlyIncome = useMemo(
    () => {
      const now = new Date();
      const startOfMonthTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).getTime();

      return transactions.reduce((sum, transaction) => {
        const isCurrentMonth = transaction.happenedAt >= startOfMonthTime;

        if (!isCurrentMonth || transaction.direction !== TransactionDirection.In) {
          return sum;
        }

        return sum + transaction.amount;
      }, 0);
    },
    [transactions],
  );

  const monthlyExpense = useMemo(
    () => {
      const now = new Date();
      const startOfMonthTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).getTime();

      return transactions.reduce((sum, transaction) => {
        const isCurrentMonth = transaction.happenedAt >= startOfMonthTime;

        if (!isCurrentMonth || transaction.direction !== TransactionDirection.Out) {
          return sum;
        }

        return sum + transaction.amount;
      }, 0);
    },
    [transactions],
  );

  const todayInAmount = useMemo(
    () => {
      const now = new Date();
      const startOfTodayTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const endOfTodayTime = startOfTodayTime + 24 * 60 * 60 * 1000;

      return transactions.reduce((sum, transaction) => {
        const isToday =
          transaction.happenedAt >= startOfTodayTime &&
          transaction.happenedAt < endOfTodayTime;

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
      const now = new Date();
      const startOfTodayTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const endOfTodayTime = startOfTodayTime + 24 * 60 * 60 * 1000;

      return transactions.reduce((sum, transaction) => {
        const isToday =
          transaction.happenedAt >= startOfTodayTime &&
          transaction.happenedAt < endOfTodayTime;

        if (!isToday || transaction.direction !== TransactionDirection.Out) {
          return sum;
        }

        return sum + transaction.amount;
      }, 0);
    },
    [transactions],
  );

  const netAmount = monthlyIncome - monthlyExpense;

  const summaryCards = useMemo<readonly PersonalDashboardSummaryCard[]>(() => {
    return [
      {
        id: "total-income",
        title: "Monthly Income",
        value: formatCurrencyAmount({
          amount: monthlyIncome,
          currencyCode,
          countryCode,
        }),
        tone: "income",
      },
      {
        id: "total-expense",
        title: "Monthly Expense",
        value: formatCurrencyAmount({
          amount: monthlyExpense,
          currencyCode,
          countryCode,
        }),
        tone: "expense",
      },
      {
        id: "net-balance",
        title: "Net Balance",
        value: formatCurrencyAmount({
          amount: netAmount,
          currencyCode,
          countryCode,
        }),
        tone: "neutral",
      },
    ];
  }, [countryCode, currencyCode, monthlyExpense, monthlyIncome, netAmount]);

  const incomeExpenseSeries = useMemo<readonly PersonalDashboardIncomeExpensePoint[]>(() => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const firstDay = new Date(startOfToday);
    firstDay.setDate(firstDay.getDate() - 6);

    const firstDayStartTime = firstDay.getTime();
    const endOfTodayTime = startOfToday.getTime() + ONE_DAY_IN_MS;

    const totalsByDayStart = new Map<number, { income: number; expense: number }>();

    for (const transaction of transactions) {
      if (
        transaction.happenedAt < firstDayStartTime ||
        transaction.happenedAt >= endOfTodayTime
      ) {
        continue;
      }

      const transactionDate = new Date(transaction.happenedAt);
      const dayStartTime = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate(),
      ).getTime();

      const totals = totalsByDayStart.get(dayStartTime) ?? {
        income: 0,
        expense: 0,
      };

      if (transaction.direction === TransactionDirection.In) {
        totals.income += transaction.amount;
      } else if (transaction.direction === TransactionDirection.Out) {
        totals.expense += transaction.amount;
      }

      totalsByDayStart.set(dayStartTime, totals);
    }

    return Array.from({ length: 7 }, (_, offset) => {
      const currentDate = new Date(firstDay);
      currentDate.setDate(firstDay.getDate() + offset);
      const dayStartTime = currentDate.getTime();
      const totals = totalsByDayStart.get(dayStartTime) ?? {
        income: 0,
        expense: 0,
      };

      return {
        label: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
        primaryValue: totals.income,
        secondaryValue: totals.expense,
      };
    });
  }, [transactions]);

  const transactionRows = useMemo<readonly PersonalDashboardTransactionRow[]>(() => {
    const now = new Date();
    const startOfTodayTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfYesterdayTime = startOfTodayTime - ONE_DAY_IN_MS;

    return [...transactions]
      .sort((left, right) => right.happenedAt - left.happenedAt)
      .slice(0, 8)
      .map((transaction, index) => {
        const happenedAtDate = new Date(transaction.happenedAt);
        const happenedAtTime = happenedAtDate.getTime();
        const happenedAtLabel =
          happenedAtTime >= startOfTodayTime
            ? `Today | ${happenedAtDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : happenedAtTime >= startOfYesterdayTime
              ? "Yesterday"
              : happenedAtDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                });

        const isIncome = transaction.direction === TransactionDirection.In;
        const amountLabel = formatCurrencyAmount({
          amount: transaction.amount,
          currencyCode,
          countryCode,
        });

        return {
          id: `${transaction.remoteId}-${transaction.happenedAt}-${index}`,
          title: transaction.title,
          subtitle: `${transaction.categoryLabel ?? "General"} | ${happenedAtLabel}`,
          amount: `${isIncome ? "+" : "-"} ${amountLabel}`,
          tone: isIncome ? "positive" : "negative",
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

  const netValue = useMemo(
    () =>
      formatCurrencyAmount({
        amount: netAmount,
        currencyCode,
        countryCode,
      }),
    [countryCode, currencyCode, netAmount],
  );

  return useMemo<PersonalDashboardViewModel>(
    () => ({
      isLoading,
      errorMessage,
      summaryCards,
      quickActions,
      onQuickActionPress,
      todayInValue,
      todayOutValue,
      netValue,
      incomeExpenseSeries,
      transactionRows,
    }),
    [
      errorMessage,
      incomeExpenseSeries,
      isLoading,
      netValue,
      onQuickActionPress,
      summaryCards,
      transactionRows,
      todayInValue,
      todayOutValue,
    ],
  );
};
