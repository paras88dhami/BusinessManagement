import React, { useCallback } from "react";
import { GetMoreDashboardScreenFactory } from "@/feature/dashboard/more/factory/getMoreDashboardScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function MoreDashboardRoute() {
  const navigation = useSmoothNavigation();
  const { activeAccountType } = useDashboardRouteContext();

  const handleOpenProfile = useCallback(() => {
    navigation.push("/(dashboard)/profile");
  }, [navigation]);

  const handleOpenLedger = useCallback(() => {
    navigation.replace("/(dashboard)/ledger");
  }, [navigation]);

  const handleOpenPos = useCallback(() => {
    navigation.replace("/(dashboard)/pos");
  }, [navigation]);

  const handleOpenEmi = useCallback(() => {
    navigation.replace("/(dashboard)/emi-loans");
  }, [navigation]);

  const handleOpenTransactions = useCallback(() => {
    navigation.replace("/(dashboard)/personal-transactions");
  }, [navigation]);

  const handleOpenBudget = useCallback(() => {
    navigation.replace("/(dashboard)/personal-budget");
  }, [navigation]);

  return (
    <GetMoreDashboardScreenFactory
      isBusinessMode={activeAccountType === AccountType.Business}
      onOpenProfile={handleOpenProfile}
      onOpenLedger={handleOpenLedger}
      onOpenPos={handleOpenPos}
      onOpenEmi={handleOpenEmi}
      onOpenTransactions={handleOpenTransactions}
      onOpenBudget={handleOpenBudget}
    />
  );
}
