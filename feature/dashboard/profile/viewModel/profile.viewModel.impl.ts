import { useCallback, useEffect, useMemo, useState } from "react";
import { setActiveAccountSession } from "@/feature/appSettings/data/appSettings.store";
import { createLocalAccountDatasource } from "@/feature/setting/accounts/accountSelection/data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository.impl";
import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { createGetAccountsByOwnerUserRemoteIdUseCase } from "@/feature/setting/accounts/accountSelection/useCase/getAccountsByOwnerUserRemoteId.useCase.impl";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createGetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase.impl";
import {
  buildInitials,
  getAccountRoleLabel,
  getAccountTypeLabel,
} from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { ProfileAccountOption } from "../types/profile.types";
import {
  DashboardProfileViewModel,
  UseDashboardProfileViewModelParams,
} from "./profile.viewModel";

export const useDashboardProfileViewModel = (
  params: UseDashboardProfileViewModelParams,
): DashboardProfileViewModel => {
  const {
    database,
    activeUserRemoteId,
    activeAccountRemoteId: currentSessionAccountRemoteId,
    onNavigateHome,
    onSwitchAccountViaSelector,
    onLogout,
    onBack,
  } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [profileName, setProfileName] = useState("eLekha User");
  const [accountOptions, setAccountOptions] = useState<ProfileAccountOption[]>([]);
  const [activeAccountRemoteId, setActiveAccountRemoteId] = useState<string | null>(
    null,
  );
  const [activeAccountType, setActiveAccountType] =
    useState<AccountTypeValue | null>(null);
  const [activeAccountDisplayName, setActiveAccountDisplayName] = useState("");
  const [isSwitchExpanded, setIsSwitchExpanded] = useState(false);

  const accountDatasource = useMemo(
    () => createLocalAccountDatasource(database),
    [database],
  );

  const accountRepository = useMemo(
    () => createAccountRepository(accountDatasource),
    [accountDatasource],
  );

  const getAccountsByOwnerUserRemoteIdUseCase = useMemo(
    () => createGetAccountsByOwnerUserRemoteIdUseCase(accountRepository),
    [accountRepository],
  );

  const authUserDatasource = useMemo(
    () => createLocalAuthUserDatasource(database),
    [database],
  );

  const authUserRepository = useMemo(
    () => createAuthUserRepository(authUserDatasource),
    [authUserDatasource],
  );

  const getAuthUserByRemoteIdUseCase = useMemo(
    () => createGetAuthUserByRemoteIdUseCase(authUserRepository),
    [authUserRepository],
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(undefined);

      try {
        if (!activeUserRemoteId) {
          if (isMounted) {
            setLoadError("Active user session not found.");
          }
          return;
        }

        const userResult = await getAuthUserByRemoteIdUseCase.execute(
          activeUserRemoteId,
        );

        const accountsResult =
          await getAccountsByOwnerUserRemoteIdUseCase.execute(activeUserRemoteId);

        if (!accountsResult.success) {
          if (isMounted) {
            setLoadError(accountsResult.error.message);
          }
          return;
        }

        const options: ProfileAccountOption[] = accountsResult.value.map((account) => ({
          remoteId: account.remoteId,
          displayName: account.displayName,
          accountType: account.accountType,
          cityOrLocation: account.cityOrLocation,
          isDefault: account.isDefault,
        }));

        const activeAccount = options.find(
          (account) => account.remoteId === currentSessionAccountRemoteId,
        );

        if (!activeAccount) {
          if (isMounted) {
            setAccountOptions(options);
            setLoadError("Active account not found. Please select account again.");
          }
          return;
        }

        const resolvedProfileName =
          userResult.success && userResult.value.fullName.trim()
            ? userResult.value.fullName.trim()
            : activeAccount.displayName;

        if (!isMounted) {
          return;
        }

        setProfileName(resolvedProfileName);
        setAccountOptions(options);
        setActiveAccountRemoteId(activeAccount.remoteId);
        setActiveAccountType(activeAccount.accountType);
        setActiveAccountDisplayName(activeAccount.displayName);
      } catch (error) {
        console.error("Failed to load dashboard profile context.", error);

        if (isMounted) {
          setLoadError("Unable to load profile details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [
    activeUserRemoteId,
    currentSessionAccountRemoteId,
    getAccountsByOwnerUserRemoteIdUseCase,
    getAuthUserByRemoteIdUseCase,
  ]);

  const onToggleSwitchExpanded = useCallback(() => {
    setIsSwitchExpanded((previousValue) => !previousValue);
  }, []);

  const onSelectAccount = useCallback(
    async (accountRemoteId: string): Promise<void> => {
      setLoadError(undefined);

      const selectedAccount = accountOptions.find(
        (account) => account.remoteId === accountRemoteId,
      );

      if (!selectedAccount) {
        setLoadError("Selected account is no longer available.");
        return;
      }

      try {
        await setActiveAccountSession(database, selectedAccount.remoteId);
        setActiveAccountRemoteId(selectedAccount.remoteId);
        setActiveAccountType(selectedAccount.accountType);
        setActiveAccountDisplayName(selectedAccount.displayName);
        setIsSwitchExpanded(false);

        onNavigateHome(selectedAccount.accountType);
      } catch (error) {
        console.error("Failed to switch active account from profile.", error);
        setLoadError("Unable to switch account right now. Please try again.");
      }
    },
    [accountOptions, database, onNavigateHome],
  );

  const initials = useMemo(() => buildInitials(profileName), [profileName]);

  const roleLabel = useMemo(
    () => getAccountRoleLabel(activeAccountType),
    [activeAccountType],
  );

  const activeAccountTypeLabel = useMemo(
    () => getAccountTypeLabel(activeAccountType),
    [activeAccountType],
  );

  return useMemo<DashboardProfileViewModel>(
    () => ({
      isLoading,
      loadError,
      profileName,
      roleLabel,
      initials,
      activeAccountDisplayName,
      activeAccountTypeLabel,
      activeAccountRemoteId,
      accountOptions,
      isSwitchExpanded,
      onToggleSwitchExpanded,
      onSelectAccount,
      onSwitchAccountViaSelector,
      onLogout,
      onBack,
    }),
    [
      activeAccountDisplayName,
      activeAccountRemoteId,
      activeAccountTypeLabel,
      accountOptions,
      initials,
      isLoading,
      isSwitchExpanded,
      loadError,
      onBack,
      onLogout,
      onSelectAccount,
      onSwitchAccountViaSelector,
      onToggleSwitchExpanded,
      profileName,
      roleLabel,
    ],
  );
};
