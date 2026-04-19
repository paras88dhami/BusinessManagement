import { GetMoneyAccountsUseCase } from "@/feature/accounts/useCase/getMoneyAccounts.useCase";
import { BillingDocument } from "@/feature/billing/types/billing.types";
import { DeleteBillingDocumentUseCase } from "@/feature/billing/useCase/deleteBillingDocument.useCase";
import { GetBillingOverviewUseCase } from "@/feature/billing/useCase/getBillingOverview.useCase";
import { PayBillingDocumentUseCase } from "@/feature/billing/useCase/payBillingDocument.useCase";
import { SaveBillPhotoUseCase } from "@/feature/billing/useCase/saveBillPhoto.useCase";
import { RunBillingDocumentIssueUseCase } from "@/feature/billing/workflow/billingDocumentIssue/useCase/runBillingDocumentIssue.useCase";
import { TaxModeValue } from "@/shared/types/regionalFinance.types";
import { resolveRegionalFinancePolicy } from "@/shared/utils/finance/regionalFinancePolicy";
import { useCallback, useMemo } from "react";
import { BillingViewModel } from "./billing.viewModel";
import { useBillingAssetsViewModel } from "./billingAssets.viewModel.impl";
import { useBillingEditorViewModel } from "./billingEditor.viewModel.impl";
import { useBillingOverviewViewModel } from "./billingOverview.viewModel.impl";
import { useBillingPaymentViewModel } from "./billingPayment.viewModel.impl";

type Params = {
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
  accountDisplayNameSnapshot: string;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  activeAccountDefaultTaxRatePercent: number | null;
  activeAccountDefaultTaxMode: TaxModeValue | null;
  canManage: boolean;
  getBillingOverviewUseCase: GetBillingOverviewUseCase;
  runBillingDocumentIssueUseCase: RunBillingDocumentIssueUseCase;
  deleteBillingDocumentUseCase: DeleteBillingDocumentUseCase;
  saveBillPhotoUseCase: SaveBillPhotoUseCase;
  getMoneyAccountsUseCase: GetMoneyAccountsUseCase;
  payBillingDocumentUseCase: PayBillingDocumentUseCase;
};

