import {
  PosBootstrap,
  PosCartLine,
  PosReceipt,
  PosSlot,
} from "../../types/pos.entity.types";
import {
  PosApplyAmountAdjustmentParams,
  PosAssignProductToSlotParams,
  PosChangeQuantityParams,
  PosCompletePaymentParams,
  PosLoadBootstrapParams,
  PosRemoveSlotProductParams,
} from "../../types/pos.dto.types";
import {
  PosBootstrapResult,
  PosCartLinesResult,
  PosError,
  PosOperationResult,
  PosPaymentResult,
  PosTotalsResult,
} from "../../types/pos.error.types";
import { PosDatasource } from "../dataSource/pos.datasource";
import {
  mapPosBootstrapToDomain,
  mapPosCartLinesToDomain,
  mapPosProductToDomain,
  mapPosReceiptToDomain,
  mapPosTotalsToDomain,
} from "./mapper/pos.mapper";
import { PosRepository } from "./pos.repository";

const mapRepositoryError = (error: PosError): PosError => ({ ...error });

export const createPosRepository = (
  datasource: PosDatasource,
): PosRepository => ({
  async loadBootstrap(params: PosLoadBootstrapParams): Promise<PosBootstrapResult> {
    const result = await datasource.loadBootstrap(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosBootstrapToDomain(result.value) };
  },

  async searchProducts(searchTerm: string) {
    const result = await datasource.searchProducts(searchTerm);
    return result.map(mapPosProductToDomain);
  },

  async assignProductToSlot(
    params: PosAssignProductToSlotParams,
  ): Promise<PosCartLinesResult> {
    const result = await datasource.assignProductToSlot(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosCartLinesToDomain(result.value) };
  },

  async removeProductFromSlot(
    params: PosRemoveSlotProductParams,
  ): Promise<PosCartLinesResult> {
    const result = await datasource.removeProductFromSlot(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosCartLinesToDomain(result.value) };
  },

  async changeCartLineQuantity(
    params: PosChangeQuantityParams,
  ): Promise<PosCartLinesResult> {
    const result = await datasource.changeCartLineQuantity(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosCartLinesToDomain(result.value) };
  },

  async applyDiscount(
    params: PosApplyAmountAdjustmentParams,
  ): Promise<PosTotalsResult> {
    const result = await datasource.applyDiscount(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosTotalsToDomain(result.value) };
  },

  async applySurcharge(
    params: PosApplyAmountAdjustmentParams,
  ): Promise<PosTotalsResult> {
    const result = await datasource.applySurcharge(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosTotalsToDomain(result.value) };
  },

  async clearCart(): Promise<PosOperationResult> {
    return datasource.clearCart();
  },

  async getSlots(): Promise<readonly PosSlot[]> {
    const slots = await datasource.getSlots();
    return slots.map((slot) => ({ ...slot }));
  },

  async getCartLines(): Promise<readonly PosCartLine[]> {
    const cartLines = await datasource.getCartLines();
    return mapPosCartLinesToDomain(cartLines);
  },

  async getTotals(): Promise<PosTotalsResult> {
    const result = await datasource.getTotals();
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosTotalsToDomain(result.value) };
  },

  async completePayment(
    params: PosCompletePaymentParams,
  ): Promise<PosPaymentResult> {
    const result = await datasource.completePayment(params);
    if (!result.success) {
      return { success: false, error: mapRepositoryError(result.error) };
    }

    return { success: true, value: mapPosReceiptToDomain(result.value) };
  },

  async printReceipt(receipt: PosReceipt): Promise<PosOperationResult> {
    return datasource.printReceipt(receipt);
  },
});
