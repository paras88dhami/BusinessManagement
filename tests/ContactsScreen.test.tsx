import type { ReactElement, ReactNode } from "react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", async () => {
  const ReactModule = await import("react");

  const createHost =
    (tag: string) =>
    ({ children, ...props }: Record<string, unknown>) =>
      ReactModule.createElement(tag, props, children as React.ReactNode) as ReactElement;

  return {
    ActivityIndicator: createHost("mock-activity-indicator"),
    Pressable: createHost("mock-pressable"),
    StyleSheet: {
      create: <T,>(styles: T) => styles,
    },
    Text: createHost("mock-text"),
    View: createHost("mock-view"),
  };
});

vi.mock("@/shared/components/reusable/Buttons/AppButton", async () => {
  const ReactModule = await import("react");
  return {
    AppButton: ({ children, ...props }: Record<string, unknown>) =>
      ReactModule.createElement("mock-app-button", props, children as React.ReactNode) as ReactElement,
  };
});

vi.mock("@/shared/components/reusable/Cards/Card", async () => {
  const ReactModule = await import("react");
  return {
    Card: ({ children, ...props }: Record<string, unknown>) =>
      ReactModule.createElement("mock-card", props, children as React.ReactNode) as ReactElement,
  };
});

vi.mock("@/shared/components/reusable/Cards/StatCard", async () => {
  const ReactModule = await import("react");
  return {
    StatCard: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-stat-card", props) as ReactElement,
  };
});

vi.mock("@/shared/components/reusable/Form/FilterChipGroup", async () => {
  const ReactModule = await import("react");
  return {
    FilterChipGroup: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-filter-chip-group", props) as ReactElement,
  };
});

vi.mock("@/shared/components/reusable/Form/SearchInputRow", async () => {
  const ReactModule = await import("react");
  return {
    SearchInputRow: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-search-input-row", props) as ReactElement,
  };
});

vi.mock("@/shared/components/reusable/Modals/ConfirmDeleteModal", async () => {
  const ReactModule = await import("react");
  return {
    ConfirmDeleteModal: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-confirm-delete-modal", props) as ReactElement,
  };
});

vi.mock("@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter", async () => {
  const ReactModule = await import("react");
  return {
    BottomTabAwareFooter: ({
      children,
      ...props
    }: Record<string, unknown>) =>
      ReactModule.createElement("mock-bottom-tab-aware-footer", props, children as React.ReactNode) as ReactElement,
  };
});

vi.mock("@/feature/dashboard/shared/ui/DashboardTabScaffold", async () => {
  const ReactModule = await import("react");
  return {
    DashboardTabScaffold: ({
      children,
      footer,
      ...props
    }: Record<string, unknown>) =>
      ReactModule.createElement(
        "mock-dashboard-tab-scaffold",
        props,
        children as React.ReactNode,
        footer as React.ReactNode,
      ) as ReactElement,
  };
});

vi.mock("@/feature/contacts/ui/components/ContactEditorModal", async () => {
  const ReactModule = await import("react");
  return {
    ContactEditorModal: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-contact-editor-modal", props) as ReactElement,
  };
});

vi.mock("@/feature/contacts/ui/components/ContactDetailsModal", async () => {
  const ReactModule = await import("react");
  return {
    ContactDetailsModal: (props: Record<string, unknown>) =>
      ReactModule.createElement("mock-contact-details-modal", props) as ReactElement,
  };
});

vi.mock("lucide-react-native", async () => {
  const ReactModule = await import("react");
  return {
    Plus: () => ReactModule.createElement("mock-plus-icon") as ReactElement,
  };
});

import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import {
    ContactBalanceDirection,
    ContactType,
} from "@/feature/contacts/types/contact.types";
import { ContactsScreen } from "@/feature/contacts/ui/ContactsScreen";

