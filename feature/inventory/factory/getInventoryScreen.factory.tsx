import React from "react";
import { Database } from "@nozbe/watermelondb";
import { createLocalInventoryDatasource } from "@/feature/inventory/data/dataSource/local.inventory.datasource.impl";
import { createInventoryRepository } from "@/feature/inventory/data/repository/inventory.repository.impl";
import { createGetInventorySnapshotUseCase } from "@/feature/inventory/useCase/getInventorySnapshot.useCase.impl";
import { createSaveInventoryMovementUseCase } from "@/feature/inventory/useCase/saveInventoryMovement.useCase.impl";
import { useInventoryViewModel } from "@/feature/inventory/viewModel/inventory.viewModel.impl";
import { InventoryScreen } from "@/feature/inventory/ui/InventoryScreen";

type Props = {
  database: Database;
  activeAccountRemoteId: string | null;
  canManage: boolean;
};

export function GetInventoryScreenFactory({
  database,
  activeAccountRemoteId,
  canManage,
}: Props) {
  const datasource = createLocalInventoryDatasource(database);
  const repository = createInventoryRepository(datasource);
  const getInventorySnapshotUseCase = createGetInventorySnapshotUseCase(repository);
  const saveInventoryMovementUseCase = createSaveInventoryMovementUseCase(repository);

  const viewModel = useInventoryViewModel({
    accountRemoteId: activeAccountRemoteId,
    canManage,
    getInventorySnapshotUseCase,
    saveInventoryMovementUseCase,
  });

  return <InventoryScreen viewModel={viewModel} />;
}
