import {
  getSecurityPreferenceState,
  setBiometricLoginEnabled,
  setTwoFactorAuthEnabled,
} from "@/feature/appSettings/data/appSettings.store";
import { moneyAccountsTable } from "@/feature/accounts/data/dataSource/db/moneyAccount.schema";
import { budgetPlansTable } from "@/feature/budget/data/dataSource/db/budgetPlan.schema";
import { contactsTable } from "@/feature/contacts/data/dataSource/db/contact.schema";
import { emiInstallmentsTable } from "@/feature/emiLoans/data/dataSource/db/emiInstallment.schema";
import { emiPlansTable } from "@/feature/emiLoans/data/dataSource/db/emiPlan.schema";
import { installmentPaymentLinksTable } from "@/feature/emiLoans/data/dataSource/db/installmentPaymentLink.schema";
import { ledgerEntriesTable } from "@/feature/ledger/data/dataSource/db/ledger.schema";
import { orderLinesTable } from "@/feature/orders/data/dataSource/db/orderLine.schema";
import { ordersTable } from "@/feature/orders/data/dataSource/db/order.schema";
import { productsTable } from "@/feature/products/data/dataSource/db/product.schema";
import { transactionsTable } from "@/feature/transactions/data/dataSource/db/transaction.schema";
import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import { Platform } from "react-native";
import {
  SettingsDataTransferModule,
  SettingsDataTransferModuleValue,
  SettingsDataTransferTable,
} from "../../types/settings.types";
import { SettingsBootstrapRecord, SettingsDatasource } from "./settings.datasource";
import { BugReportModel } from "./db/bugReport.model";
import { AppRatingModel } from "./db/appRating.model";

const BUG_REPORTS_TABLE = "bug_reports";
const APP_RATINGS_TABLE = "app_ratings";

const HELP_FAQ_ITEMS = [
  { id: "invoice", question: "How do I create an invoice?" },
  { id: "product", question: "How to add a new product?" },
  { id: "emi", question: "How do I track EMI payments?" },
  { id: "export", question: "Can I export my data?" },
  { id: "switch-account", question: "How to switch between accounts?" },
] as const;

const SUPPORT_CONTACT_ITEMS = [
  { id: "email", title: "Email Support", value: "support@e-lekha.com" },
  { id: "phone", title: "Phone Support", value: "+977-01-XXXXXXX" },
] as const;

const TERMS_DOCUMENT_ITEMS = [
  {
    id: "terms-of-service",
    title: "Terms of Service",
    subtitle: "Last updated: March 2026",
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "Last updated: March 2026",
  },
  {
    id: "data-processing-agreement",
    title: "Data Processing Agreement",
    subtitle: "GDPR & data handling",
  },
] as const;

const DATA_RIGHT_ITEMS = [
  { id: "copy", label: "Request a copy of your data" },
  { id: "delete", label: "Delete your account and data" },
  { id: "opt-out", label: "Opt out of data processing" },
  { id: "consent", label: "Update your consent preferences" },
] as const;

type TransferColumnDefinition = {
  name: string;
  type: "string" | "number" | "boolean";
  isOptional?: boolean;
};

type TransferTableDefinition = {
  tableName: string;
  columns: readonly TransferColumnDefinition[];
};

type TransferModuleDefinition = {
  label: string;
  tables: readonly TransferTableDefinition[];
};

type UnsafeAdapter = {
  unsafeExecute: (params: { sqls: [string, unknown[]][] }) => Promise<void>;
};

const castTableColumns = (
  schemaColumns: unknown,
): readonly TransferColumnDefinition[] => {
  const columnList = (Array.isArray(schemaColumns)
    ? schemaColumns
    : Object.values(
        (schemaColumns ?? {}) as Record<
          string,
          { name: string; type: unknown; isOptional?: boolean }
        >,
      )) as ReadonlyArray<{
    name: string;
    type: unknown;
    isOptional?: boolean;
  }>;

  return columnList
    .filter(
      (column): column is {
        name: string;
        type: "string" | "number" | "boolean";
        isOptional?: boolean;
      } =>
        column.type === "string" ||
        column.type === "number" ||
        column.type === "boolean",
    )
    .map((column) => ({
      name: column.name,
      type: column.type,
      isOptional: column.isOptional,
    }));
};

