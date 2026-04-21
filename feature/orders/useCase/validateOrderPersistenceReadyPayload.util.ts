import { SaveOrderPayload } from "../types/order.types";

type ValidationResult =
  | { success: true }
  | { success: false; error: string };

export const validateOrderPersistenceReadyPayload = (
  payload: SaveOrderPayload,
): ValidationResult => {
  // Validate core required fields
  if (!payload.remoteId || !payload.remoteId.trim()) {
    return { success: false, error: "Order remote id is required." };
  }

  if (!payload.ownerUserRemoteId || !payload.ownerUserRemoteId.trim()) {
    return { success: false, error: "User context is required." };
  }

  if (!payload.accountRemoteId || !payload.accountRemoteId.trim()) {
    return { success: false, error: "Business account context is required." };
  }

  if (!payload.orderNumber || !payload.orderNumber.trim()) {
    return { success: false, error: "Order number is required." };
  }

  // Validate order date
  if (!Number.isFinite(payload.orderDate) || payload.orderDate <= 0) {
    return { success: false, error: "Order date must be a valid timestamp." };
  }

  // Validate items array
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return { success: false, error: "Order must contain at least one item." };
  }

  // Validate order totals
  if (payload.subtotalAmount === null || payload.subtotalAmount === undefined) {
    return { success: false, error: "Order subtotal amount is required." };
  }

  if (!Number.isFinite(payload.subtotalAmount) || payload.subtotalAmount < 0) {
    return { success: false, error: "Order subtotal must be a valid non-negative amount." };
  }

  if (payload.taxAmount === null || payload.taxAmount === undefined) {
    return { success: false, error: "Order tax amount is required." };
  }

  if (!Number.isFinite(payload.taxAmount) || payload.taxAmount < 0) {
    return { success: false, error: "Order tax amount must be a valid non-negative amount." };
  }

  if (payload.totalAmount === null || payload.totalAmount === undefined) {
    return { success: false, error: "Order total amount is required." };
  }

  if (!Number.isFinite(payload.totalAmount) || payload.totalAmount < 0) {
    return { success: false, error: "Order total must be a valid non-negative amount." };
  }

  if (payload.discountAmount !== null && payload.discountAmount !== undefined) {
    if (!Number.isFinite(payload.discountAmount) || payload.discountAmount < 0) {
      return { success: false, error: "Order discount must be a valid non-negative amount." };
    }
  }

  // Validate tax rate
  if (payload.taxRatePercent !== null && payload.taxRatePercent !== undefined) {
    if (!Number.isFinite(payload.taxRatePercent) || payload.taxRatePercent < 0) {
      return { success: false, error: "Order tax rate must be a valid non-negative percentage." };
    }
  }

  // Validate each order item
  for (const item of payload.items) {
    // Validate item core fields
    if (!item.remoteId?.trim()) {
      return { success: false, error: "Order item remote id is required." };
    }

    if (!item.productRemoteId?.trim()) {
      return { success: false, error: "Each order item must have a product reference." };
    }

    // Validate quantity
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return { success: false, error: "Each order item must have a positive quantity." };
    }

    // Validate product name snapshot
    if (!item.productNameSnapshot?.trim()) {
      return { success: false, error: "Each order item must include a product name snapshot." };
    }

    // Validate pricing snapshots
    if (item.unitPriceSnapshot === null || item.unitPriceSnapshot === undefined) {
      return { success: false, error: "Each order item must include a unit price snapshot." };
    }

    if (!Number.isFinite(item.unitPriceSnapshot) || item.unitPriceSnapshot < 0) {
      return { success: false, error: "Each order item must have a valid non-negative unit price." };
    }

    // Validate tax rate snapshot
    if (item.taxRatePercentSnapshot === null || item.taxRatePercentSnapshot === undefined) {
      return { success: false, error: "Each order item must include a tax rate snapshot." };
    }

    if (!Number.isFinite(item.taxRatePercentSnapshot) || item.taxRatePercentSnapshot < 0) {
      return { success: false, error: "Each order item must have a valid non-negative tax rate." };
    }

    // Validate line totals
    if (item.lineSubtotalAmount === null || item.lineSubtotalAmount === undefined) {
      return { success: false, error: "Each order item must include a line subtotal amount." };
    }

    if (!Number.isFinite(item.lineSubtotalAmount) || item.lineSubtotalAmount < 0) {
      return { success: false, error: "Each order item must have a valid non-negative line subtotal." };
    }

    if (item.lineTaxAmount === null || item.lineTaxAmount === undefined) {
      return { success: false, error: "Each order item must include a line tax amount." };
    }

    if (!Number.isFinite(item.lineTaxAmount) || item.lineTaxAmount < 0) {
      return { success: false, error: "Each order item must have a valid non-negative line tax amount." };
    }

    if (item.lineTotalAmount === null || item.lineTotalAmount === undefined) {
      return { success: false, error: "Each order item must include a line total amount." };
    }

    if (!Number.isFinite(item.lineTotalAmount) || item.lineTotalAmount < 0) {
      return { success: false, error: "Each order item must have a valid non-negative line total." };
    }

    // Validate line order
    if (!Number.isFinite(item.lineOrder) || item.lineOrder < 0) {
      return { success: false, error: "Each order item must have a valid line order index." };
    }
  }

  return { success: true };
};
