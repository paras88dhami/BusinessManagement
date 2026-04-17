import { exportDocument } from "@/shared/utils/document/exportDocument";
import { Platform } from "react-native";
import type { PosReceiptDocumentAdapter } from "./posReceiptDocument.adapter";
import { PosErrorType, type PosOperationResult } from "../types/pos.error.types";
import { buildPosReceiptHtml } from "../utils/buildPosReceiptHtml.util";

const buildUnsupportedResult = (message: string): PosOperationResult => ({
  success: false,
  error: {
    type: PosErrorType.UnsupportedOperation,
    message,
  },
});

const mapExportErrorToResult = (error: string): PosOperationResult => ({
  success: false,
  error: {
    type: PosErrorType.UnsupportedOperation,
    message: error,
  },
});

export const createPosReceiptDocumentAdapter = (): PosReceiptDocumentAdapter => ({
  async printReceiptDocument(params) {
    const html = buildPosReceiptHtml(
      params.receipt,
      params.currencyCode,
      params.countryCode,
    );

    const result = await exportDocument({
      html,
      action: "print",
      fileName: `pos_receipt_${params.receipt.receiptNumber}`,
      title: `POS Receipt ${params.receipt.receiptNumber}`,
    });

    if (!result.success) {
      return mapExportErrorToResult(result.error);
    }

    return { success: true, value: true };
  },

  async shareReceiptDocument(params) {
    if (Platform.OS === "web") {
      return buildUnsupportedResult("Sharing is not available in this web build.");
    }

    const html = buildPosReceiptHtml(
      params.receipt,
      params.currencyCode,
      params.countryCode,
    );

    const result = await exportDocument({
      html,
      action: "share",
      fileName: `pos_receipt_${params.receipt.receiptNumber}`,
      title: `POS Receipt ${params.receipt.receiptNumber}`,
    });

    if (!result.success) {
      return mapExportErrorToResult(result.error);
    }

    return { success: true, value: true };
  },
});
