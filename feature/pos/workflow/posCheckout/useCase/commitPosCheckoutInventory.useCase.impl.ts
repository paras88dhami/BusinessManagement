import type { SaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase";
import { PosErrorType, type PosOperationResult } from "@/feature/pos/types/pos.error.types";
import type { CommitPosCheckoutInventoryUseCase } from "./commitPosCheckoutInventory.useCase";
import { buildPosCheckoutInventoryMovements } from "../utils/buildPosCheckoutInventoryMovements.util";

type CreateCommitPosCheckoutInventoryUseCaseParams = {
  saveInventoryMovementsUseCase: SaveInventoryMovementsUseCase;
};

const mapInventoryMessageToPosErrorType = (
  message: string,
): (typeof PosErrorType)[keyof typeof PosErrorType] => {
  if (message.toLowerCase().includes("below zero")) {
    return PosErrorType.OutOfStock;
  }
  return PosErrorType.Validation;
};

export const createCommitPosCheckoutInventoryUseCase = ({
  saveInventoryMovementsUseCase,
}: CreateCommitPosCheckoutInventoryUseCaseParams): CommitPosCheckoutInventoryUseCase => ({
  async execute(params): Promise<PosOperationResult> {
    const businessAccountRemoteId = params.businessAccountRemoteId.trim();
    const saleRemoteId = params.saleRemoteId.trim();
    const saleReferenceNumber = params.saleReferenceNumber.trim();

    if (!businessAccountRemoteId) {
      return {
        success: false,
        error: {
          type: PosErrorType.ContextRequired,
          message: "Business account context is required for inventory commit.",
        },
      };
    }

    if (!saleRemoteId) {
      return {
        success: false,
        error: {
          type: PosErrorType.Validation,
          message: "POS sale remote id is required for inventory commit.",
        },
      };
    }

    if (!saleReferenceNumber) {
      return {
        success: false,
        error: {
          type: PosErrorType.Validation,
          message: "POS sale reference number is required for inventory commit.",
        },
      };
    }

    if (params.cartLines.length === 0) {
      return { success: true, value: true };
    }

    const movementPayloads = buildPosCheckoutInventoryMovements({
      businessAccountRemoteId,
      saleRemoteId,
      saleReferenceNumber,
      cartLines: params.cartLines,
      movementAt: params.movementAt,
    });

    if (movementPayloads.length === 0) {
      return { success: true, value: true };
    }

    const result = await saveInventoryMovementsUseCase.execute(movementPayloads);

    if (!result.success) {
      return {
        success: false,
        error: {
          type: mapInventoryMessageToPosErrorType(result.error.message),
          message: result.error.message,
        },
      };
    }

    return { success: true, value: true };
  },
});
