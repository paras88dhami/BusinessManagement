import React from "react";
import { createMemoryPosDatasource } from "../data/dataSource/memory.pos.datasource.impl";
import { createPosRepository } from "../data/repository/pos.repository.impl";
import { createAssignProductToSlotUseCase } from "../useCase/assignProductToSlot.useCase.impl";
import { createApplyDiscountUseCase } from "../useCase/applyDiscount.useCase.impl";
import { createApplySurchargeUseCase } from "../useCase/applySurcharge.useCase.impl";
import { createChangeCartLineQuantityUseCase } from "../useCase/changeCartLineQuantity.useCase.impl";
import { createClearCartUseCase } from "../useCase/clearCart.useCase.impl";
import { createCompletePaymentUseCase } from "../useCase/completePayment.useCase.impl";
import { createGetPosBootstrapUseCase } from "../useCase/getPosBootstrap.useCase.impl";
import { createPrintReceiptUseCase } from "../useCase/printReceipt.useCase.impl";
import { createRemoveProductFromSlotUseCase } from "../useCase/removeProductFromSlot.useCase.impl";
import { createSearchPosProductsUseCase } from "../useCase/searchPosProducts.useCase.impl";
import { PosScreen } from "../ui/PosScreen";
import { usePosScreenViewModel } from "../viewModel/posScreen.viewModel.impl";

type GetPosScreenFactoryProps = {
  activeBusinessRemoteId: string | null;
  activeSettlementAccountRemoteId: string | null;
};

export function GetPosScreenFactory({
  activeBusinessRemoteId,
  activeSettlementAccountRemoteId,
}: GetPosScreenFactoryProps) {
  const datasource = React.useMemo(() => createMemoryPosDatasource(), []);
  const repository = React.useMemo(() => createPosRepository(datasource), [datasource]);

  const getPosBootstrapUseCase = React.useMemo(
    () => createGetPosBootstrapUseCase(repository),
    [repository],
  );
  const searchPosProductsUseCase = React.useMemo(
    () => createSearchPosProductsUseCase(repository),
    [repository],
  );
  const assignProductToSlotUseCase = React.useMemo(
    () => createAssignProductToSlotUseCase(repository),
    [repository],
  );
  const removeProductFromSlotUseCase = React.useMemo(
    () => createRemoveProductFromSlotUseCase(repository),
    [repository],
  );
  const changeCartLineQuantityUseCase = React.useMemo(
    () => createChangeCartLineQuantityUseCase(repository),
    [repository],
  );
  const applyDiscountUseCase = React.useMemo(
    () => createApplyDiscountUseCase(repository),
    [repository],
  );
  const applySurchargeUseCase = React.useMemo(
    () => createApplySurchargeUseCase(repository),
    [repository],
  );
  const clearCartUseCase = React.useMemo(
    () => createClearCartUseCase(repository),
    [repository],
  );
  const completePaymentUseCase = React.useMemo(
    () => createCompletePaymentUseCase(repository),
    [repository],
  );
  const printReceiptUseCase = React.useMemo(
    () => createPrintReceiptUseCase(repository),
    [repository],
  );

  const viewModel = usePosScreenViewModel({
    activeBusinessRemoteId,
    activeSettlementAccountRemoteId,
    getPosBootstrapUseCase,
    searchPosProductsUseCase,
    assignProductToSlotUseCase,
    removeProductFromSlotUseCase,
    changeCartLineQuantityUseCase,
    applyDiscountUseCase,
    applySurchargeUseCase,
    clearCartUseCase,
    completePaymentUseCase,
    printReceiptUseCase,
  });

  return <PosScreen viewModel={viewModel} />;
}
