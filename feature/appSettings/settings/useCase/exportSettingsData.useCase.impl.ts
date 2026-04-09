import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { SettingsRepository } from "../data/repository/settings.repository";
import {
  SettingsDataTransferBundle,
  SettingsDataTransferFormat,
  SettingsValidationError,
} from "../types/settings.types";
import {
  ExportSettingsDataPayload,
  ExportSettingsDataUseCase,
} from "./exportSettingsData.useCase";

const buildFileStamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const pad = (value: number): string => value.toString().padStart(2, "0");

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate(),
  )}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(
    date.getSeconds(),
  )}`;
};

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value).replace(/\r?\n/g, "\\n");
  if (
    normalized.includes(",") ||
    normalized.includes("\"") ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  return normalized;
};

const toCsvLine = (values: readonly unknown[]): string => {
  return values.map((value) => escapeCsvValue(value)).join(",");
};

const toCsvContent = (bundle: SettingsDataTransferBundle): string => {
  const lines: string[] = [
    `# e_lekha_export_version=${bundle.version}`,
    `# exported_at=${new Date(bundle.exportedAt).toISOString()}`,
    "",
  ];

  for (const moduleItem of bundle.modules) {
    for (const table of moduleItem.tables) {
      lines.push(`# module_id=${moduleItem.moduleId}`);
      lines.push(`# table=${table.tableName}`);
      lines.push(toCsvLine(table.columns.map((column) => column.name)));

      for (const row of table.rows) {
        lines.push(
          toCsvLine(table.columns.map((column) => row[column.name] ?? "")),
        );
      }

      lines.push("");
    }
  }

  return lines.join("\n");
};

const toJsonContent = (bundle: SettingsDataTransferBundle): string => {
  return JSON.stringify(bundle, null, 2);
};

const countExportedRows = (bundle: SettingsDataTransferBundle): number => {
  return bundle.modules.reduce((moduleTotal, moduleItem) => {
    const moduleRowCount = moduleItem.tables.reduce((tableTotal, table) => {
      return tableTotal + table.rows.length;
    }, 0);

    return moduleTotal + moduleRowCount;
  }, 0);
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

const saveToAndroidLocalDirectory = async (
  fileName: string,
  content: string,
  mimeType: string,
): Promise<boolean> => {
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
    fileName,
    mimeType,
  );

  await FileSystem.StorageAccessFramework.writeAsStringAsync(
    targetFileUri,
    content,
    {
      encoding: FileSystem.EncodingType.UTF8,
    },
  );

  return true;
};

export const createExportSettingsDataUseCase = (
  settingsRepository: SettingsRepository,
): ExportSettingsDataUseCase => ({
  async execute(payload: ExportSettingsDataPayload) {
    const moduleIds = [...new Set(payload.moduleIds)];

    if (moduleIds.length === 0) {
      return {
        success: false,
        error: SettingsValidationError("Select at least one data group to export."),
      };
    }

    const bundleResult = await settingsRepository.exportDataBundle({
      moduleIds,
    });

    if (!bundleResult.success) {
      return bundleResult;
    }

    const timestamp = Date.now();
    const fileStamp = buildFileStamp(timestamp);
    const extension =
      payload.format === SettingsDataTransferFormat.Csv ? "csv" : "json";
    const fileName = `elekha-export-${fileStamp}.${extension}`;
    const content =
      payload.format === SettingsDataTransferFormat.Csv
        ? toCsvContent(bundleResult.value)
        : toJsonContent(bundleResult.value);
    const mimeType =
      payload.format === SettingsDataTransferFormat.Csv
        ? "text/csv"
        : "application/json";

    try {
      if (Platform.OS === "web") {
        await downloadOnWeb(fileName, content, mimeType);
      } else if (Platform.OS === "android") {
        const savedToLocalDirectory = await saveToAndroidLocalDirectory(
          fileName,
          content,
          mimeType,
        );

        if (!savedToLocalDirectory) {
          return {
            success: false,
            error: SettingsValidationError(
              "Downloads folder access is required to save on device. Please allow access and select Downloads.",
            ),
          };
        }
      } else {
        const writableDirectory =
          FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (!writableDirectory) {
          return {
            success: false,
            error: SettingsValidationError(
              "Unable to access local storage for export.",
            ),
          };
        }

        const outputUri = `${writableDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(outputUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(outputUri, {
            mimeType,
            dialogTitle: "Export Data",
            UTI: payload.format === SettingsDataTransferFormat.Csv ? "public.comma-separated-values-text" : "public.json",
          });
        }
      }
    } catch (error) {
      return {
        success: false,
        error: SettingsValidationError(
          error instanceof Error
            ? error.message
            : "Unable to export the selected data.",
        ),
      };
    }

    return {
      success: true,
      value: {
        fileName,
        exportedModuleCount: bundleResult.value.modules.length,
        exportedRowCount: countExportedRows(bundleResult.value),
      },
    };
  },
});
