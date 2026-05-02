// @vitest-environment jsdom

import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { ContactBalanceDirection, ContactType } from "@/feature/contacts/types/contact.types";
import { useContactDetailsViewModel } from "@/feature/contacts/viewModel/contactDetails.viewModel.impl";
import {
    ContactHistoryAmountTone,
    ContactHistoryEventType,
} from "@/shared/readModel/contactHistory/types/contactHistory.readModel.types";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import React, { act, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const buildContact = (overrides: Record<string, unknown> = {}) => ({
  remoteId: "contact-1",
  ownerUserRemoteId: "user-1",
  accountRemoteId: "business-1",
  accountType: AccountType.Business,
  contactType: ContactType.Customer,
  fullName: "Kapil Customer",
  phoneNumber: "9800000000",
  emailAddress: "kapil@example.com",
  address: "Kathmandu",
  taxId: "PAN-1",
  openingBalanceAmount: 100,
  openingBalanceDirection: ContactBalanceDirection.Receive,
  notes: "Priority customer",
  isArchived: false,
  createdAt: 1_710_000_000_000,
  updatedAt: 1_710_000_000_000,
  ...overrides,
});

const buildHistoryReadModel = (overrides: Record<string, unknown> = {}) => ({
  accountRemoteId: "business-1",
  contactRemoteId: "contact-1",
  summary: {
    totalMoneyIn: 120,
    totalMoneyOut: 30,
    openBillingDocumentCount: 1,
    ledgerEntryCount: 2,
    orderCount: 1,
    posSaleCount: 1,
    timelineItemCount: 2,
  },
  timelineItems: [
    {
      id: "transaction:txn-1",
      sourceRemoteId: "txn-1",
      eventType: ContactHistoryEventType.Transaction,
      title: "Cash Sale",
      subtitle: "Cash",
      occurredAt: 1_710_000_000_000,
      amount: 120,
      amountTone: ContactHistoryAmountTone.Positive,
      statusLabel: "posted",
    },
    {
      id: "billing:bill-1",
      sourceRemoteId: "bill-1",
      eventType: ContactHistoryEventType.BillingDocument,
      title: "INV-001",
      subtitle: "Kapil Customer",
      occurredAt: 1_709_000_000_000,
      amount: 30,
      amountTone: ContactHistoryAmountTone.Negative,
      statusLabel: "partially_paid",
    },
  ],
  ...overrides,
});

type HarnessProps = {
  accountRemoteId: string | null;
  currencyCode: string | null;
  countryCode: string | null;
  getContactByRemoteIdUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  getContactHistoryReadModelUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  onUpdate: (value: ReturnType<typeof useContactDetailsViewModel>) => void;
};

function ContactDetailsViewModelHarness(props: HarnessProps) {
  const viewModel = useContactDetailsViewModel({
    accountRemoteId: props.accountRemoteId,
    currencyCode: props.currencyCode,
    countryCode: props.countryCode,
    getContactByRemoteIdUseCase: props.getContactByRemoteIdUseCase as never,
    getContactHistoryReadModelUseCase:
      props.getContactHistoryReadModelUseCase as never,
  });

  useEffect(() => {
    props.onUpdate(viewModel);
  }, [props, viewModel]);

  return null;
}

describe("contactDetails.viewModel", () => {
  let container: HTMLDivElement;
  let root: Root;
  let latestViewModel: ReturnType<typeof useContactDetailsViewModel> | null = null;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    latestViewModel = null;
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  const renderHarness = async (overrides: Partial<HarnessProps> = {}) => {
    const props: HarnessProps = {
      accountRemoteId: "business-1",
      currencyCode: "NPR",
      countryCode: "NP",
      getContactByRemoteIdUseCase: {
        execute: vi.fn(async () => ({
          success: true as const,
          value: buildContact(),
        })),
      },
      getContactHistoryReadModelUseCase: {
        execute: vi.fn(async () => ({
          success: true as const,
          value: buildHistoryReadModel(),
        })),
      },
      onUpdate: (value) => {
        latestViewModel = value;
      },
      ...overrides,
    };

    await act(async () => {
      root.render(<ContactDetailsViewModelHarness {...props} />);
      await Promise.resolve();
    });

    return props;
  };

  it("loads contact details and history successfully", async () => {
    const props = await renderHarness();

    await act(async () => {
      await latestViewModel?.onOpenDetails(buildContact());
      await Promise.resolve();
    });

    expect(props.getContactByRemoteIdUseCase.execute).toHaveBeenCalledWith({
      accountRemoteId: "business-1",
      remoteId: "contact-1",
    });
    expect(props.getContactHistoryReadModelUseCase.execute).toHaveBeenCalledWith({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
      timelineLimit: 50,
    });

    expect(latestViewModel?.isVisible).toBe(true);
    expect(latestViewModel?.errorMessage).toBe(null);
    expect(latestViewModel?.selectedContact?.fullName).toBe("Kapil Customer");
    expect(latestViewModel?.summaryCards.map((card) => card.label)).toEqual([
      "Money In",
      "Money Out",
      "Open Docs",
      "Ledger",
      "Orders",
      "POS Sales",
    ]);
    expect(latestViewModel?.summaryCards[0]?.value).toBe(
      formatCurrencyAmount({
        amount: 120,
        currencyCode: "NPR",
        countryCode: "NP",
        maximumFractionDigits: 0,
      }),
    );
    expect(latestViewModel?.timelineItems).toHaveLength(2);
    expect(latestViewModel?.timelineItems[0]?.eventLabel).toBe("Transaction");
    expect(latestViewModel?.timelineItems[1]?.statusLabel).toBe("Partially Paid");
  });

  it("surfaces history load failures safely", async () => {
    await renderHarness({
      getContactHistoryReadModelUseCase: {
        execute: vi.fn(async () => ({
          success: false as const,
          error: {
            type: "UNKNOWN_ERROR",
            message: "Unable to load linked history",
          },
        })),
      },
    });

    await act(async () => {
      await latestViewModel?.onOpenDetails(buildContact());
      await Promise.resolve();
    });

    expect(latestViewModel?.isVisible).toBe(true);
    expect(latestViewModel?.isLoading).toBe(false);
    expect(latestViewModel?.errorMessage).toContain("Unable to load linked history");
    expect(latestViewModel?.summaryCards).toHaveLength(0);
    expect(latestViewModel?.timelineItems).toHaveLength(0);
  });

  it("shows empty history state and resets cleanly on close", async () => {
    await renderHarness({
      getContactHistoryReadModelUseCase: {
        execute: vi.fn(async () => ({
          success: true as const,
          value: buildHistoryReadModel({
            summary: {
              totalMoneyIn: 0,
              totalMoneyOut: 0,
              openBillingDocumentCount: 0,
              ledgerEntryCount: 0,
              orderCount: 0,
              posSaleCount: 0,
              timelineItemCount: 0,
            },
            timelineItems: [],
          }),
        })),
      },
    });

    await act(async () => {
      await latestViewModel?.onOpenDetails(buildContact());
      await Promise.resolve();
    });

    expect(latestViewModel?.emptyStateMessage).toContain(
      "No linked business activity yet",
    );
    expect(latestViewModel?.timelineItems).toHaveLength(0);

    await act(async () => {
      latestViewModel?.onCloseDetails();
      await Promise.resolve();
    });

    expect(latestViewModel?.isVisible).toBe(false);
    expect(latestViewModel?.selectedContact).toBe(null);
    expect(latestViewModel?.summaryCards).toHaveLength(0);
    expect(latestViewModel?.timelineItems).toHaveLength(0);
    expect(latestViewModel?.errorMessage).toBe(null);
  });
});

