import { BillingDocumentType } from "@/feature/billing/types/billing.types";
import { buildBillingDraftHtml } from "@/feature/billing/ui/printBillingDocument.util";
import { exportDocument } from "@/shared/utils/document/exportDocument";
import { pickImageFromLibrary } from "@/shared/utils/media/pickImage";
import * as Crypto from "expo-crypto";
import { useCallback, useMemo } from "react";
import { Platform } from "react-native";
import {
  BillingAssetsViewModelModule,
  UseBillingAssetsViewModelParams,
} from "./billingAssets.viewModel";

export const useBillingAssetsViewModel = ({
  canManage,
  accountRemoteId,
  currencyCode,
  countryCode,
  editorForm,
  draftTotals,
  saveBillPhotoUseCase,
  onRefresh,
  setErrorMessage,
}: UseBillingAssetsViewModelParams): BillingAssetsViewModelModule => {
  const onPrintPreview = useCallback(async () => {
    const html = buildBillingDraftHtml(
      editorForm,
      draftTotals.subtotalAmount,
      draftTotals.taxAmount,
      draftTotals.totalAmount,
      currencyCode,
      countryCode,
    );
    const titlePrefix =
      editorForm.documentType === BillingDocumentType.Receipt
        ? "receipt"
        : "invoice";
    const result = await exportDocument({
      html,
      action: "print",
      fileName: `${titlePrefix}_${editorForm.customerName || "document"}_${editorForm.issuedAt || Date.now()}`,
      title: `eLekha ${titlePrefix}`,
    });

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setErrorMessage(null);
  }, [
    countryCode,
    currencyCode,
    draftTotals.subtotalAmount,
    draftTotals.taxAmount,
    draftTotals.totalAmount,
    editorForm,
    setErrorMessage,
  ]);

  const onUploadBillPhoto = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to upload bill photos.");
      return;
    }

    if (!accountRemoteId) {
      setErrorMessage("A business account is required to manage billing.");
      return;
    }

    const savePhoto = async ({
      fileName,
      mimeType,
      imageDataUrl,
    }: {
      fileName: string;
      mimeType: string | null;
      imageDataUrl: string;
    }): Promise<void> => {
      const saveResult = await saveBillPhotoUseCase.execute({
        remoteId: Crypto.randomUUID(),
        accountRemoteId,
        documentRemoteId: null,
        fileName,
        mimeType,
        imageDataUrl,
        uploadedAt: Date.now(),
      });

      if (!saveResult.success) {
        setErrorMessage(saveResult.error.message);
        return;
      }

      await onRefresh();
    };

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
          const result = reader.result;
          if (typeof result !== "string") {
            setErrorMessage("Unable to read the selected image.");
            return;
          }

          await savePhoto({
            fileName: file.name,
            mimeType: file.type || null,
            imageDataUrl: result,
          });
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    const pickedImage = await pickImageFromLibrary();
    if (!pickedImage) {
      return;
    }

    const imageDataUrl = pickedImage.dataUrl;
    if (!imageDataUrl) {
      setErrorMessage("Unable to read the selected image.");
      return;
    }

    await savePhoto({
      fileName: pickedImage.fileName,
      mimeType: pickedImage.mimeType,
      imageDataUrl,
    });
  }, [accountRemoteId, canManage, onRefresh, saveBillPhotoUseCase, setErrorMessage]);

  return useMemo(
    () => ({
      onPrintPreview,
      onUploadBillPhoto,
    }),
    [onPrintPreview, onUploadBillPhoto],
  );
};
