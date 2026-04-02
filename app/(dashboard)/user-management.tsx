import React, { useCallback, useEffect } from "react";
import { GetUserManagementScreenFactory } from "@/feature/setting/accounts/userManagement/factory/getUserManagementScreen.factory";
import { useAccountPermissionAccess } from "@/feature/setting/accounts/userManagement/factory/useAccountPermissionAccess.factory";
import appDatabase from "@/shared/database/appDatabase";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { AccountType } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

const USER_MANAGEMENT_VIEW_PERMISSION_CODE = "user_management.view";

export default function UserManagementRoute() {
  const navigation = useSmoothNavigation();
  const {
    activeAccountType,
    activeUserRemoteId,
    activeAccountRemoteId,
  } = useDashboardRouteContext();

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

  useEffect(() => {
    if (permissionAccess.isLoading) {
      return;
    }

    if (!permissionAccess.hasPermission(USER_MANAGEMENT_VIEW_PERMISSION_CODE)) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [activeAccountType, navigation, permissionAccess]);

  const handleBack = useCallback(() => {
    navigation.replace("/(dashboard)/more");
  }, [navigation]);

  if (
    activeAccountType !== AccountType.Business ||
    !permissionAccess.hasPermission(USER_MANAGEMENT_VIEW_PERMISSION_CODE)
  ) {
    return null;
  }

  return (
    <GetUserManagementScreenFactory
      database={appDatabase}
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onBack={handleBack}
    />
  );
}
