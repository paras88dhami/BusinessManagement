import { Database } from "@nozbe/watermelondb";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createLocalAccountDatasource } from "@/feature/setting/accounts/accountSelection/data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository.impl";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createLocalUserManagementDatasource } from "../data/dataSource/local.userManagement.datasource.impl";
import { createUserManagementRepository } from "../data/repository/userManagement.repository.impl";
import { createResolveAccountPermissionCodesUseCase } from "../useCase/resolveAccountPermissionCodes.useCase.impl";

type UseAccountPermissionAccessParams = {
  database: Database;
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
};

export type AccountPermissionAccess = {
  isLoading: boolean;
  permissionCodes: readonly string[];
  error?: string;
  hasPermission: (permissionCode: string) => boolean;
  reload: () => Promise<void>;
};

export const useAccountPermissionAccess = (
  params: UseAccountPermissionAccessParams,
): AccountPermissionAccess => {
  const { database, activeUserRemoteId, activeAccountRemoteId } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const userManagementDatasource = useMemo(
    () => createLocalUserManagementDatasource(database),
    [database],
  );

  const accountDatasource = useMemo(
    () => createLocalAccountDatasource(database),
    [database],
  );

  const accountRepository = useMemo(
    () => createAccountRepository(accountDatasource),
    [accountDatasource],
  );

  const authUserDatasource = useMemo(
    () => createLocalAuthUserDatasource(database),
    [database],
  );

  const authUserRepository = useMemo(
    () => createAuthUserRepository(authUserDatasource),
    [authUserDatasource],
  );

  const userManagementRepository = useMemo(
    () =>
      createUserManagementRepository({
        localDatasource: userManagementDatasource,
        accountRepository,
        authUserRepository,
      }),
    [accountRepository, authUserRepository, userManagementDatasource],
  );

  const resolveAccountPermissionCodesUseCase = useMemo(
    () => createResolveAccountPermissionCodesUseCase(userManagementRepository),
    [userManagementRepository],
  );

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      if (!activeUserRemoteId || !activeAccountRemoteId) {
        setPermissionCodes([]);
        setError("Active account session was not found.");
        return;
      }

      const permissionCodesResult =
        await resolveAccountPermissionCodesUseCase.execute({
          accountRemoteId: activeAccountRemoteId,
          userRemoteId: activeUserRemoteId,
        });

      if (!permissionCodesResult.success) {
        setPermissionCodes([]);
        setError(permissionCodesResult.error.message);
        return;
      }

      setPermissionCodes(permissionCodesResult.value);
    } catch (caughtError) {
      setPermissionCodes([]);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to resolve account permissions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    activeAccountRemoteId,
    activeUserRemoteId,
    resolveAccountPermissionCodesUseCase,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const hasPermission = useCallback(
    (permissionCode: string): boolean => permissionCodes.includes(permissionCode),
    [permissionCodes],
  );

  return useMemo(
    () => ({
      isLoading,
      permissionCodes,
      error,
      hasPermission,
      reload,
    }),
    [error, hasPermission, isLoading, permissionCodes, reload],
  );
};
