import { Database } from "@nozbe/watermelondb";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAppSessionState } from "@/feature/appSettings/data/appSettings.store";
import { AppSettingsModel } from "@/feature/appSettings/data/dataSource/db/appSettings.model";
import { createLocalAccountDatasource } from "@/feature/setting/accounts/accountSelection/data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository.impl";
import { createGetAccountsByOwnerUserRemoteIdUseCase } from "@/feature/setting/accounts/accountSelection/useCase/getAccountsByOwnerUserRemoteId.useCase.impl";
import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createGetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase.impl";
import { buildInitials } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";

export type DashboardRouteContext = {
  isLoading: boolean;
  hasActiveSession: boolean;
  hasActiveAccount: boolean;
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountType: AccountTypeValue | null;
  activeAccountDisplayName: string;
  profileName: string;
  profileInitials: string;
};

export type AppRouteSessionValue = DashboardRouteContext & {
  refreshSession: () => Promise<void>;
};

const INITIAL_CONTEXT: DashboardRouteContext = {
  isLoading: true,
  hasActiveSession: false,
  hasActiveAccount: false,
  activeUserRemoteId: null,
  activeAccountRemoteId: null,
  activeAccountType: null,
  activeAccountDisplayName: "",
  profileName: "eLekha User",
  profileInitials: "EL",
};

const APP_SETTINGS_TABLE = "app_settings";

const noopRefreshSession = async (): Promise<void> => {};

type AppRouteSessionProviderProps = {
  database: Database;
  children: React.ReactNode;
};

const AppRouteSessionContext =
  createContext<AppRouteSessionValue>({
    ...INITIAL_CONTEXT,
    refreshSession: noopRefreshSession,
  });

export function AppRouteSessionProvider({
  database,
  children,
}: AppRouteSessionProviderProps) {
  const [context, setContext] = useState<DashboardRouteContext>(INITIAL_CONTEXT);
  const isMountedRef = useRef(false);
  const activeRequestIdRef = useRef(0);

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

  const resolveContext = useCallback(async (): Promise<void> => {
    const requestId = ++activeRequestIdRef.current;

    try {
      const sessionState = await getAppSessionState(database);

      const activeUserRemoteId = sessionState.activeUserRemoteId;
      const activeAccountRemoteId = sessionState.activeAccountRemoteId;

      const hasActiveSession = Boolean(activeUserRemoteId);
      let hasActiveAccount = Boolean(activeAccountRemoteId);
      let activeAccountType: AccountTypeValue | null = null;
      let activeAccountDisplayName = "";

      let profileName = "eLekha User";
      let profileInitials = "EL";

      if (hasActiveSession && activeUserRemoteId) {
        const authUserResult =
          await getAuthUserByRemoteIdUseCase.execute(activeUserRemoteId);

        if (authUserResult.success) {
          const userFullName = authUserResult.value.fullName.trim();

          if (userFullName) {
            profileName = userFullName;
            profileInitials = buildInitials(userFullName);
          }
        }

        const accountsResult =
          await getAccountsByOwnerUserRemoteIdUseCase.execute(activeUserRemoteId);

        if (accountsResult.success) {
          const activeAccount = accountsResult.value.find(
            (account) => account.remoteId === activeAccountRemoteId,
          );

          if (activeAccount) {
            hasActiveAccount = true;
            activeAccountType = activeAccount.accountType;
            activeAccountDisplayName = activeAccount.displayName;

            if (profileName === "eLekha User") {
              profileName = activeAccount.displayName;
              profileInitials = buildInitials(activeAccount.displayName);
            }
          } else {
            hasActiveAccount = false;
          }
        } else {
          hasActiveAccount = false;
        }
      }

      if (!isMountedRef.current || requestId !== activeRequestIdRef.current) {
        return;
      }

      setContext({
        isLoading: false,
        hasActiveSession,
        hasActiveAccount,
        activeUserRemoteId,
        activeAccountRemoteId,
        activeAccountType,
        activeAccountDisplayName,
        profileName,
        profileInitials,
      });
    } catch {
      if (!isMountedRef.current || requestId !== activeRequestIdRef.current) {
        return;
      }

      setContext({
        ...INITIAL_CONTEXT,
        isLoading: false,
      });
    }
  }, [
    database,
    getAccountsByOwnerUserRemoteIdUseCase,
    getAuthUserByRemoteIdUseCase,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    const appSettingsCollection =
      database.get<AppSettingsModel>(APP_SETTINGS_TABLE);

    const subscription = appSettingsCollection
      .query()
      .observeWithColumns([
        "active_user_remote_id",
        "active_account_remote_id",
      ])
      .subscribe(() => {
        void resolveContext();
      });

    void resolveContext();

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [database, resolveContext]);

  const value = useMemo<AppRouteSessionValue>(
    () => ({
      ...context,
      refreshSession: resolveContext,
    }),
    [context, resolveContext],
  );

  return (
    <AppRouteSessionContext.Provider value={value}>
      {children}
    </AppRouteSessionContext.Provider>
  );
}

export const useAppRouteSession = (): AppRouteSessionValue => {
  return useContext(AppRouteSessionContext);
};
