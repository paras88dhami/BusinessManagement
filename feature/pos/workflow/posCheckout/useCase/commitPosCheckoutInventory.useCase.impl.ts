import { InventoryMovementSourceModule } from "@/feature/inventory/types/inventory.types";
import type { GetInventoryMovementsBySourceUseCase } from "@/feature/inventory/useCase/getInventoryMovementsBySource.useCase";
import type { SaveInventoryMovementsUseCase } from "@/feature/inventory/useCase/saveInventoryMovements.useCase";
import { PosErrorType, type PosOperationResult } from "@/feature/pos/types/pos.error.types";
import type { CommitPosCheckoutInventoryUseCase } from "./commitPosCheckoutInventory.useCase";
import { buildPosCheckoutInventoryMovements } from "../utils/buildPosCheckoutInventoryMovements.util";

type CreateCommitPosCheckoutInventoryUseCaseParams = {
  saveInventoryMovementsUseCase: SaveInventoryMovementsUseCase;
  getInventoryMovementsBySourceUseCase: GetInventoryMovementsBySourceUseCase;
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
  getInventoryMovementsBySourceUseCase,
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

    const existingMovementsResult =
      await getInventoryMovementsBySourceUseCase.execute({
        accountRemoteId: businessAccountRemoteId,
        sourceModule: InventoryMovementSourceModule.Pos,
        sourceRemoteId: saleRemoteId,
      });

    if (!existingMovementsResult.success) {
      return {
        success: false,
        error: {
          type: PosErrorType.Unknown,
          message: existingMovementsResult.error.message,
        },
      };
    }

    const expectedMovementRemoteIds = new Set(
      movementPayloads.map((movement) => movement.remoteId),
    );

    const existingMovementRemoteIds = new Set(
      existingMovementsResult.value.map((movement) => movement.remoteId),
    );

    const existingExpectedCount = [...expectedMovementRemoteIds].filter(
      (remoteId) => existingMovementRemoteIds.has(remoteId),
    ).length;

    if (existingExpectedCount === expectedMovementRemoteIds.size) {
      return { success: true, value: true };
    }

    if (existingExpectedCount > 0) {
      return {
        success: false,
        error: {
          type: PosErrorType.Validation,
          message:
            "POS inventory movements are partially recorded. Run POS reconciliation before retrying checkout.",
        },
      };
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
