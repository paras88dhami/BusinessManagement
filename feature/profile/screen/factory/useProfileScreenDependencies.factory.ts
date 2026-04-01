import { Database } from "@nozbe/watermelondb";
import { useCallback, useMemo } from "react";
import { setActiveAccountSession } from "@/feature/appSettings/data/appSettings.store";
import { createLocalBusinessProfileDatasource } from "@/feature/profile/business/data/dataSource/local.businessProfile.datasource.impl";
import { createBusinessProfileRepository } from "@/feature/profile/business/data/repository/businessProfile.repository.impl";
import { createCreateBusinessWorkspaceUseCase } from "@/feature/profile/business/useCase/createBusinessWorkspace.useCase.impl";
import { createGetBusinessProfileByAccountRemoteIdUseCase } from "@/feature/profile/business/useCase/getBusinessProfileByAccountRemoteId.useCase.impl";
import { createSaveBusinessProfileUseCase } from "@/feature/profile/business/useCase/saveBusinessProfile.useCase.impl";
import { createLocalAccountDatasource } from "@/feature/setting/accounts/accountSelection/data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository.impl";
import { createGetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/setting/accounts/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase.impl";
import { createSaveAccountUseCase } from "@/feature/setting/accounts/accountSelection/useCase/saveAccount.useCase.impl";
import { createLocalUserManagementDatasource } from "@/feature/setting/accounts/userManagement/data/dataSource/local.userManagement.datasource.impl";
import { createUserManagementRepository } from "@/feature/setting/accounts/userManagement/data/repository/userManagement.repository.impl";
import { createGetUserManagementSnapshotUseCase } from "@/feature/setting/accounts/userManagement/useCase/getUserManagementSnapshot.useCase.impl";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createGetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase.impl";
import { createSaveAuthUserUseCase } from "@/feature/session/useCase/saveAuthUser.useCase.impl";
import { ProfileScreenDependencies } from "@/feature/profile/screen/viewModel/profileScreen.viewModel";

export const useProfileScreenDependencies = (
  database: Database,
): ProfileScreenDependencies => {
  const accountDatasource = useMemo(
    () => createLocalAccountDatasource(database),
    [database],
  );

  const accountRepository = useMemo(
    () => createAccountRepository(accountDatasource),
    [accountDatasource],
  );

  const saveAccountUseCase = useMemo(
    () => createSaveAccountUseCase(accountRepository),
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

  const userManagementDatasource = useMemo(
    () => createLocalUserManagementDatasource(database),
    [database],
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

  const getAccessibleAccountsByUserRemoteIdUseCase = useMemo(
    () =>
      createGetAccessibleAccountsByUserRemoteIdUseCase({
        accountRepository,
        userManagementRepository,
      }),
    [accountRepository, userManagementRepository],
  );

  const getUserManagementSnapshotUseCase = useMemo(
    () => createGetUserManagementSnapshotUseCase(userManagementRepository),
    [userManagementRepository],
  );

  const getAuthUserByRemoteIdUseCase = useMemo(
    () => createGetAuthUserByRemoteIdUseCase(authUserRepository),
    [authUserRepository],
  );

  const saveAuthUserUseCase = useMemo(
    () => createSaveAuthUserUseCase(authUserRepository),
    [authUserRepository],
  );

  const businessProfileDatasource = useMemo(
    () => createLocalBusinessProfileDatasource(database),
    [database],
  );

  const businessProfileRepository = useMemo(
    () => createBusinessProfileRepository(businessProfileDatasource),
    [businessProfileDatasource],
  );

  const getBusinessProfileByAccountRemoteIdUseCase = useMemo(
    () =>
      createGetBusinessProfileByAccountRemoteIdUseCase(
        businessProfileRepository,
      ),
    [businessProfileRepository],
  );

  const saveBusinessProfileUseCase = useMemo(
    () => createSaveBusinessProfileUseCase(businessProfileRepository),
    [businessProfileRepository],
  );

  const createBusinessWorkspaceUseCase = useMemo(
    () =>
      createCreateBusinessWorkspaceUseCase({
        saveAccountUseCase,
        saveBusinessProfileUseCase,
      }),
    [saveAccountUseCase, saveBusinessProfileUseCase],
  );

  const onSetActiveAccountSession = useCallback(
    (accountRemoteId: string) =>
      setActiveAccountSession(database, accountRemoteId),
    [database],
  );

  return useMemo(
    () => ({
      getAccessibleAccountsByUserRemoteIdUseCase,
      saveAccountUseCase,
      getAuthUserByRemoteIdUseCase,
      getUserManagementSnapshotUseCase,
      saveAuthUserUseCase,
      getBusinessProfileByAccountRemoteIdUseCase,
      saveBusinessProfileUseCase,
      createBusinessWorkspaceUseCase,
      setActiveAccountSession: onSetActiveAccountSession,
    }),
    [
      createBusinessWorkspaceUseCase,
      getAccessibleAccountsByUserRemoteIdUseCase,
      getAuthUserByRemoteIdUseCase,
      getUserManagementSnapshotUseCase,
      getBusinessProfileByAccountRemoteIdUseCase,
      onSetActiveAccountSession,
      saveAccountUseCase,
      saveAuthUserUseCase,
      saveBusinessProfileUseCase,
    ],
  );
};