export const useBillingViewModel = ({
  ownerUserRemoteId,
  accountRemoteId,
  accountDisplayNameSnapshot,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  activeAccountDefaultTaxRatePercent,
  activeAccountDefaultTaxMode,
  canManage,
  getBillingOverviewUseCase,
  runBillingDocumentIssueUseCase,
  deleteBillingDocumentUseCase,
  saveBillPhotoUseCase,
  getMoneyAccountsUseCase,
  payBillingDocumentUseCase,
}: Params): BillingViewModel => {
  const regionalFinancePolicy = useMemo(
    () =>
      resolveRegionalFinancePolicy({
        countryCode: activeAccountCountryCode,
        currencyCode: activeAccountCurrencyCode,
        defaultTaxRatePercent: activeAccountDefaultTaxRatePercent,
        defaultTaxMode: activeAccountDefaultTaxMode,
      }),
    [
      activeAccountCountryCode,
      activeAccountCurrencyCode,
      activeAccountDefaultTaxMode,
      activeAccountDefaultTaxRatePercent,
    ],
  );

  const defaultTaxRatePercent = useMemo(
    () => String(regionalFinancePolicy.defaultTaxRatePercent),
    [regionalFinancePolicy.defaultTaxRatePercent],
  );

  const taxRateOptions = useMemo(
    () =>
      regionalFinancePolicy.taxRateOptions.map((ratePercent) =>
        String(ratePercent),
      ),
    [regionalFinancePolicy.taxRateOptions],
  );

  const overviewModule = useBillingOverviewViewModel({
    accountRemoteId,
    getBillingOverviewUseCase,
  });
  const {
    isLoading,
    errorMessage,
    summary,
    filteredDocuments,
    billPhotos,
    activeTab,
    setActiveTab,
    setErrorMessage,
    loadOverview,
  } = overviewModule;

  const paymentModule = useBillingPaymentViewModel({
    accountRemoteId,
    accountDisplayNameSnapshot,
    ownerUserRemoteId,
    getMoneyAccountsUseCase,
    payBillingDocumentUseCase,
    onRefresh: loadOverview,
    setErrorMessage,
  });

  const editorModule = useBillingEditorViewModel({
    accountRemoteId,
    ownerUserRemoteId,
    activeTab,
    canManage,
    defaultTaxRatePercent,
    availableSettlementAccounts: paymentModule.availableSettlementAccounts,
    runBillingDocumentIssueUseCase,
    onRefresh: loadOverview,
    setErrorMessage,
    validateSettlementAccountForPaidNow:
      paymentModule.validateSettlementAccountForPaidNow,
    runPostIssuePayment: paymentModule.runPostIssuePayment,
  });

  const assetsModule = useBillingAssetsViewModel({
    canManage,
    accountRemoteId,
    currencyCode: regionalFinancePolicy.currencyCode,
    countryCode: regionalFinancePolicy.countryCode,
    editorForm: editorModule.form,
    draftTotals: editorModule.draftTotals,
    saveBillPhotoUseCase,
    onRefresh: loadOverview,
    setErrorMessage,
  });

  const onDelete = useCallback(
    async (document: BillingDocument) => {
      const result = await deleteBillingDocumentUseCase.execute(
        document.remoteId,
      );
      if (!result.success) {
        setErrorMessage(result.error.message);
        return;
      }
      await loadOverview();
    },
    [deleteBillingDocumentUseCase, loadOverview, setErrorMessage],
  );

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      activeTab,
      summary,
      documents: filteredDocuments,
      billPhotos,
      isEditorVisible: editorModule.isEditorVisible,
      editorTitle: editorModule.editorTitle,
      form: editorModule.form,
      currencyCode: regionalFinancePolicy.currencyCode,
      countryCode: regionalFinancePolicy.countryCode,
      taxLabel: regionalFinancePolicy.taxLabel,
      taxRateOptions,
      availableSettlementAccounts: paymentModule.availableSettlementAccounts,
      canManage,
      onRefresh: loadOverview,
      onTabChange: setActiveTab,
      onOpenCreate: editorModule.onOpenCreate,
      onOpenEdit: editorModule.onOpenEdit,
      onCloseEditor: editorModule.onCloseEditor,
      onFormChange: editorModule.onFormChange,
      onLineItemChange: editorModule.onLineItemChange,
      onAddLineItem: editorModule.onAddLineItem,
      onRemoveLineItem: editorModule.onRemoveLineItem,
      onSubmit: editorModule.onSubmit,
      onDelete,
      onPrintPreview: assetsModule.onPrintPreview,
      onUploadBillPhoto: assetsModule.onUploadBillPhoto,
      draftTotals: editorModule.draftTotals,
    }),
    [
      assetsModule.onPrintPreview,
      assetsModule.onUploadBillPhoto,
      activeTab,
      billPhotos,
      canManage,
      editorModule.draftTotals,
      editorModule.editorTitle,
      editorModule.form,
      editorModule.isEditorVisible,
      editorModule.onAddLineItem,
      editorModule.onCloseEditor,
      editorModule.onFormChange,
      editorModule.onLineItemChange,
      editorModule.onOpenCreate,
      editorModule.onOpenEdit,
      editorModule.onRemoveLineItem,
      editorModule.onSubmit,
      onDelete,
      errorMessage,
      filteredDocuments,
      isLoading,
      loadOverview,
      paymentModule.availableSettlementAccounts,
      regionalFinancePolicy.countryCode,
      regionalFinancePolicy.currencyCode,
      regionalFinancePolicy.taxLabel,
      setActiveTab,
      summary,
      taxRateOptions,
    ],
  );
};
