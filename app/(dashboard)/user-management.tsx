import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { GetUserManagementScreenFactory } from "@/feature/userManagement/factory/getUserManagementScreen.factory";
import { useAccountPermissionAccess } from "@/feature/userManagement/factory/useAccountPermissionAccess.factory";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import React, { useCallback, useEffect } from "react";

const USER_MANAGEMENT_VIEW_PERMISSION_CODE = "user_management.view";

export default function UserManagementRoute() {
  const navigation = useSmoothNavigation();
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeAccountType,
    activeUserRemoteId,
    activeAccountRemoteId,
  } = useDashboardRouteContext();

  const permissionAccess = useAccountPermissionAccess({
    activeUserRemoteId,
    activeAccountRemoteId,
  });
  const canViewUserManagement = permissionAccess.hasPermission(
    USER_MANAGEMENT_VIEW_PERMISSION_CODE,
  );

  useEffect(() => {
    if (isLoading || !hasActiveSession || !hasActiveAccount) {
      return;
    }

    if (activeAccountType !== AccountType.Business) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [
    activeAccountType,
    hasActiveAccount,
    hasActiveSession,
    isLoading,
    navigation,
  ]);

  useEffect(() => {
    if (isLoading || !hasActiveSession || !hasActiveAccount) {
      return;
    }

    if (
      activeAccountType !== AccountType.Business ||
      permissionAccess.isLoading
    ) {
      return;
    }

    if (!canViewUserManagement) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [
    activeAccountType,
    canViewUserManagement,
    hasActiveAccount,
    hasActiveSession,
    isLoading,
    navigation,
    permissionAccess.isLoading,
  ]);

  const handleBack = useCallback(() => {
    navigation.replace("/(dashboard)/more");
  }, [navigation]);

  if (
    isLoading ||
    !hasActiveSession ||
    !hasActiveAccount ||
    permissionAccess.isLoading
  ) {
    return null;
  }

  if (activeAccountType !== AccountType.Business || !canViewUserManagement) {
    return null;
  }

  return (
    <GetUserManagementScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      onBack={handleBack}
    />
  );
}
