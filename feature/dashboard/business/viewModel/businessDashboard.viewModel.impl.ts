import { resolveCurrencyPrefix } from "@/shared/utils/currency/accountCurrency";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BusinessDashboardQuickAction,
} from "../types/businessDashboard.types";
import type { BusinessDashboardViewModel } from "./businessDashboard.viewModel";
import type {
  BusinessDashboardReadModel,
  GetBusinessDashboardReadModelUseCase,
} from "../readModel/useCase/getBusinessDashboardReadModel.useCase";

const quickActions: readonly BusinessDashboardQuickAction[] = [
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "billing", label: "Billing" },
  { id: "contacts", label: "Contacts" },
];

type UseBusinessDashboardViewModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  hasQuickActionAccess: (actionId: BusinessDashboardQuickAction["id"]) => boolean;
  onQuickActionPress: (actionId: BusinessDashboardQuickAction["id"]) => void;
  getBusinessDashboardReadModelUseCase: GetBusinessDashboardReadModelUseCase;
};

const emptyReadModel: BusinessDashboardReadModel = {
  summaryCards: [
    {
      id: "to-receive",
      title: "To Receive",
      value: "0.00",
      tone: "receive",
    },
    {
      id: "to-pay",
      title: "To Pay",
      value: "0.00",
      tone: "pay",
    },
  ],
  todayInValue: "0.00",
  todayOutValue: "0.00",
  overdueCountLabel: "0",
  profitOverviewSeries: [],
  todayTransactionRows: [],
};

export const useBusinessDashboardViewModel = ({
  activeUserRemoteId,
  activeAccountRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  hasQuickActionAccess,
  onQuickActionPress,
  getBusinessDashboardReadModelUseCase,
}: UseBusinessDashboardViewModelParams): BusinessDashboardViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readModel, setReadModel] =
    useState<BusinessDashboardReadModel>(emptyReadModel);

  const loadDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    const result = await getBusinessDashboardReadModelUseCase.execute({
      activeUserRemoteId,
      activeAccountRemoteId,
      currencyCode: activeAccountCurrencyCode,
      countryCode: activeAccountCountryCode,
    });

    if (!result.success) {
      setReadModel(emptyReadModel);
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    setReadModel(result.value);
    setErrorMessage(null);
    setIsLoading(false);
  }, [
    activeAccountCountryCode,
    activeAccountCurrencyCode,
    activeAccountRemoteId,
    activeUserRemoteId,
    getBusinessDashboardReadModelUseCase,
  ]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const currencyPrefix = useMemo(
    () =>
      resolveCurrencyPrefix({
        currencyCode: activeAccountCurrencyCode,
        countryCode: activeAccountCountryCode,
      }),
    [activeAccountCountryCode, activeAccountCurrencyCode],
  );

  const availableQuickActions = useMemo(
    () =>
      quickActions.filter((quickAction) =>
        hasQuickActionAccess(quickAction.id),
      ),
    [hasQuickActionAccess],
  );

  return useMemo<BusinessDashboardViewModel>(
    () => ({
      isLoading,
      errorMessage,
      currencyPrefix,
      summaryCards: readModel.summaryCards,
      quickActions: availableQuickActions,
      onQuickActionPress,
      todayInValue: readModel.todayInValue,
      todayOutValue: readModel.todayOutValue,
      overdueCountLabel: readModel.overdueCountLabel,
      profitOverviewSeries: readModel.profitOverviewSeries,
      todayTransactionRows: readModel.todayTransactionRows,
    }),
    [
      availableQuickActions,
      currencyPrefix,
      errorMessage,
      isLoading,
      onQuickActionPress,
      readModel,
    ],
  );
};
