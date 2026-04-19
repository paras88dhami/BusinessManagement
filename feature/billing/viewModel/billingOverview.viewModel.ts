import { BillingDocument, BillPhoto } from "@/feature/billing/types/billing.types";
import { GetBillingOverviewUseCase } from "@/feature/billing/useCase/getBillingOverview.useCase";
import { BillingTabValue } from "./billing.viewModel";

export type BillingOverviewSummaryState = {
  totalDocuments: number;
  pendingAmount: number;
  overdueAmount: number;
};

export type UseBillingOverviewViewModelParams = {
  accountRemoteId: string | null;
  getBillingOverviewUseCase: GetBillingOverviewUseCase;
};

export type BillingOverviewViewModelModule = {
  isLoading: boolean;
  errorMessage: string | null;
  summary: BillingOverviewSummaryState;
  documents: readonly BillingDocument[];
  filteredDocuments: readonly BillingDocument[];
  billPhotos: readonly BillPhoto[];
  activeTab: BillingTabValue;
  setActiveTab: (tab: BillingTabValue) => void;
  setErrorMessage: (message: string | null) => void;
  loadOverview: () => Promise<void>;
};
