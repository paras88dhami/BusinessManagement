import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { ReportExportError } from "@/feature/reports/types/report.error.types";
import type { ReportCsvFileAdapter } from "./reportCsvFile.adapter";

const sanitizeFileName = (value: string): string => {
  const normalized = value
    .trim()
    .replaceAll(/[^a-zA-Z0-9-_ ]/g, "")
    .replaceAll(/\s+/g, "_");

  return normalized.length > 0 ? normalized : `report_export_${Date.now()}`;
};

const ensureCsvExtension = (value: string): string => {
  const baseName = sanitizeFileName(value.replace(/\.csv$/i, ""));
  return `${baseName}.csv`;
};

const downloadOnWeb = async (
  fileName: string,
  content: string,
  mimeType: string,
): Promise<void> => {
  if (typeof document === "undefined") {
    throw new Error("Web export is unavailable on this platform.");
  }

  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
};

const ensureReportsExportDirectory = async (): Promise<string> => {
  const root = FileSystem.documentDirectory;
  if (!root) {
    throw new Error("Unable to access device document directory.");
  }

  const dir = `${root}reports-exports/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  return dir;
};

const writeFileToAppDirectory = async (params: {
  fileName: string;
  content: string;
}): Promise<string> => {
  const dir = await ensureReportsExportDirectory();
  const uri = `${dir}${params.fileName}`;
  await FileSystem.writeAsStringAsync(uri, params.content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return uri;
};

const writeTempFile = async (params: {
  fileName: string;
  content: string;
}): Promise<string> => {
  const writableDirectory =
    FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!writableDirectory) {
    throw new Error("Unable to access local storage for CSV export.");
  }

  const uri = `${writableDirectory}${params.fileName}`;
  await FileSystem.writeAsStringAsync(uri, params.content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return uri;
};

const saveToAndroidDownloads = async (params: {
  fileName: string;
  content: string;
  mimeType: string;
}): Promise<boolean> => {
  const initialDownloadsUri =
    FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("Download");

  const directoryPermission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
      initialDownloadsUri,
    );

  if (!directoryPermission.granted) {
    return false;
  }

  const targetFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    directoryPermission.directoryUri,
    params.fileName,
    params.mimeType,
  );

  await FileSystem.StorageAccessFramework.writeAsStringAsync(
    targetFileUri,
    params.content,
    {
      encoding: FileSystem.EncodingType.UTF8,
    },
  );

  return true;
};

export const createReportCsvFileAdapter = (): ReportCsvFileAdapter => ({
  async exportCsvFile(payload) {
    const fileName = ensureCsvExtension(payload.csvExport.fileName);

    try {
      if (Platform.OS === "web") {
        await downloadOnWeb(
          fileName,
          payload.csvExport.content,
          payload.csvExport.mimeType,
        );
        return { success: true, value: true };
      }

      if (payload.action === "save" && Platform.OS === "android") {
        const saved = await saveToAndroidDownloads({
          fileName,
          content: payload.csvExport.content,
          mimeType: payload.csvExport.mimeType,
        });

        if (!saved) {
          return {
            success: false,
            error: ReportExportError(
              "Downloads folder access is required to save CSV export. Please allow access and select Downloads.",
            ),
          };
        }

        return { success: true, value: true };
      }

      if (payload.action === "save") {
        await writeFileToAppDirectory({
          fileName,
          content: payload.csvExport.content,
        });

        return { success: true, value: true };
      }

      const shareUri = await writeTempFile({
        fileName,
        content: payload.csvExport.content,
      });

      if (!(await Sharing.isAvailableAsync())) {
        return {
          success: false,
          error: ReportExportError("Sharing is not available on this device."),
        };
      }

      await Sharing.shareAsync(shareUri, {
        mimeType: payload.csvExport.mimeType,
        dialogTitle: payload.dialogTitle,
        UTI: "public.comma-separated-values-text",
      });

      return { success: true, value: true };
    } catch (error) {
      return {
        success: false,
        error: ReportExportError(
          error instanceof Error
            ? error.message
            : "Unable to export CSV file.",
        ),
      };
    }
  },
});
