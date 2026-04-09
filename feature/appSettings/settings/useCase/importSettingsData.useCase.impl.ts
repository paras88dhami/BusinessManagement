import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { SettingsRepository } from "../data/repository/settings.repository";
import {
  SettingsDataTransferBundle,
  SettingsDataTransferModule,
  SettingsDataTransferModuleValue,
  SettingsDataTransferTable,
  SettingsValidationError,
} from "../types/settings.types";
import {
  ImportSettingsDataPayload,
  ImportSettingsDataUseCase,
} from "./importSettingsData.useCase";

const MODULE_TABLE_NAMES: Record<SettingsDataTransferModuleValue, readonly string[]> = {
  [SettingsDataTransferModule.Transactions]: ["transactions"],
  [SettingsDataTransferModule.Products]: ["products"],
  [SettingsDataTransferModule.Contacts]: ["contacts"],
  [SettingsDataTransferModule.Orders]: ["orders", "order_lines"],
  [SettingsDataTransferModule.Budgets]: ["budget_plans"],
  [SettingsDataTransferModule.Ledger]: ["ledger_entries"],
  [SettingsDataTransferModule.EmiLoans]: [
    "emi_plans",
    "emi_installments",
    "installment_payment_links",
  ],
  [SettingsDataTransferModule.Accounts]: ["money_accounts"],
};

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "\"") {
      const nextChar = line[index + 1];
      if (insideQuotes && nextChar === "\"") {
        current += "\"";
        index += 1;
        continue;
      }
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.replace(/\\n/g, "\n"));
};

const parseSectionedCsv = (content: string): SettingsDataTransferTable[] => {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const tableRows = new Map<string, Record<string, unknown>[]>();
  const tableHeaders = new Map<string, string[]>();
  let activeTableName: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      continue;
    }

    if (trimmedLine.startsWith("# table=")) {
      activeTableName = trimmedLine.replace("# table=", "").trim();
      if (!tableRows.has(activeTableName)) {
        tableRows.set(activeTableName, []);
      }
      continue;
    }

    if (trimmedLine.startsWith("#")) {
      continue;
    }

    if (!activeTableName) {
      continue;
    }

    const header = tableHeaders.get(activeTableName);
    if (!header) {
      tableHeaders.set(activeTableName, parseCsvLine(line));
      continue;
    }

    const rowValues = parseCsvLine(line);
    const rowRecord: Record<string, unknown> = {};
    for (let index = 0; index < header.length; index += 1) {
      const columnName = header[index];
      rowRecord[columnName] = rowValues[index] ?? "";
    }
    tableRows.get(activeTableName)?.push(rowRecord);
  }

  return [...tableRows.entries()].map(([tableName, rows]) => ({
    tableName,
    columns: (tableHeaders.get(tableName) ?? []).map((name) => ({
      name,
      type: "string",
    })),
    rows,
  }));
};

const parsePlainCsv = (
  content: string,
  tableName: string,
): SettingsDataTransferTable[] => {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const header = parseCsvLine(lines[0]);
  const rows: Record<string, unknown>[] = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row: Record<string, unknown> = {};
    for (let index = 0; index < header.length; index += 1) {
      row[header[index]] = values[index] ?? "";
    }
    rows.push(row);
  }

  return [
    {
      tableName,
      columns: header.map((name) => ({ name, type: "string" })),
      rows,
    },
  ];
};

const parseJsonTables = (
  parsedContent: unknown,
  moduleId: SettingsDataTransferModuleValue,
): SettingsDataTransferTable[] => {
  if (
    parsedContent &&
    typeof parsedContent === "object" &&
    "modules" in parsedContent &&
    Array.isArray((parsedContent as SettingsDataTransferBundle).modules)
  ) {
    const matchingModule = (
      parsedContent as SettingsDataTransferBundle
    ).modules.find((moduleItem) => moduleItem.moduleId === moduleId);

    return matchingModule?.tables ? [...matchingModule.tables] : [];
  }

  if (
    parsedContent &&
    typeof parsedContent === "object" &&
    "tables" in parsedContent &&
    Array.isArray((parsedContent as { tables: SettingsDataTransferTable[] }).tables)
  ) {
    return [...(parsedContent as { tables: SettingsDataTransferTable[] }).tables];
  }

  if (Array.isArray(parsedContent)) {
    return [
      {
        tableName: MODULE_TABLE_NAMES[moduleId][0],
        columns: [],
        rows: parsedContent as Record<string, unknown>[],
      },
    ];
  }

  return [];
};

const parseImportedTables = (
  content: string,
  fileName: string | null,
  moduleId: SettingsDataTransferModuleValue,
): SettingsDataTransferTable[] => {
  const normalizedFileName = fileName?.toLowerCase() ?? "";
  const normalizedContent = content.trim();
  const isJsonContent =
    normalizedFileName.endsWith(".json") ||
    normalizedContent.startsWith("{") ||
    normalizedContent.startsWith("[");

  if (isJsonContent) {
    const parsed = JSON.parse(content) as unknown;
    return parseJsonTables(parsed, moduleId);
  }

  if (content.includes("# table=")) {
    return parseSectionedCsv(content);
  }

  return parsePlainCsv(content, MODULE_TABLE_NAMES[moduleId][0]);
};

export const createImportSettingsDataUseCase = (
  settingsRepository: SettingsRepository,
): ImportSettingsDataUseCase => ({
  async execute(payload: ImportSettingsDataPayload) {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/json", "text/plain"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (pickerResult.canceled || pickerResult.assets.length === 0) {
        return {
          success: false,
          error: SettingsValidationError("Import cancelled."),
        };
      }

      const pickedFile = pickerResult.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(pickedFile.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsedTables = parseImportedTables(
        fileContent,
        pickedFile.name ?? null,
        payload.moduleId,
      );

      if (parsedTables.length === 0) {
        return {
          success: false,
          error: SettingsValidationError(
            "No valid records found. Ensure the file matches export format.",
          ),
        };
      }

      return settingsRepository.importDataBundle({
        moduleId: payload.moduleId,
        tables: parsedTables,
      });
    } catch (error) {
      return {
        success: false,
        error: SettingsValidationError(
          error instanceof Error
            ? error.message
            : "Unable to import selected file.",
        ),
      };
    }
  },
});