const DATA_TRANSFER_MODULES: Record<
  SettingsDataTransferModuleValue,
  TransferModuleDefinition
> = {
  [SettingsDataTransferModule.Transactions]: {
    label: "Transactions",
    tables: [
      {
        tableName: transactionsTable.name,
        columns: castTableColumns(transactionsTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.Products]: {
    label: "Products",
    tables: [
      {
        tableName: productsTable.name,
        columns: castTableColumns(productsTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.Contacts]: {
    label: "Contacts",
    tables: [
      {
        tableName: contactsTable.name,
        columns: castTableColumns(contactsTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.Orders]: {
    label: "Orders",
    tables: [
      {
        tableName: ordersTable.name,
        columns: castTableColumns(ordersTable.columns),
      },
      {
        tableName: orderLinesTable.name,
        columns: castTableColumns(orderLinesTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.Budgets]: {
    label: "Budgets",
    tables: [
      {
        tableName: budgetPlansTable.name,
        columns: castTableColumns(budgetPlansTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.Ledger]: {
    label: "Ledger",
    tables: [
      {
        tableName: ledgerEntriesTable.name,
        columns: castTableColumns(ledgerEntriesTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.EmiLoans]: {
    label: "EMI & Loans",
    tables: [
      {
        tableName: emiPlansTable.name,
        columns: castTableColumns(emiPlansTable.columns),
      },
      {
        tableName: emiInstallmentsTable.name,
        columns: castTableColumns(emiInstallmentsTable.columns),
      },
      {
        tableName: installmentPaymentLinksTable.name,
        columns: castTableColumns(installmentPaymentLinksTable.columns),
      },
    ],
  },
  [SettingsDataTransferModule.Accounts]: {
    label: "Accounts",
    tables: [
      {
        tableName: moneyAccountsTable.name,
        columns: castTableColumns(moneyAccountsTable.columns),
      },
    ],
  },
};

const getModuleDefinition = (
  moduleId: SettingsDataTransferModuleValue,
): TransferModuleDefinition | null => {
  return DATA_TRANSFER_MODULES[moduleId] ?? null;
};

const normalizeRequired = (value: string): string => value.trim();
const normalizeOptional = (value: string | null | undefined): string | null => {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
};

const createLocalRemoteId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const createLocalRowId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const normalizeBooleanValue = (
  value: unknown,
): 0 | 1 | null => {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "number") {
    if (value === 1) return 1;
    if (value === 0) return 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return 1;
    }
    if (normalized === "false" || normalized === "0") {
      return 0;
    }
  }

  return null;
};

const normalizeColumnValue = (
  column: TransferColumnDefinition,
  rawValue: unknown,
): unknown => {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  if (column.type === "number") {
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      return rawValue;
    }

    if (typeof rawValue === "string" && rawValue.trim().length > 0) {
      const parsed = Number(rawValue.trim());
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  if (column.type === "boolean") {
    return normalizeBooleanValue(rawValue);
  }

  if (typeof rawValue === "string") {
    return rawValue;
  }

  return String(rawValue);
};

const normalizeImportedRows = (
  table: TransferTableDefinition,
  rows: readonly Record<string, unknown>[],
): { preparedRows: [string, unknown[]][]; skippedRowCount: number } => {
  const columns = ["id", ...table.columns.map((column) => column.name)];
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT OR REPLACE INTO ${table.tableName} (${columns.join(", ")}) VALUES (${placeholders});`;

  const preparedRows: [string, unknown[]][] = [];
  let skippedRowCount = 0;
  const now = Date.now();

  for (const row of rows) {
    const rowIdCandidate = row.id;
    const rowId =
      typeof rowIdCandidate === "string" && rowIdCandidate.trim().length > 0
        ? rowIdCandidate.trim()
        : createLocalRowId(table.tableName);

    const values: unknown[] = [rowId];
    let isValidRow = true;

    for (const column of table.columns) {
      const normalizedValue = normalizeColumnValue(column, row[column.name]);
      const isMissingRequiredValue =
        !column.isOptional &&
        (normalizedValue === null ||
          (typeof normalizedValue === "string" &&
            normalizedValue.trim().length === 0));

      if (isMissingRequiredValue) {
        if (
          column.type === "number" &&
          (column.name === "created_at" || column.name === "updated_at")
        ) {
          values.push(now);
          continue;
        }

        if (column.type === "string" && column.name === "sync_status") {
          values.push("synced");
          continue;
        }

        if (column.type === "boolean") {
          values.push(0);
          continue;
        }

        isValidRow = false;
        break;
      }

      values.push(normalizedValue);
    }

    if (!isValidRow) {
      skippedRowCount += 1;
      continue;
    }

    preparedRows.push([sql, values]);
  }

  return { preparedRows, skippedRowCount };
};

const setCreatedAndUpdatedAt = (
  record: BugReportModel | AppRatingModel,
  now: number,
) => {
  (record as unknown as { _raw: Record<string, number> })._raw.created_at = now;
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const resolveAppVersion = (): string | null => {
  if (
    typeof process !== "undefined" &&
    typeof process.env?.EXPO_PUBLIC_APP_VERSION === "string"
  ) {
    const normalized = process.env.EXPO_PUBLIC_APP_VERSION.trim();
    return normalized.length > 0 ? normalized : null;
  }

  return null;
};

const resolveDeviceInfo = (): string | null => {
  if (
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.trim().length > 0
  ) {
    return navigator.userAgent.trim();
  }

  return `Platform: ${Platform.OS}`;
};

const resolveCurrentDeviceSubtitle = (): string => {
  if (Platform.OS === "web") {
    return "Current web session";
  }

  if (Platform.OS === "ios") {
    return "Current iOS device";
  }

  if (Platform.OS === "android") {
    return "Current Android device";
  }

  return `Current ${Platform.OS} session`;
};

export const createLocalSettingsDatasource = (
  database: Database,
): SettingsDatasource => ({
  async getSettingsBootstrap(): Promise<Result<SettingsBootstrapRecord>> {
    try {
      const securityPreferences = await getSecurityPreferenceState(database);

      return {
        success: true,
        value: {
          security_preferences: {
            biometric_login_enabled: securityPreferences.biometricLoginEnabled,
            two_factor_auth_enabled: securityPreferences.twoFactorAuthEnabled,
          },
          help_faq_items: [...HELP_FAQ_ITEMS],
          support_contact_items: [...SUPPORT_CONTACT_ITEMS],
          terms_document_items: [...TERMS_DOCUMENT_ITEMS],
          data_right_items: [...DATA_RIGHT_ITEMS],
          device_info: resolveDeviceInfo(),
          app_version: resolveAppVersion(),
          current_device_title: "This device",
          current_device_subtitle: resolveCurrentDeviceSubtitle(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async updateBiometricLoginEnabled(enabled: boolean): Promise<Result<boolean>> {
    try {
      await setBiometricLoginEnabled(database, enabled);
      return { success: true, value: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async updateTwoFactorAuthEnabled(enabled: boolean): Promise<Result<boolean>> {
    try {
      await setTwoFactorAuthEnabled(database, enabled);
      return { success: true, value: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async submitBugReport(payload): Promise<Result<BugReportModel>> {
    try {
      const normalizedUserRemoteId = normalizeRequired(payload.userRemoteId);
      const normalizedTitle = normalizeRequired(payload.title);
      const normalizedDescription = normalizeRequired(payload.description);

      if (!normalizedUserRemoteId) {
        throw new Error("User remote id is required");
      }

      if (!normalizedTitle) {
        throw new Error("Bug title is required");
      }

      if (!normalizedDescription) {
        throw new Error("Bug description is required");
      }

      const collection = database.get<BugReportModel>(BUG_REPORTS_TABLE);
      let created!: BugReportModel;

      await database.write(async () => {
        created = await collection.create((record) => {
          const now = Date.now();
          record.remoteId = createLocalRemoteId("bug");
          record.userRemoteId = normalizedUserRemoteId;
          record.title = normalizedTitle;
          record.description = normalizedDescription;
          record.severity = payload.severity;
          record.deviceInfo = normalizeOptional(payload.deviceInfo);
          record.appVersion = normalizeOptional(payload.appVersion);
          record.submittedAt = now;
          setCreatedAndUpdatedAt(record, now);
        });
      });

      return { success: true, value: created };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async submitAppRating(payload): Promise<Result<AppRatingModel>> {
    try {
      const normalizedUserRemoteId = normalizeRequired(payload.userRemoteId);
      const normalizedReview = normalizeOptional(payload.review);

      if (!normalizedUserRemoteId) {
        throw new Error("User remote id is required");
      }

      if (!Number.isInteger(payload.starCount) || payload.starCount < 1 || payload.starCount > 5) {
        throw new Error("Star rating must be between one and five");
      }

      const collection = database.get<AppRatingModel>(APP_RATINGS_TABLE);
      let created!: AppRatingModel;

      await database.write(async () => {
        created = await collection.create((record) => {
          const now = Date.now();
          record.remoteId = createLocalRemoteId("rating");
          record.userRemoteId = normalizedUserRemoteId;
          record.starCount = payload.starCount;
          record.review = normalizedReview;
          record.submittedAt = now;
          setCreatedAndUpdatedAt(record, now);
        });
      });

      return { success: true, value: created };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async exportDataBundle(payload): Promise<Result<{
    version: 1;
    exportedAt: number;
    modules: readonly {
      moduleId: SettingsDataTransferModuleValue;
      label: string;
      tables: readonly SettingsDataTransferTable[];
    }[];
  }>> {
    try {
      const deduplicatedModuleIds = [...new Set(payload.moduleIds)];
      const modules = [];

      for (const moduleId of deduplicatedModuleIds) {
        const moduleDefinition = getModuleDefinition(moduleId);
        if (!moduleDefinition) {
          continue;
        }

        const tables: SettingsDataTransferTable[] = [];

        for (const table of moduleDefinition.tables) {
          const collection = database.get<any>(table.tableName);
          const hasSoftDeleteColumn = table.columns.some(
            (column) => column.name === "deleted_at",
          );
          const whereClause = hasSoftDeleteColumn
            ? " WHERE deleted_at IS NULL"
            : "";
          const query = `SELECT * FROM ${table.tableName}${whereClause};`;
          const rows = await collection
            .query(Q.unsafeSqlQuery(query))
            .unsafeFetchRaw();

          tables.push({
            tableName: table.tableName,
            columns: [
              { name: "id", type: "string" },
              ...table.columns.map((column) => ({
                name: column.name,
                type: column.type,
              })),
            ],
            rows: rows.map((row) => ({ ...row })),
          });
        }

        modules.push({
          moduleId,
          label: moduleDefinition.label,
          tables,
        });
      }

      return {
        success: true,
        value: {
          version: 1,
          exportedAt: Date.now(),
          modules,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async importDataBundle(payload): Promise<Result<{
    moduleId: SettingsDataTransferModuleValue;
    importedRowCount: number;
    skippedRowCount: number;
  }>> {
    try {
      const moduleDefinition = getModuleDefinition(payload.moduleId);

      if (!moduleDefinition) {
        return {
          success: false,
          error: new Error("Unsupported import module."),
        };
      }

      const importTableMap = new Map(
        payload.tables.map((table) => [table.tableName, table]),
      );
      const sqlStatements: [string, unknown[]][] = [];
      let skippedRowCount = 0;

      for (const tableDefinition of moduleDefinition.tables) {
        const tableData = importTableMap.get(tableDefinition.tableName);
        if (!tableData) {
          continue;
        }

        const normalizedRows = normalizeImportedRows(
          tableDefinition,
          tableData.rows,
        );
        skippedRowCount += normalizedRows.skippedRowCount;
        sqlStatements.push(...normalizedRows.preparedRows);
      }

      if (sqlStatements.length > 0) {
        await database.write(async () => {
          const adapter = database.adapter as unknown as UnsafeAdapter;
          await adapter.unsafeExecute({ sqls: sqlStatements });
        });
      }

      return {
        success: true,
        value: {
          moduleId: payload.moduleId,
          importedRowCount: sqlStatements.length,
          skippedRowCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
