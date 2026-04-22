import { describe, expect, it } from "vitest";

import { InventoryMovementType } from "@/feature/inventory/types/inventory.types";
import { ProductKind } from "@/feature/products/types/product.types";
import { buildPosCheckoutInventoryMovements } from "@/feature/pos/workflow/posCheckout/utils/buildPosCheckoutInventoryMovements.util";

describe("buildPosCheckoutInventoryMovements", () => {
  it("builds inventory payloads only for item lines", () => {
    const result = buildPosCheckoutInventoryMovements({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "item-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 2,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 200,
        },
        {
          lineId: "line-2",
          productId: "service-1",
          productName: "Delivery Fee",
          categoryLabel: "Service",
          shortCode: "DE",
          kind: ProductKind.Service,
          quantity: 1,
          unitPrice: 50,
          taxRate: 0,
          lineSubtotal: 50,
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        accountRemoteId: "account-1",
        productRemoteId: "item-1",
        type: InventoryMovementType.SaleOut,
        quantity: 2,
        unitRate: 100,
        sourceRemoteId: "sale-1",
        sourceAction: "checkout_sale",
      }),
    );
  });

  it("aggregates multiple item lines for the same product and ignores services", () => {
    const result = buildPosCheckoutInventoryMovements({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "item-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 1,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 100,
        },
        {
          lineId: "line-2",
          productId: "item-1",
          productName: "Rice",
          categoryLabel: "Groceries",
          shortCode: "RI",
          kind: ProductKind.Item,
          quantity: 2,
          unitPrice: 100,
          taxRate: 0,
          lineSubtotal: 200,
        },
        {
          lineId: "line-3",
          productId: "service-1",
          productName: "Setup Fee",
          categoryLabel: "Service",
          shortCode: "SE",
          kind: ProductKind.Service,
          quantity: 1,
          unitPrice: 25,
          taxRate: 0,
          lineSubtotal: 25,
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        productRemoteId: "item-1",
        quantity: 3,
      }),
    );
  });

  it("returns empty payload list for service-only cart", () => {
    const result = buildPosCheckoutInventoryMovements({
      businessAccountRemoteId: "account-1",
      saleRemoteId: "sale-1",
      saleReferenceNumber: "RCPT-001",
      movementAt: 1710000000000,
      cartLines: [
        {
          lineId: "line-1",
          productId: "service-1",
          productName: "Consultation",
          categoryLabel: "Service",
          shortCode: "CO",
          kind: ProductKind.Service,
          quantity: 1,
          unitPrice: 200,
          taxRate: 0,
          lineSubtotal: 200,
        },
      ],
    });

    expect(result).toEqual([]);
  });
});
