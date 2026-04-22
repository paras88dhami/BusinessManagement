import { validateOrderEditorForm } from "@/feature/orders/validation/validateOrderEditorForm";
import { OrderStatus } from "@/feature/orders/types/order.types";
import { OrderFormState } from "@/feature/orders/types/order.state.types";
import { describe, expect, it } from "vitest";

const buildForm = (
  overrides: Partial<OrderFormState> = {},
): OrderFormState => ({
  remoteId: null,
  orderNumber: "ORD-001",
  orderDate: "2026-04-22",
  customerRemoteId: "",
  deliveryOrPickupDetails: "",
  notes: "",
  tags: "",
  internalRemarks: "",
  status: OrderStatus.Draft,
  items: [
    {
      remoteId: "line-1",
      productRemoteId: "",
      quantity: "",
      fieldErrors: {},
    },
  ],
  fieldErrors: {},
  ...overrides,
});

describe("validateOrderEditorForm", () => {
  it("returns a section error when no valid item rows exist", () => {
    const result = validateOrderEditorForm(buildForm());

    expect(result.formFieldErrors).toEqual({
      items: "Add at least one order item.",
    });
  });

  it("returns inline row errors for partial invalid rows", () => {
    const result = validateOrderEditorForm(
      buildForm({
        items: [
          {
            remoteId: "line-1",
            productRemoteId: "",
            quantity: "2",
            fieldErrors: {},
          },
        ],
      }),
    );

    expect(result.formFieldErrors).toEqual({
      items: "Add at least one order item.",
    });
    expect(result.items[0].fieldErrors).toEqual({
      productRemoteId: "Select an item.",
    });
  });

  it("allows one valid row and ignores an extra blank row", () => {
    const result = validateOrderEditorForm(
      buildForm({
        items: [
          {
            remoteId: "line-1",
            productRemoteId: "product-1",
            quantity: "2",
            fieldErrors: {},
          },
          {
            remoteId: "line-2",
            productRemoteId: "",
            quantity: "",
            fieldErrors: {},
          },
        ],
      }),
    );

    expect(result.formFieldErrors).toEqual({});
    expect(result.items[0].fieldErrors).toEqual({});
    expect(result.items[1].fieldErrors).toEqual({});
  });
});
