import { OrderStatus } from "@/feature/orders/types/order.types";
import { createCreateOrderUseCase } from "@/feature/orders/useCase/createOrder.useCase.impl";
import { createDeleteOrderUseCase } from "@/feature/orders/useCase/deleteOrder.useCase.impl";
import { createUpdateOrderUseCase } from "@/feature/orders/useCase/updateOrder.useCase.impl";
import { ProductKind, ProductStatus } from "@/feature/products/types/product.types";
import { describe, expect, it, vi } from "vitest";

const buildOrder = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus],
  overrides: Record<string, unknown> = {},
) => ({
  remoteId: "order-1",
  ownerUserRemoteId: "user-1",
  accountRemoteId: "business-1",
  orderNumber: "ORD-001",
  orderDate: 1_710_000_000_000,
  customerRemoteId: "contact-1",
  deliveryOrPickupDetails: null,
  notes: null,
  tags: null,
  internalRemarks: null,
  status,
  taxRatePercent: 13,
  subtotalAmount: 100,
  taxAmount: 13,
  discountAmount: 0,
  totalAmount: 113,
  linkedBillingDocumentRemoteId: null,
  linkedLedgerDueEntryRemoteId: null,
  items: [
    {
      remoteId: "line-1",
      orderRemoteId: "order-1",
      productRemoteId: "product-1",
      productNameSnapshot: "Rice Bag",
      unitLabelSnapshot: "bag",
      skuOrBarcodeSnapshot: "SKU-1",
      categoryNameSnapshot: "Groceries",
      taxRateLabelSnapshot: "VAT",
      unitPriceSnapshot: 100,
      taxRatePercentSnapshot: 13,
      quantity: 1,
      lineSubtotalAmount: 100,
      lineTaxAmount: 13,
      lineTotalAmount: 113,
      lineOrder: 0,
      createdAt: 1_710_000_000_000,
      updatedAt: 1_710_000_000_000,
    },
  ],
  createdAt: 1_710_000_000_000,
  updatedAt: 1_710_000_000_000,
  ...overrides,
});

const buildRawSavePayload = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus],
  overrides: Record<string, unknown> = {},
) => ({
  remoteId: "order-1",
  ownerUserRemoteId: "user-1",
  accountRemoteId: "business-1",
  orderNumber: "ORD-001",
  orderDate: 1_710_000_000_000,
  customerRemoteId: "contact-1",
  deliveryOrPickupDetails: null,
  notes: null,
  tags: null,
  internalRemarks: null,
  status,
  taxRatePercent: 13,
  linkedBillingDocumentRemoteId: null,
  linkedLedgerDueEntryRemoteId: null,
  items: [
    {
      remoteId: "line-1",
      orderRemoteId: "order-1",
      productRemoteId: "product-1",
      quantity: 1,
      lineOrder: 0,
    },
  ],
  ...overrides,
});

const buildProduct = (overrides: Record<string, unknown> = {}) => ({
  remoteId: "product-1",
  accountRemoteId: "business-1",
  name: "Rice Bag",
  kind: ProductKind.Item,
  categoryName: "Groceries",
  salePrice: 100,
  costPrice: 80,
  stockQuantity: 10,
  unitLabel: "bag",
  skuOrBarcode: "SKU-1",
  taxRateLabel: "VAT",
  description: null,
  imageUrl: null,
  status: ProductStatus.Active,
  createdAt: 1_710_000_000_000,
  updatedAt: 1_710_000_000_000,
  ...overrides,
});

