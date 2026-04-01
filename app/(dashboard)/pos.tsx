import React, { useEffect } from "react";
import { GetPosScreenFactory } from "@/feature/pos/factory/getPosScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";

export default function PosDashboardRoute() {
  const navigation = useSmoothNavigation();
  const {
    activeAccountType,
    activeAccountRemoteId,
    activeUserRemoteId,
  } = useDashboardRouteContext();

  useEffect(() => {
    if (activeAccountType !== AccountType.Business) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [activeAccountType, navigation]);

  if (activeAccountType !== AccountType.Business) {
    return null;
  }

  return (
    <GetPosScreenFactory
      activeBusinessRemoteId={activeUserRemoteId}
      activeSettlementAccountRemoteId={activeAccountRemoteId}
    />
  );
}
