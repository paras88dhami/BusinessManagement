import {
  BillPhoto,
  BillingDocument,
  BillingDocumentType,
} from "@/feature/billing/types/billing.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BillingTabValue } from "./billing.viewModel";
import {
  BillingOverviewSummaryState,
  BillingOverviewViewModelModule,
  UseBillingOverviewViewModelParams,
} from "./billingOverview.viewModel";

const EMPTY_SUMMARY: BillingOverviewSummaryState = {
  totalDocuments: 0,
  pendingAmount: 0,
  overdueAmount: 0,
};

export const useBillingOverviewViewModel = ({
  accountRemoteId,
  getBillingOverviewUseCase,
}: UseBillingOverviewViewModelParams): BillingOverviewViewModelModule => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<readonly BillingDocument[]>([]);
  const [billPhotos, setBillPhotos] = useState<readonly BillPhoto[]>([]);
  const [summary, setSummary] = useState<BillingOverviewSummaryState>(
    EMPTY_SUMMARY,
  );
  const [activeTab, setActiveTab] = useState<BillingTabValue>("invoices");

  const loadOverview = useCallback(async () => {
    if (!accountRemoteId) {
      setDocuments([]);
      setBillPhotos([]);
      setSummary(EMPTY_SUMMARY);
      setErrorMessage("A business account is required to manage billing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await getBillingOverviewUseCase.execute(accountRemoteId);

    if (!result.success) {
      setErrorMessage(result.error.message);
      setDocuments([]);
      setBillPhotos([]);
      setSummary(EMPTY_SUMMARY);
      setIsLoading(false);
      return;
    }

    setDocuments(result.value.documents);
    setBillPhotos(result.value.billPhotos);
    setSummary(result.value.summary);
    setErrorMessage(null);
    setIsLoading(false);
  }, [accountRemoteId, getBillingOverviewUseCase]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const filteredDocuments = useMemo(() => {
    if (activeTab === "receipts") {
      return documents.filter(
        (item) => item.documentType === BillingDocumentType.Receipt,
      );
    }

    return documents.filter(
      (item) => item.documentType === BillingDocumentType.Invoice,
    );
  }, [activeTab, documents]);

  return {
    isLoading,
    errorMessage,
    summary,
    documents,
    filteredDocuments,
    billPhotos,
    activeTab,
    setActiveTab,
    setErrorMessage,
    loadOverview,
  };
};
