import { createLocalMoneyAccountDatasource } from "@/feature/accounts/data/dataSource/local.moneyAccount.datasource.impl";
import { createMoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository.impl";
import { createGetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase.impl";
import { createLocalAuditDatasource } from "@/feature/audit/data/dataSource/local.audit.datasource.impl";
import { createAuditRepository } from "@/feature/audit/data/repository/audit.repository.impl";
import { createRecordAuditEventUseCase } from "@/feature/audit/useCase/recordAuditEvent.useCase.impl";
import { createLocalBillingDatasource } from "@/feature/billing/data/dataSource/local.billing.datasource.impl";
import { createBillingRepository } from "@/feature/billing/data/repository/billing.repository.impl";
import { createDeleteBillingDocumentUseCase } from "@/feature/billing/useCase/deleteBillingDocument.useCase.impl";
import { createGetBillingDocumentByRemoteIdUseCase } from "@/feature/billing/useCase/getBillingDocumentByRemoteId.useCase.impl";
import { createSaveBillingDocumentUseCase } from "@/feature/billing/useCase/saveBillingDocument.useCase.impl";
import { createLocalContactDatasource } from "@/feature/contacts/data/dataSource/local.contact.datasource.impl";
import { createContactRepository } from "@/feature/contacts/data/repository/contact.repository.impl";
import { createGetContactsUseCase } from "@/feature/contacts/useCase/getContacts.useCase.impl";
import { createGetOrCreateBusinessContactUseCase } from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase.impl";
import { createGetOrCreateContactUseCase } from "@/feature/contacts/useCase/getOrCreateContact.useCase.impl";
import { createLocalInventoryDatasource } from "@/feature/inventory/data/dataSource/local.inventory.datasource.impl";
import { createInventoryRepository } from "@/feature/inventory/data/repository/inventory.repository.impl";
import { createCreateOpeningStockForProductUseCase } from "@/feature/inventory/useCase/createOpeningStockForProduct.useCase.impl";
import { createDeleteInventoryMovementsBySourceUseCase } from "@/feature/inventory/useCase/deleteInventoryMovementsBySource.useCase.impl";
import { createGetInventoryMovementsBySourceUseCase } from "@/feature/inventory/useCase/getInventoryMovementsBySource.useCase.impl";
import { createSaveInventoryMovementUseCase } from "@/feature/inventory/useCase/saveInventoryMovement.useCase.impl";
import { createSaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase.impl";
import { createLocalLedgerDatasource } from "@/feature/ledger/data/dataSource/local.ledger.datasource.impl";
import { createLedgerRepository } from "@/feature/ledger/data/repository/ledger.repository.impl";
import { createAddLedgerEntryUseCase } from "@/feature/ledger/useCase/addLedgerEntry.useCase.impl";
import { createDeleteLedgerEntryUseCase } from "@/feature/ledger/useCase/deleteLedgerEntry.useCase.impl";
import { createGetLedgerEntryByRemoteIdUseCase } from "@/feature/ledger/useCase/getLedgerEntryByRemoteId.useCase.impl";
import { createLocalProductDatasource } from "@/feature/products/data/dataSource/local.product.datasource.impl";
import { createProductRepository } from "@/feature/products/data/repository/product.repository.impl";
import { createCreateProductWithOpeningStockUseCase } from "@/feature/products/useCase/createProductWithOpeningStock.useCase.impl";
import { createDeleteProductUseCase } from "@/feature/products/useCase/deleteProduct.useCase.impl";
import { createSaveProductUseCase } from "@/feature/products/useCase/saveProduct.useCase.impl";
import { createMoneyPostingRuntime } from "@/feature/transactions/factory/createMoneyPostingRuntime.factory";
import appDatabase from "@/shared/database/appDatabase";
import { TaxModeValue } from "@/shared/types/regionalFinance.types";
import React from "react";
import { createPosReceiptDocumentAdapter } from "../adapter/posReceiptDocument.adapter.impl";
import { createLocalPosDatasource } from "../data/dataSource/local.pos.datasource.impl";
import { createPosRepository } from "../data/repository/pos.repository.impl";
import { PosScreen } from "../ui/PosScreen";
import { createAddProductToCartUseCase } from "../useCase/addProductToCart.useCase.impl";
import { createApplyDiscountUseCase } from "../useCase/applyDiscount.useCase.impl";
import { createApplySurchargeUseCase } from "../useCase/applySurcharge.useCase.impl";
import { createChangeCartLineQuantityUseCase } from "../useCase/changeCartLineQuantity.useCase.impl";
import { createClearCartUseCase } from "../useCase/clearCart.useCase.impl";
import { createClearPosSessionUseCase } from "../useCase/clearPosSession.useCase.impl";
import { createCreatePosSaleDraftUseCase } from "../useCase/createPosSaleDraft.useCase.impl";
import { createGetPosBootstrapUseCase } from "../useCase/getPosBootstrap.useCase.impl";
import { createGetPosSaleHistoryUseCase } from "../useCase/getPosSaleHistory.useCase.impl";
import {
  createGetPosSalesUseCase,
} from "../useCase/getPosSales.useCase.impl";
import { createLoadPosSessionUseCase } from "../useCase/loadPosSession.useCase.impl";
import { createPrintPosReceiptUseCase } from "../useCase/printPosReceipt.useCase.impl";
import { createSavePosSessionUseCase } from "../useCase/savePosSession.useCase.impl";
import { createSearchPosProductsUseCase } from "../useCase/searchPosProducts.useCase.impl";
import { createSharePosReceiptUseCase } from "../useCase/sharePosReceipt.useCase.impl";
import { createUpdatePosSaleWorkflowStateUseCase } from "../useCase/updatePosSaleWorkflowState.useCase.impl";
import { usePosSaleHistoryViewModel } from "../viewModel/posSaleHistory.viewModel.impl";
import { usePosScreenCoordinatorViewModel } from "../viewModel/posScreenCoordinator.viewModel.impl";
import { createLocalPosSaleDatasource } from "../data/dataSource/local.posSale.datasource.impl";
import { createPosSaleRepository } from "../data/repository/posSale.repository.impl";
import { createPosCheckoutRepository } from "../workflow/posCheckout/repository/posCheckout.repository.impl";
import { createCommitPosCheckoutInventoryUseCase } from "../workflow/posCheckout/useCase/commitPosCheckoutInventory.useCase.impl";
import { createRunPosCheckoutUseCase } from "../workflow/posCheckout/useCase/runPosCheckout.useCase.impl";
import { createReconcilePosSaleUseCase } from "../workflow/posRecovery/useCase/reconcilePosSale.useCase.impl";
import { createRetryPosSalePostingUseCase } from "../workflow/posRecovery/useCase/retryPosSalePosting.useCase.impl";
import { createResolvePosAbnormalSaleUseCase } from "../workflow/posRecovery/useCase/resolvePosAbnormalSale.useCase.impl";

type GetPosScreenFactoryProps = {
  activeBusinessAccountRemoteId: string | null;
  activeOwnerUserRemoteId: string | null;
  activeSettlementAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  activeAccountDefaultTaxRatePercent: number | null;
  activeAccountDefaultTaxMode: TaxModeValue | null;
};

export function GetPosScreenFactory({
  activeBusinessAccountRemoteId,
  activeOwnerUserRemoteId,
  activeSettlementAccountRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  activeAccountDefaultTaxRatePercent,
  activeAccountDefaultTaxMode,
}: GetPosScreenFactoryProps) {
  const datasource = React.useMemo(
    () => createLocalPosDatasource({ database: appDatabase }),
    [],
  );
  const repository = React.useMemo(
    () => createPosRepository(datasource),
    [datasource],
  );

  const getPosBootstrapUseCase = React.useMemo(
    () => createGetPosBootstrapUseCase(repository),
    [repository],
  );
  const searchPosProductsUseCase = React.useMemo(
    () => createSearchPosProductsUseCase(repository),
    [repository],
  );
  const addProductToCartUseCase = React.useMemo(
    () => createAddProductToCartUseCase(repository),
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
  const savePosSessionUseCase = React.useMemo(
    () => createSavePosSessionUseCase(repository),
    [repository],
  );
  const loadPosSessionUseCase = React.useMemo(
    () => createLoadPosSessionUseCase(repository),
    [repository],
  );
  const clearPosSessionUseCase = React.useMemo(
    () => createClearPosSessionUseCase(repository),
    [repository],
  );
  const billingDatasource = React.useMemo(
    () => createLocalBillingDatasource(appDatabase),
    [],
  );
  const auditDatasource = React.useMemo(
    () => createLocalAuditDatasource(appDatabase),
    [],
  );
  const auditRepository = React.useMemo(
    () => createAuditRepository(auditDatasource),
    [auditDatasource],
  );
  const recordAuditEventUseCase = React.useMemo(
    () => createRecordAuditEventUseCase(auditRepository),
    [auditRepository],
  );
  const billingRepository = React.useMemo(
    () => createBillingRepository(billingDatasource),
    [billingDatasource],
  );
  const getBillingDocumentByRemoteIdUseCase = React.useMemo(
    () => createGetBillingDocumentByRemoteIdUseCase(billingRepository),
    [billingRepository],
  );
  const saveBillingDocumentUseCase = React.useMemo(
    () => createSaveBillingDocumentUseCase(billingRepository),
    [billingRepository],
  );
  const deleteBillingDocumentUseCase = React.useMemo(
    () => createDeleteBillingDocumentUseCase(billingRepository),
    [billingRepository],
  );
  const posSaleDatasource = React.useMemo(
    () => createLocalPosSaleDatasource({ database: appDatabase }),
    [],
  );
  const posSaleRepository = React.useMemo(
    () => createPosSaleRepository(posSaleDatasource),
    [posSaleDatasource],
  );
  const createPosSaleDraftUseCase = React.useMemo(
    () => createCreatePosSaleDraftUseCase(posSaleRepository),
    [posSaleRepository],
  );
  const updatePosSaleWorkflowStateUseCase = React.useMemo(
    () => createUpdatePosSaleWorkflowStateUseCase(posSaleRepository),
    [posSaleRepository],
  );
  const posCheckoutRepository = React.useMemo(
    () => createPosCheckoutRepository({ posSaleRepository }),
    [posSaleRepository],
  );
  const getPosSalesUseCase = React.useMemo(
    () => createGetPosSalesUseCase(posSaleRepository),
    [posSaleRepository],
  );
  const ledgerDatasource = React.useMemo(
    () => createLocalLedgerDatasource(appDatabase),
    [],
  );
  const ledgerRepository = React.useMemo(
    () => createLedgerRepository(ledgerDatasource),
    [ledgerDatasource],
  );
  const addLedgerEntryUseCase = React.useMemo(
    () => createAddLedgerEntryUseCase(ledgerRepository),
    [ledgerRepository],
  );
  const getLedgerEntryByRemoteIdUseCase = React.useMemo(
    () => createGetLedgerEntryByRemoteIdUseCase(ledgerRepository),
    [ledgerRepository],
  );
  const deleteLedgerEntryUseCase = React.useMemo(
    () => createDeleteLedgerEntryUseCase(ledgerRepository),
    [ledgerRepository],
  );
  const moneyPostingRuntime = React.useMemo(
    () => createMoneyPostingRuntime(appDatabase),
    [],
  );
  const { postBusinessTransactionUseCase, deleteBusinessTransactionUseCase } =
    moneyPostingRuntime;
  const contactDatasource = React.useMemo(
    () => createLocalContactDatasource(appDatabase),
    [],
  );
  const contactRepository = React.useMemo(
    () => createContactRepository(contactDatasource),
    [contactDatasource],
  );
  const getOrCreateContactUseCase = React.useMemo(
    () => createGetOrCreateContactUseCase(contactRepository),
    [contactRepository],
  );
  const getContactsUseCase = React.useMemo(
    () => createGetContactsUseCase(contactRepository),
    [contactRepository],
  );
  const getOrCreateBusinessContactUseCase = React.useMemo(
    () => createGetOrCreateBusinessContactUseCase(getOrCreateContactUseCase),
    [getOrCreateContactUseCase],
  );
  const receiptDocumentAdapter = React.useMemo(
    () => createPosReceiptDocumentAdapter(),
    [],
  );
  const printPosReceiptUseCase = React.useMemo(
    () =>
      createPrintPosReceiptUseCase({
        receiptDocumentAdapter,
      }),
    [receiptDocumentAdapter],
  );

  const sharePosReceiptUseCase = React.useMemo(
    () =>
      createSharePosReceiptUseCase({
        receiptDocumentAdapter,
      }),
    [receiptDocumentAdapter],
  );

  const productDatasource = React.useMemo(
    () => createLocalProductDatasource(appDatabase),
    [],
  );
  const productRepository = React.useMemo(
    () => createProductRepository(productDatasource),
    [productDatasource],
  );
  const inventoryDatasource = React.useMemo(
    () => createLocalInventoryDatasource(appDatabase),
    [],
  );
  const inventoryRepository = React.useMemo(
    () => createInventoryRepository(inventoryDatasource),
    [inventoryDatasource],
  );
  const deleteInventoryMovementsBySourceUseCase = React.useMemo(
    () =>
      createDeleteInventoryMovementsBySourceUseCase({
        inventoryRepository,
      }),
    [inventoryRepository],
  );
  const getInventoryMovementsBySourceUseCase = React.useMemo(
    () => createGetInventoryMovementsBySourceUseCase(inventoryRepository),
    [inventoryRepository],
  );
  const saveInventoryMovementsUseCase = React.useMemo(
    () =>
      createSaveInventoryMovementsUseCase({
        inventoryRepository,
        productRepository,
      }),
    [inventoryRepository, productRepository],
  );
  const commitPosCheckoutInventoryUseCase = React.useMemo(
    () =>
      createCommitPosCheckoutInventoryUseCase({
        saveInventoryMovementsUseCase,
        getInventoryMovementsBySourceUseCase,
      }),
    [getInventoryMovementsBySourceUseCase, saveInventoryMovementsUseCase],
  );
  const saveInventoryMovementUseCase = React.useMemo(
    () =>
      createSaveInventoryMovementUseCase({
        inventoryRepository,
        productRepository,
      }),
    [inventoryRepository, productRepository],
  );
  const saveProductUseCase = React.useMemo(
    () => createSaveProductUseCase(productRepository),
    [productRepository],
  );
  const deleteProductUseCase = React.useMemo(
    () => createDeleteProductUseCase(productRepository),
    [productRepository],
  );
  const createOpeningStockForProductUseCase = React.useMemo(
    () =>
      createCreateOpeningStockForProductUseCase({
        productRepository,
        saveInventoryMovementUseCase,
      }),
    [productRepository, saveInventoryMovementUseCase],
  );
  const createProductWithOpeningStockUseCase = React.useMemo(
    () =>
      createCreateProductWithOpeningStockUseCase({
        saveProductUseCase,
        deleteProductUseCase,
        createOpeningStockForProductUseCase,
      }),
    [
      createOpeningStockForProductUseCase,
      deleteProductUseCase,
      saveProductUseCase,
    ],
  );

  const getPosSaleHistoryUseCase = React.useMemo(
    () =>
      createGetPosSaleHistoryUseCase({
        getPosSalesUseCase,
      }),
    [getPosSalesUseCase],
  );

  const reconcilePosSaleUseCase = React.useMemo(
    () =>
      createReconcilePosSaleUseCase({
        getInventoryMovementsBySourceUseCase,
        getBillingDocumentByRemoteIdUseCase,
        getLedgerEntryByRemoteIdUseCase,
      }),
    [
      getInventoryMovementsBySourceUseCase,
      getBillingDocumentByRemoteIdUseCase,
      getLedgerEntryByRemoteIdUseCase,
    ],
  );

  const resolvePosAbnormalSaleUseCase = React.useMemo(
    () =>
      createResolvePosAbnormalSaleUseCase({
        deleteInventoryMovementsBySourceUseCase,
        deleteBillingDocumentUseCase,
        deleteLedgerEntryUseCase,
        deleteBusinessTransactionUseCase,
        updatePosSaleWorkflowStateUseCase,
        recordAuditEventUseCase,
      }),
    [
      deleteInventoryMovementsBySourceUseCase,
      deleteBillingDocumentUseCase,
      deleteBusinessTransactionUseCase,
      deleteLedgerEntryUseCase,
      recordAuditEventUseCase,
      updatePosSaleWorkflowStateUseCase,
    ],
  );

  const moneyAccountDatasource = React.useMemo(
    () => createLocalMoneyAccountDatasource(appDatabase),
    [],
  );
  const moneyAccountRepository = React.useMemo(
    () => createMoneyAccountRepository(moneyAccountDatasource),
    [moneyAccountDatasource],
  );
  const getMoneyAccountsUseCase = React.useMemo(
    () => createGetMoneyAccountsUseCase(moneyAccountRepository),
    [moneyAccountRepository],
  );
  const runPosCheckoutUseCase = React.useMemo(
    () =>
      createRunPosCheckoutUseCase({
        posCheckoutRepository,
        createPosSaleDraftUseCase,
        updatePosSaleWorkflowStateUseCase,
        saveBillingDocumentUseCase,
        deleteBillingDocumentUseCase,
        postBusinessTransactionUseCase,
      deleteBusinessTransactionUseCase,
      addLedgerEntryUseCase,
      deleteLedgerEntryUseCase,
      commitPosCheckoutInventoryUseCase,
      recordAuditEventUseCase,
    }),
  [
    addLedgerEntryUseCase,
    commitPosCheckoutInventoryUseCase,
    createPosSaleDraftUseCase,
      deleteBillingDocumentUseCase,
      deleteBusinessTransactionUseCase,
    deleteLedgerEntryUseCase,
    posCheckoutRepository,
    postBusinessTransactionUseCase,
    recordAuditEventUseCase,
    saveBillingDocumentUseCase,
    updatePosSaleWorkflowStateUseCase,
  ],
);

  const retryPosSalePostingUseCase = React.useMemo(
    () =>
      createRetryPosSalePostingUseCase({
        runPosCheckoutUseCase,
        recordAuditEventUseCase,
      }),
    [recordAuditEventUseCase, runPosCheckoutUseCase],
  );

  const saleHistoryViewModel = usePosSaleHistoryViewModel({
    accountRemoteId: activeBusinessAccountRemoteId ?? "",
    currencyCode: activeAccountCurrencyCode ?? "NPR",
    countryCode: activeAccountCountryCode,
    getPosSaleHistoryUseCase,
    printPosReceiptUseCase,
    sharePosReceiptUseCase,
    reconcilePosSaleUseCase,
    resolvePosAbnormalSaleUseCase,
    retryPosSalePostingUseCase,
  });

  const viewModel = usePosScreenCoordinatorViewModel({
    activeBusinessAccountRemoteId,
    activeOwnerUserRemoteId,
    activeSettlementAccountRemoteId,
    activeAccountCurrencyCode,
    activeAccountCountryCode,
    activeAccountDefaultTaxRatePercent,
    activeAccountDefaultTaxMode,
    getPosBootstrapUseCase,
    searchPosProductsUseCase,
    addProductToCartUseCase,
    changeCartLineQuantityUseCase,
    applyDiscountUseCase,
    applySurchargeUseCase,
    getOrCreateBusinessContactUseCase,
    getContactsUseCase,
    clearCartUseCase,
    runPosCheckoutUseCase,
    printPosReceiptUseCase,
    sharePosReceiptUseCase,
    saveProductUseCase,
    createProductWithOpeningStockUseCase,
    savePosSessionUseCase,
    loadPosSessionUseCase,
    clearPosSessionUseCase,
    getMoneyAccountsUseCase,
    saleHistoryViewModel,
  });

  return <PosScreen viewModel={viewModel} />;
}
