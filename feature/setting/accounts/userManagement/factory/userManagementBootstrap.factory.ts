import { Database } from "@nozbe/watermelondb";
import { createLocalAccountDatasource } from "@/feature/setting/accounts/accountSelection/data/dataSource/local.account.datasource.impl";
import { createAccountRepository } from "@/feature/setting/accounts/accountSelection/data/repository/account.repository.impl";
import { createLocalAuthUserDatasource } from "@/feature/session/data/dataSource/local.authUser.datasource.impl";
import { createAuthUserRepository } from "@/feature/session/data/repository/authUser.repository.impl";
import { createLocalUserManagementDatasource } from "../data/dataSource/local.userManagement.datasource.impl";
import { createUserManagementRepository } from "../data/repository/userManagement.repository.impl";
import { createEnsureUserManagementPermissionCatalogUseCase } from "../useCase/ensureUserManagementPermissionCatalog.useCase.impl";

export const ensureUserManagementReady = async (
  database: Database,
): Promise<void> => {
  const userManagementDatasource = createLocalUserManagementDatasource(database);
  const accountDatasource = createLocalAccountDatasource(database);
  const authUserDatasource = createLocalAuthUserDatasource(database);

  const repository = createUserManagementRepository({
    localDatasource: userManagementDatasource,
    accountRepository: createAccountRepository(accountDatasource),
    authUserRepository: createAuthUserRepository(authUserDatasource),
  });
  const ensurePermissionCatalogUseCase =
    createEnsureUserManagementPermissionCatalogUseCase(repository);

  const result = await ensurePermissionCatalogUseCase.execute();

  if (!result.success) {
    throw new Error(result.error.message);
  }
};