const buildViewModel = () => {
  const contact = {
    remoteId: "contact-1",
    ownerUserRemoteId: "user-1",
    accountRemoteId: "business-1",
    accountType: AccountType.Business,
    contactType: ContactType.Customer,
    fullName: "Kapil Customer",
    phoneNumber: "9800000000",
    emailAddress: "kapil@example.com",
    address: "Kathmandu",
    taxId: null,
    openingBalanceAmount: 100,
    openingBalanceDirection: ContactBalanceDirection.Receive,
    notes: null,
    isArchived: false,
    createdAt: 1_710_000_000_000,
    updatedAt: 1_710_000_000_000,
  };

  return {
    isLoading: false,
    errorMessage: null,
    contacts: [contact],
    filteredContacts: [contact],
    currencyPrefix: "Rs",
    openingBalancePlaceholder: "Rs 0",
    selectedFilter: "all",
    searchQuery: "",
    summary: {
      totalCount: 1,
      receiveAmountLabel: "Rs 100",
      payAmountLabel: "Rs 0",
    },
    canManage: true,
    isEditorVisible: false,
    editorMode: "edit" as const,
    editorTitle: "Edit Contact",
    form: {
      remoteId: "contact-1",
      fullName: "Kapil Customer",
      contactType: ContactType.Customer,
      phoneNumber: "9800000000",
      emailAddress: "kapil@example.com",
      address: "Kathmandu",
      taxId: "",
      openingBalance: "100",
      notes: "",
      fieldErrors: {},
    },
    isDeleteModalVisible: false,
    pendingDeleteContactName: null,
    deleteErrorMessage: null,
    isDeleting: false,
    details: {
      isVisible: true,
      isLoading: false,
      errorMessage: null,
      emptyStateMessage: null,
      selectedContact: contact,
      summaryCards: [],
      timelineItems: [],
      onOpenDetails: vi.fn(async () => undefined),
      onCloseDetails: vi.fn(),
    },
    filterOptions: [{ value: "all", label: "All" }],
    typeOptions: [{ value: ContactType.Customer, label: "Customer" }],
    onRefresh: vi.fn(async () => undefined),
    onSearchChange: vi.fn(),
    onFilterChange: vi.fn(),
    onOpenCreate: vi.fn(),
    onOpenEdit: vi.fn(),
    onOpenEditFromDetails: vi.fn(),
    onCloseEditor: vi.fn(),
    onFormChange: vi.fn(),
    onSubmit: vi.fn(async () => undefined),
    onRequestDeleteFromEditor: vi.fn(),
    onCloseDeleteModal: vi.fn(),
    onConfirmDelete: vi.fn(async () => undefined),
    getContactAmountTone: vi.fn(() => ContactBalanceDirection.Receive),
  };
};

const materializeNode = (node: ReactNode): ReactNode => {
  if (Array.isArray(node)) {
    return node.map(materializeNode);
  }

  if (!React.isValidElement(node)) {
    return node;
  }

  if (node.type === React.Fragment) {
    return materializeNode((node.props as { children: ReactNode }).children);
  }

  if (typeof node.type === "function") {
    return materializeNode(
      (node.type as (props: Record<string, unknown>) => ReactNode)(node.props as Record<string, unknown>),
    );
  }

  const children = React.Children.toArray((node.props as { children: ReactNode }).children).map(
    materializeNode,
  );

  return React.cloneElement(node, undefined, ...children);
};

const collectElements = (
  node: ReactNode,
  predicate: (element: ReactElement) => boolean,
  bucket: ReactElement[] = [],
): ReactElement[] => {
  if (Array.isArray(node)) {
    node.forEach((item) => collectElements(item, predicate, bucket));
    return bucket;
  }

  if (!React.isValidElement(node)) {
    return bucket;
  }

  if (predicate(node)) {
    bucket.push(node);
  }

  React.Children.toArray((node.props as { children: ReactNode }).children).forEach((child) => {
    collectElements(child, predicate, bucket);
  });

  return bucket;
};

describe("ContactsScreen", () => {
  it("opens contact details when a contact row is pressed", async () => {
    const viewModel = buildViewModel();

    const tree = materializeNode(<ContactsScreen viewModel={viewModel as never} />);
    const pressables = collectElements(
      tree,
      (element) => element.type === "mock-pressable",
    );

    expect(pressables.length).toBeGreaterThan(0);

    await (pressables[0].props as { onPress: () => Promise<void> }).onPress();

    expect(viewModel.details.onOpenDetails).toHaveBeenCalledWith(
      viewModel.filteredContacts[0],
    );
  });

  it("passes the detail modal props through correctly", () => {
    const viewModel = buildViewModel();

    const tree = materializeNode(<ContactsScreen viewModel={viewModel as never} />);
    const detailModals = collectElements(
      tree,
      (element) => element.type === "mock-contact-details-modal",
    );

    expect(detailModals).toHaveLength(1);
    const detailProps = detailModals[0].props as {
      visible: boolean;
      selectedContact: { fullName: string };
      currencyPrefix: string;
      onEdit: typeof viewModel.onOpenEditFromDetails;
      onClose: typeof viewModel.details.onCloseDetails;
    };
    expect(detailProps.visible).toBe(true);
    expect(detailProps.selectedContact.fullName).toBe("Kapil Customer");
    expect(detailProps.currencyPrefix).toBe("Rs");
    expect(detailProps.onEdit).toBe(viewModel.onOpenEditFromDetails);
    expect(detailProps.onClose).toBe(viewModel.details.onCloseDetails);
  });

  it("passes the editor modal props through correctly", () => {
    const viewModel = buildViewModel();

    const tree = materializeNode(<ContactsScreen viewModel={viewModel as never} />);
    const editorModals = collectElements(
      tree,
      (element) => element.type === "mock-contact-editor-modal",
    );

    expect(editorModals).toHaveLength(1);
    const editorProps = editorModals[0].props as {
      visible: boolean;
      title: string;
      canDelete: boolean;
      onDelete: typeof viewModel.onRequestDeleteFromEditor;
    };
    expect(editorProps.visible).toBe(false);
    expect(editorProps.title).toBe("Edit Contact");
    expect(editorProps.canDelete).toBe(true);
    expect(editorProps.onDelete).toBe(
      viewModel.onRequestDeleteFromEditor,
    );
  });
});
