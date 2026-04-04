import { CategoryKindValue } from "@/feature/categories/types/category.types";

export const BudgetListFilter = {
  All: "all",
  ThisMonth: "this_month",
  Overspent: "overspent",
} as const;

export type BudgetListFilterValue =
  (typeof BudgetListFilter)[keyof typeof BudgetListFilter];

export type BudgetCategoryOption = {
  remoteId: string;
  label: string;
  kind: CategoryKindValue;
};

export type BudgetSummaryCardState = {
  id: string;
  label: string;
  value: string;
  tone: "neutral" | "alert";
};

export type BudgetListItemState = {
  remoteId: string;
  title: string;
  subtitle: string;
  plannedAmountLabel: string;
  spentAmountLabel: string;
  remainingAmountLabel: string;
  monthLabel: string;
  noteLabel: string | null;
  progressPercent: number;
  isOverspent: boolean;
  statusLabel: "ON TRACK" | "OVER";
};

export type BudgetEditorMode = "create" | "edit";

export type BudgetEditorState = {
  visible: boolean;
  mode: BudgetEditorMode;
  remoteId: string | null;
  budgetMonth: string;
  categoryRemoteId: string;
  plannedAmount: string;
  note: string;
  errorMessage: string | null;
  isSaving: boolean;
};

export type BudgetDetailState = {
  remoteId: string;
  title: string;
  subtitle: string;
  plannedAmountLabel: string;
  spentAmountLabel: string;
  remainingAmountLabel: string;
  statusLabel: string;
  noteLabel: string | null;
};

export interface BudgetViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  monthLabel: string;
  summaryCards: readonly BudgetSummaryCardState[];
  budgetItems: readonly BudgetListItemState[];
  selectedFilter: BudgetListFilterValue;
  searchQuery: string;
  emptyStateMessage: string;
  categoryOptions: readonly BudgetCategoryOption[];
  editorState: BudgetEditorState;
  detailState: BudgetDetailState | null;
  isDetailVisible: boolean;
  canCreate: boolean;
  onRefresh: () => Promise<void>;
  onChangeFilter: (value: BudgetListFilterValue) => void;
  onChangeSearchQuery: (value: string) => void;
  onOpenCreate: () => void;
  onOpenDetail: (remoteId: string) => Promise<void>;
  onOpenEdit: (remoteId: string) => Promise<void>;
  onCloseEditor: () => void;
  onEditorFieldChange: (
    field: "budgetMonth" | "categoryRemoteId" | "plannedAmount" | "note",
    value: string,
  ) => void;
  onSubmit: () => Promise<void>;
  onCloseDetail: () => void;
  onDeleteActiveBudget: () => Promise<void>;
  onEditFromDetail: () => Promise<void>;
}
