import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { GetCategoriesScreenFactory } from "@/feature/categories/factory/getCategoriesScreen.factory";
import { useAccountPermissionAccess } from "@/feature/userManagement/factory/useAccountPermissionAccess.factory";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import React, { useEffect } from "react";

const CATEGORIES_VIEW_PERMISSION_CODE = "products.view";
const CATEGORIES_MANAGE_PERMISSION_CODE = "products.manage";

export default function CategoriesDashboardRoute() {
  const navigation = useSmoothNavigation();
  const {
    isLoading,
    hasActiveSession,
    hasActiveAccount,
    activeUserRemoteId,
    activeAccountRemoteId,
    activeAccountType,
  } = useDashboardRouteContext();

  const permissionAccess = useAccountPermissionAccess({
    activeUserRemoteId,
    activeAccountRemoteId,
  });

  const shouldEnforceBusinessPermission =
    activeAccountType === AccountType.Business;
  const canViewCategories = shouldEnforceBusinessPermission
    ? permissionAccess.hasPermission(CATEGORIES_VIEW_PERMISSION_CODE)
    : true;
  const canManageCategories = shouldEnforceBusinessPermission
    ? permissionAccess.hasPermission(CATEGORIES_MANAGE_PERMISSION_CODE)
    : true;

  useEffect(() => {
    if (isLoading || !hasActiveSession || !hasActiveAccount) {
      return;
    }

    if (!shouldEnforceBusinessPermission || permissionAccess.isLoading) {
      return;
    }

    if (!canViewCategories) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [
    activeAccountType,
    canViewCategories,
    hasActiveAccount,
    hasActiveSession,
    isLoading,
    navigation,
    permissionAccess.isLoading,
    shouldEnforceBusinessPermission,
  ]);

  if (
    isLoading ||
    !hasActiveSession ||
    !hasActiveAccount ||
    (shouldEnforceBusinessPermission && permissionAccess.isLoading)
  ) {
    return null;
  }

  if (!canViewCategories) {
    return null;
  }

  return (
    <GetCategoriesScreenFactory
      activeUserRemoteId={activeUserRemoteId}
      activeAccountRemoteId={activeAccountRemoteId}
      activeAccountType={activeAccountType}
      canManage={canManageCategories}
    />
  );
}
