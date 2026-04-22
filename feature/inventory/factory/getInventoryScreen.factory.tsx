import React from "react";
import { createLocalInventoryDatasource } from "@/feature/inventory/data/dataSource/local.inventory.datasource.impl";
import { createInventoryRepository } from "@/feature/inventory/data/repository/inventory.repository.impl";
import { createGetInventorySnapshotUseCase } from "@/feature/inventory/useCase/getInventorySnapshot.useCase.impl";
import { createSaveInventoryMovementUseCase } from "@/feature/inventory/useCase/saveInventoryMovement.useCase.impl";
import { useInventoryViewModel } from "@/feature/inventory/viewModel/inventory.viewModel.impl";
import { InventoryScreen } from "@/feature/inventory/ui/InventoryScreen";
import { createLocalProductDatasource } from "@/feature/products/data/dataSource/local.product.datasource.impl";
import { createProductRepository } from "@/feature/products/data/repository/product.repository.impl";
import { useAccountPermissionAccess } from "@/feature/userManagement/factory/useAccountPermissionAccess.factory";
import appDatabase from "@/shared/database/appDatabase";

const INVENTORY_MANAGE_PERMISSION_CODE = "inventory.manage";

type Props = {
  activeAccountRemoteId: string | null;
  activeUserRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
};

export function GetInventoryScreenFactory({
  activeAccountRemoteId,
  activeUserRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
}: Props) {
  const permissionAccess = useAccountPermissionAccess({
    activeUserRemoteId,
    activeAccountRemoteId,
  });

  const inventoryDatasource = React.useMemo(
    () => createLocalInventoryDatasource(appDatabase),
    [],
  );
  const inventoryRepository = React.useMemo(
    () => createInventoryRepository(inventoryDatasource),
    [inventoryDatasource],
  );

  const productDatasource = React.useMemo(
    () => createLocalProductDatasource(appDatabase),
    [],
  );
  const productRepository = React.useMemo(
    () => createProductRepository(productDatasource),
    [productDatasource],
  );

  const getInventorySnapshotUseCase = React.useMemo(
    () => createGetInventorySnapshotUseCase(inventoryRepository),
    [inventoryRepository],
  );

  const saveInventoryMovementUseCase = React.useMemo(
    () =>
      createSaveInventoryMovementUseCase({
        inventoryRepository,
        productRepository,
      }),
    [inventoryRepository, productRepository],
  );

  const viewModel = useInventoryViewModel({
    accountRemoteId: activeAccountRemoteId,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
    canManage: permissionAccess.hasPermission(INVENTORY_MANAGE_PERMISSION_CODE),
    getInventorySnapshotUseCase,
    saveInventoryMovementUseCase,
  });

  return <InventoryScreen viewModel={viewModel} />;
}
