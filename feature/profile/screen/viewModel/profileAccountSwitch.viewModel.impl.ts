import { useCallback, useState } from "react";
import {
  ProfileAccountSwitchViewModel,
  UseProfileAccountSwitchViewModelParams,
} from "./profileAccountSwitch.viewModel";

export const useProfileAccountSwitchViewModel = (
  params: UseProfileAccountSwitchViewModelParams,
): ProfileAccountSwitchViewModel => {
  const {
    setActiveAccountSession,
    data,
    onUpdateData,
    onNavigateHome,
    setLoadError,
    clearSuccessMessage,
  } = params;

  const [isSwitchExpanded, setIsSwitchExpanded] = useState(false);

  const onToggleSwitchExpanded = useCallback(() => {
    setIsSwitchExpanded((previousValue) => !previousValue);
    setLoadError(null);
    clearSuccessMessage();
  }, [clearSuccessMessage, setLoadError]);

  const onSelectAccount = useCallback(
    async (accountRemoteId: string): Promise<void> => {
      setLoadError(null);
      clearSuccessMessage();

      const selectedAccount = data.accountOptions.find(
        (account) => account.remoteId === accountRemoteId,
      );

      if (!selectedAccount) {
        setLoadError("Selected account is no longer available.");
        return;
      }

      try {
        await setActiveAccountSession(selectedAccount.remoteId);
        onUpdateData((previousData) => ({
          ...previousData,
          activeAccountRemoteId: selectedAccount.remoteId,
          activeAccountType: selectedAccount.accountType,
          isActiveAccountOwner:
            selectedAccount.ownerUserRemoteId ===
            previousData.loadedAuthUser?.remoteId,
          activeAccountDisplayName: selectedAccount.displayName,
        }));
        setIsSwitchExpanded(false);

        onNavigateHome(selectedAccount.accountType);
      } catch {
        setLoadError("Unable to switch account right now. Please try again.");
      }
    },
    [
      clearSuccessMessage,
      data.accountOptions,
      onNavigateHome,
      onUpdateData,
      setActiveAccountSession,
      setLoadError,
    ],
  );

  return {
    isSwitchExpanded,
    onToggleSwitchExpanded,
    onSelectAccount,
  };
};
