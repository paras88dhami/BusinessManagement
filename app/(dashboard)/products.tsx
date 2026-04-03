import React, { useEffect } from "react";
import { GetProductsScreenFactory } from "@/feature/products/factory/getProductsScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useAccountPermissionAccess } from "@/feature/setting/accounts/userManagement/factory/useAccountPermissionAccess.factory";
import appDatabase from "@/shared/database/appDatabase";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

const PRODUCTS_MANAGE_PERMISSION_CODE = "products.manage";

export default function ProductsDashboardRoute() {
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
    <GetProductsScreenFactory
      database={appDatabase}
      activeAccountRemoteId={activeAccountRemoteId}
      canManage={permissionAccess.hasPermission(PRODUCTS_MANAGE_PERMISSION_CODE)}
    />
  );
}
