import React, { useEffect } from "react";
import { GetInventoryScreenFactory } from "@/feature/inventory/factory/getInventoryScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useAccountPermissionAccess } from "@/feature/setting/accounts/userManagement/factory/useAccountPermissionAccess.factory";
import appDatabase from "@/shared/database/appDatabase";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

const INVENTORY_MANAGE_PERMISSION_CODE = "inventory.manage";

export default function InventoryDashboardRoute() {
  const navigation = useSmoothNavigation();
  const { activeAccountType, activeUserRemoteId, activeAccountRemoteId } =
    useDashboardRouteContext();

  const permissionAccess = useAccountPermissionAccess({
    database: appDatabase,
    activeUserRemoteId,
    activeAccountRemoteId,
  });

  useEffect(() => {
    if (activeAccountType !== AccountType.Business) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [activeAccountType, navigation]);

  if (activeAccountType !== AccountType.Business) {
    return null;
  }

  return (
    <GetInventoryScreenFactory
      database={appDatabase}
      activeAccountRemoteId={activeAccountRemoteId}
      canManage={permissionAccess.hasPermission(INVENTORY_MANAGE_PERMISSION_CODE)}
    />
  );
}
