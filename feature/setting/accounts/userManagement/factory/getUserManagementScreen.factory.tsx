import React from "react";
import { Database } from "@nozbe/watermelondb";
import { createLocalAccountDatasource } from "@/feature/setting/accounts/accountSelection/data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository.impl";
import { createGetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/setting/accounts/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase.impl";
import { createLocalAuthCredentialDatasource } from "@/feature/session/data/dataSource/local.authCredential.datasource.impl";
import { createAuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository.impl";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createGetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase.impl";
import { createPasswordHashService } from "@/shared/utils/auth/passwordHash.service";
import { createLocalUserManagementDatasource } from "../data/dataSource/local.userManagement.datasource.impl";
import { createUserManagementRepository } from "../data/repository/userManagement.repository.impl";
import { createChangeAccountMemberStatusUseCase } from "../useCase/changeAccountMemberStatus.useCase.impl";
import { createCreateAccountMemberUseCase } from "../useCase/createAccountMember.useCase.impl";
import { createDeleteAccountMemberUseCase } from "../useCase/deleteAccountMember.useCase.impl";
import { createDeleteUserManagementRoleUseCase } from "../useCase/deleteUserManagementRole.useCase.impl";
import { createGetUserManagementSnapshotUseCase } from "../useCase/getUserManagementSnapshot.useCase.impl";
import { createSaveUserManagementRoleUseCase } from "../useCase/saveUserManagementRole.useCase.impl";
import { createUpdateAccountMemberUseCase } from "../useCase/updateAccountMember.useCase.impl";
import { UserManagementScreen } from "../ui/UserManagementScreen";
import { useUserManagementViewModel } from "../viewModel/userManagement.viewModel.impl";

type GetUserManagementScreenFactoryProps = {
  database: Database;
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  onBack: () => void;
};

export function GetUserManagementScreenFactory({
  database,
  activeUserRemoteId,
  activeAccountRemoteId,
  onBack,
}: GetUserManagementScreenFactoryProps) {
  const userManagementDatasource = React.useMemo(
    () => createLocalUserManagementDatasource(database),
    [database],
  );

  const accountDatasource = React.useMemo(
    () => createLocalAccountDatasource(database),
    [database],
  );

  const accountRepository = React.useMemo(
    () => createAccountRepository(accountDatasource),
    [accountDatasource],
  );

  const authUserDatasource = React.useMemo(
    () => createLocalAuthUserDatasource(database),
    [database],
  );

  const authUserRepository = React.useMemo(
    () => createAuthUserRepository(authUserDatasource),
    [authUserDatasource],
  );

  const authCredentialDatasource = React.useMemo(
    () => createLocalAuthCredentialDatasource(database),
    [database],
  );

  const authCredentialRepository = React.useMemo(
    () => createAuthCredentialRepository(authCredentialDatasource),
    [authCredentialDatasource],
  );

  const userManagementRepository = React.useMemo(
    () =>
      createUserManagementRepository({
        localDatasource: userManagementDatasource,
        accountRepository,
        authUserRepository,
      }),
    [accountRepository, authUserRepository, userManagementDatasource],
  );

  const getUserManagementSnapshotUseCase = React.useMemo(
    () => createGetUserManagementSnapshotUseCase(userManagementRepository),
    [userManagementRepository],
  );

  const saveUserManagementRoleUseCase = React.useMemo(
    () => createSaveUserManagementRoleUseCase(userManagementRepository),
    [userManagementRepository],
  );

  const getAuthUserByRemoteIdUseCase = React.useMemo(
    () => createGetAuthUserByRemoteIdUseCase(authUserRepository),
    [authUserRepository],
  );

  const passwordHashService = React.useMemo(() => createPasswordHashService(), []);

  const createAccountMemberUseCase = React.useMemo(
    () =>
      createCreateAccountMemberUseCase({
        userManagementRepository,
        authCredentialRepository,
        passwordHashService,
      }),
    [authCredentialRepository, passwordHashService, userManagementRepository],
  );

  const updateAccountMemberUseCase = React.useMemo(
    () =>
      createUpdateAccountMemberUseCase({
        userManagementRepository,
        getAuthUserByRemoteIdUseCase,
        authCredentialRepository,
        passwordHashService,
      }),
    [
      authCredentialRepository,
      getAuthUserByRemoteIdUseCase,
      passwordHashService,
      userManagementRepository,
    ],
  );

  const getAccessibleAccountsByUserRemoteIdUseCase = React.useMemo(
    () =>
      createGetAccessibleAccountsByUserRemoteIdUseCase({
        accountRepository,
        userManagementRepository,
      }),
    [accountRepository, userManagementRepository],
  );

  const changeAccountMemberStatusUseCase = React.useMemo(
    () =>
      createChangeAccountMemberStatusUseCase({
        userManagementRepository,
        authCredentialRepository,
        getAccessibleAccountsByUserRemoteIdUseCase,
      }),
    [
      authCredentialRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      userManagementRepository,
    ],
  );

  const deleteAccountMemberUseCase = React.useMemo(
    () =>
      createDeleteAccountMemberUseCase({
        userManagementRepository,
        getAccessibleAccountsByUserRemoteIdUseCase,
        authCredentialRepository,
      }),
    [
      authCredentialRepository,
      getAccessibleAccountsByUserRemoteIdUseCase,
      userManagementRepository,
    ],
  );

  const deleteUserManagementRoleUseCase = React.useMemo(
    () => createDeleteUserManagementRoleUseCase(userManagementRepository),
    [userManagementRepository],
  );

  const viewModel = useUserManagementViewModel({
    activeUserRemoteId,
    activeAccountRemoteId,
    getUserManagementSnapshotUseCase,
    createAccountMemberUseCase,
    updateAccountMemberUseCase,
    changeAccountMemberStatusUseCase,
    deleteAccountMemberUseCase,
    saveUserManagementRoleUseCase,
    deleteUserManagementRoleUseCase,
    onBack,
  });

  return <UserManagementScreen viewModel={viewModel} />;
}