describe("createOrderUseCase rollback safety", () => {
  it("rolls back with the dedicated rollback use case when commercial linking fails", async () => {
    const repository = {
      saveOrder: vi.fn(async () => ({
        success: true as const,
        value: buildOrder(OrderStatus.Confirmed),
      })),
    } as any;

    const getProductsUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [buildProduct()],
      })),
    };

    const rollbackOrderDraftCreateUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    };

    const ensureOrderBillingAndDueLinksUseCase = {
      execute: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "VALIDATION_ERROR",
          message: "Commercial linking failed.",
        },
      })),
    };

    const useCase = createCreateOrderUseCase({
      repository,
      getProductsUseCase: getProductsUseCase as any,
      rollbackOrderDraftCreateUseCase: rollbackOrderDraftCreateUseCase as any,
      ensureOrderBillingAndDueLinksUseCase:
        ensureOrderBillingAndDueLinksUseCase as any,
    });

    const result = await useCase.execute(buildRawSavePayload(OrderStatus.Confirmed) as any);

    expect(result.success).toBe(false);
    expect(rollbackOrderDraftCreateUseCase.execute).toHaveBeenCalledWith("order-1");
  });
});

describe("updateOrderUseCase lifecycle guard", () => {
  it("rejects editing commercially active orders before save", async () => {
    const repository = {
      getOrderByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: buildOrder(OrderStatus.Confirmed),
      })),
      saveOrder: vi.fn(),
    } as any;

    const getProductsUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: [buildProduct()],
      })),
    };

    const getOrderSettlementSnapshotsUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          "order-1": {
            orderRemoteId: "order-1",
            paidAmount: 0,
            refundedAmount: 0,
            balanceDueAmount: 0,
            billingDocumentRemoteId: null,
            dueEntryRemoteId: null,
          },
        },
      })),
    };

    const ensureOrderBillingAndDueLinksUseCase = {
      execute: vi.fn(),
    };

    const useCase = createUpdateOrderUseCase({
      repository,
      getProductsUseCase: getProductsUseCase as any,
      ensureOrderBillingAndDueLinksUseCase:
        ensureOrderBillingAndDueLinksUseCase as any,
      getOrderSettlementSnapshotsUseCase:
        getOrderSettlementSnapshotsUseCase as any,
    });

    const result = await useCase.execute(buildRawSavePayload(OrderStatus.Confirmed) as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Only draft or pending orders");
    }
    expect(repository.saveOrder).not.toHaveBeenCalled();
  });
});

describe("deleteOrderUseCase lifecycle guard", () => {
  it("rejects deleting orders that have settlement activity", async () => {
    const repository = {
      getOrderByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: buildOrder(OrderStatus.Pending),
      })),
      deleteOrderByRemoteId: vi.fn(),
    } as any;

    const getOrderSettlementSnapshotsUseCase = {
      execute: vi.fn(async () => ({
        success: true as const,
        value: {
          "order-1": {
            orderRemoteId: "order-1",
            paidAmount: 0,
            refundedAmount: 0,
            balanceDueAmount: 113,
            billingDocumentRemoteId: "bill-1",
            dueEntryRemoteId: "due-1",
          },
        },
      })),
    };

    const useCase = createDeleteOrderUseCase({
      repository,
      getOrderSettlementSnapshotsUseCase:
        getOrderSettlementSnapshotsUseCase as any,
    });

    const result = await useCase.execute("order-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Only draft or pending orders");
    }
    expect(repository.deleteOrderByRemoteId).not.toHaveBeenCalled();
  });

  it("returns a correctly shaped failure when order lookup fails", async () => {
    const repository = {
      getOrderByRemoteId: vi.fn(async () => ({
        success: false as const,
        error: {
          type: "ORDER_NOT_FOUND",
          message: "The requested order was not found.",
        },
      })),
      deleteOrderByRemoteId: vi.fn(),
    } as any;

    const getOrderSettlementSnapshotsUseCase = {
      execute: vi.fn(),
    };

    const useCase = createDeleteOrderUseCase({
      repository,
      getOrderSettlementSnapshotsUseCase:
        getOrderSettlementSnapshotsUseCase as any,
    });

    const result = await useCase.execute("missing-order");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("not found");
    }
    expect(repository.deleteOrderByRemoteId).not.toHaveBeenCalled();
  });
});
