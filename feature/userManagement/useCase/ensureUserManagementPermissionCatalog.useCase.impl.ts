import { UserManagementRepository } from "../data/repository/userManagement.repository";
import { EnsureUserManagementPermissionCatalogUseCase } from "./ensureUserManagementPermissionCatalog.useCase";

export const createEnsureUserManagementPermissionCatalogUseCase = (
  userManagementRepository: UserManagementRepository,
): EnsureUserManagementPermissionCatalogUseCase => ({
  async execute() {
    return userManagementRepository.ensurePermissionCatalogSeeded();
  },
});
