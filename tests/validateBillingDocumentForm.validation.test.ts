import { BillingDocumentStatus } from "@/feature/billing/types/billing.types";
import { validateBillingDocumentForm } from "@/feature/billing/validation/validateBillingDocumentForm";
import { describe, expect, it } from "vitest";

describe("validateBillingDocumentForm", () => {
  it("returns top-level errors for missing customer and no valid items", () => {
    const result = validateBillingDocumentForm({
      status: BillingDocumentStatus.Pending,
      customerName: "",
      taxRatePercent: "13",
      issuedAt: "2026-04-23",
      dueAt: "",
      paidNowAmount: "0",
      settlementAccountRemoteId: "",
      hasSettlementAccountMatch: false,
      items: [
        {
          remoteId: "line-1",
          itemName: "",
          quantity: "",
          unitRate: "",
          fieldErrors: {},
        },
      ],
    });

    expect(result.formFieldErrors).toEqual({
      customerName: "Customer name is required.",
      items: "Add at least one item.",
    });
  });

  it("returns inline row errors for partial invalid line items", () => {
    const result = validateBillingDocumentForm({
      status: BillingDocumentStatus.Pending,
      customerName: "Kapil",
      taxRatePercent: "13",
      issuedAt: "2026-04-23",
      dueAt: "2026-04-30",
      paidNowAmount: "0",
      settlementAccountRemoteId: "",
      hasSettlementAccountMatch: false,
      items: [
        {
          remoteId: "line-1",
          itemName: "Service charge",
          quantity: "0",
          unitRate: "",
          fieldErrors: {},
        },
      ],
    });

    expect(result.items[0].fieldErrors).toEqual({
      quantity: "Quantity must be greater than zero.",
      unitRate: "Rate is required.",
    });
  });

  it("returns paid-now and money-account errors when payment is invalid", () => {
    const result = validateBillingDocumentForm({
      status: BillingDocumentStatus.Pending,
      customerName: "Kapil",
      taxRatePercent: "13",
      issuedAt: "2026-04-23",
      dueAt: "",
      paidNowAmount: "2000",
      settlementAccountRemoteId: "",
      hasSettlementAccountMatch: false,
      items: [
        {
          remoteId: "line-1",
          itemName: "Item A",
          quantity: "1",
          unitRate: "1000",
          fieldErrors: {},
        },
      ],
    });

    expect(result.formFieldErrors).toEqual({
      paidNowAmount: "Paid amount cannot be greater than total amount.",
      settlementAccountRemoteId:
        "Money account is required when paid amount is entered.",
    });
  });

  it("passes one valid row and ignores an extra blank row", () => {
    const result = validateBillingDocumentForm({
      status: BillingDocumentStatus.Pending,
      customerName: "Kapil",
      taxRatePercent: "13",
      issuedAt: "2026-04-23",
      dueAt: "2026-04-30",
      paidNowAmount: "0",
      settlementAccountRemoteId: "",
      hasSettlementAccountMatch: false,
      items: [
        {
          remoteId: "line-1",
          itemName: "Item A",
          quantity: "2",
          unitRate: "100",
          fieldErrors: {},
        },
        {
          remoteId: "line-2",
          itemName: "",
          quantity: "",
          unitRate: "",
          fieldErrors: {},
        },
      ],
    });

    expect(result.formFieldErrors).toEqual({});
    expect(result.items[0].fieldErrors).toEqual({});
    expect(result.items[1].fieldErrors).toEqual({});
    expect(result.normalizedItems).toHaveLength(1);
  });
});
