import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { GetNotesScreenFactory } from "@/feature/appSettings/notes/factory/getNotesScreen.factory";
import { useDashboardRouteContext } from "@/feature/dashboard/shared/hooks/useDashboardRouteContext";
import { getDashboardHomePath } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { useAccountPermissionAccess } from "@/feature/userManagement/factory/useAccountPermissionAccess.factory";
import { useSmoothNavigation } from "@/shared/hooks/useSmoothNavigation";
import React, { useEffect } from "react";

const NOTES_VIEW_PERMISSION_CODE = "notes.view";

export default function NotesDashboardRoute() {
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

  const canViewNotes = permissionAccess.hasPermission(NOTES_VIEW_PERMISSION_CODE);
  const shouldEnforceBusinessPermission =
    activeAccountType === AccountType.Business;
  const hasNotesAccess = shouldEnforceBusinessPermission ? canViewNotes : true;

  useEffect(() => {
    if (isLoading || !hasActiveSession || !hasActiveAccount) {
      return;
    }

    if (!shouldEnforceBusinessPermission || permissionAccess.isLoading) {
      return;
    }

    if (!hasNotesAccess) {
      navigation.replace(getDashboardHomePath(activeAccountType));
    }
  }, [
    activeAccountType,
    hasActiveAccount,
    hasActiveSession,
    hasNotesAccess,
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

  if (!hasNotesAccess) {
    return null;
  }

  return <GetNotesScreenFactory activeAccountRemoteId={activeAccountRemoteId} />;
}
