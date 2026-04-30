import {
  getSecurityPreferenceState,
  setBiometricLoginEnabled,
  setTwoFactorAuthEnabled,
} from "@/feature/appSettings/data/appSettings.store";
import {
  SETTINGS_DATA_RIGHT_ITEMS,
  SETTINGS_HELP_FAQ_ITEMS,
  SETTINGS_IMPORT_DISABLED_MESSAGE,
  SETTINGS_SUPPORT_CONTACT_ITEMS,
  SETTINGS_TERMS_DOCUMENT_ITEMS,
} from "@/feature/appSettings/settings/constants/settings.constants";
import { moneyAccountsTable } from "@/feature/accounts/data/dataSource/db/moneyAccount.schema";
import {
  AccountType,
  AccountTypeValue,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
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
import { Database, Model, Q } from "@nozbe/watermelondb";
import { Platform } from "react-native";
import {
  SettingsDataTransferModule,
  SettingsDataTransferModuleValue,
  SettingsDataTransferTable,
} from "../../types/settings.types";
import { SettingsBootstrapRecord, SettingsDatasource } from "./settings.datasource";
import { AppRatingModel } from "./db/appRating.model";
import { BugReportModel } from "./db/bugReport.model";

const BUG_REPORTS_TABLE = "bug_reports";
const APP_RATINGS_TABLE = "app_ratings";

type SqlValue = string | number | null;

type TransferColumnDefinition = {
  name: string;
  type: "string" | "number" | "boolean";
};

type ExportScope = {
  activeAccountRemoteId: string;
  activeAccountType: AccountTypeValue;
};

type ScopedQuery = {
  sql: string;
  values: readonly SqlValue[];
};

type TransferTableDefinition = {
  tableName: string;
  columns: readonly TransferColumnDefinition[];
  buildScopedQuery: (scope: ExportScope) => ScopedQuery;
};

type TransferModuleDefinition = {
  label: string;
  tables: readonly TransferTableDefinition[];
};

const castTableColumns = (
  schemaColumns: unknown,
): readonly TransferColumnDefinition[] => {
  const columnList = (Array.isArray(schemaColumns)
    ? schemaColumns
    : Object.values(
        (schemaColumns ?? {}) as Record<
          string,
          { name: string; type: unknown }
        >,
      )) as readonly {
    name: string;
    type: unknown;
  }[];

  return columnList
    .filter(
      (
        column,
      ): column is {
        name: string;
        type: "string" | "number" | "boolean";
      } =>
        column.type === "string" ||
        column.type === "number" ||
        column.type === "boolean",
    )
    .map((column) => ({
      name: column.name,
      type: column.type,
    }));
};

const buildDirectScopedQuery = (
  tableName: string,
  scopeColumnName: string,
): ((scope: ExportScope) => ScopedQuery) => {
  return (scope) => ({
    sql: `SELECT * FROM ${tableName} WHERE ${scopeColumnName} = ? AND deleted_at IS NULL;`,
    values: [scope.activeAccountRemoteId],
  });
};

const buildScopedEmiPlanQuery = (scope: ExportScope): ScopedQuery => {
  if (scope.activeAccountType === AccountType.Business) {
    return {
      sql: `SELECT * FROM ${emiPlansTable.name} WHERE plan_mode = 'business' AND business_account_remote_id = ? AND deleted_at IS NULL;`,
      values: [scope.activeAccountRemoteId],
    };
  }

  return {
    sql: `SELECT ${emiPlansTable.name}.* FROM ${emiPlansTable.name} INNER JOIN ${moneyAccountsTable.name} ON ${moneyAccountsTable.name}.remote_id = ${emiPlansTable.name}.linked_account_remote_id WHERE ${emiPlansTable.name}.plan_mode = 'personal' AND ${moneyAccountsTable.name}.scope_account_remote_id = ? AND ${moneyAccountsTable.name}.deleted_at IS NULL AND ${emiPlansTable.name}.deleted_at IS NULL;`,
    values: [scope.activeAccountRemoteId],
  };
};

const buildScopedEmiInstallmentQuery = (scope: ExportScope): ScopedQuery => {
  if (scope.activeAccountType === AccountType.Business) {
    return {
      sql: `SELECT ${emiInstallmentsTable.name}.* FROM ${emiInstallmentsTable.name} INNER JOIN ${emiPlansTable.name} ON ${emiPlansTable.name}.remote_id = ${emiInstallmentsTable.name}.plan_remote_id WHERE ${emiPlansTable.name}.plan_mode = 'business' AND ${emiPlansTable.name}.business_account_remote_id = ? AND ${emiPlansTable.name}.deleted_at IS NULL;`,
      values: [scope.activeAccountRemoteId],
    };
  }

  return {
    sql: `SELECT ${emiInstallmentsTable.name}.* FROM ${emiInstallmentsTable.name} INNER JOIN ${emiPlansTable.name} ON ${emiPlansTable.name}.remote_id = ${emiInstallmentsTable.name}.plan_remote_id INNER JOIN ${moneyAccountsTable.name} ON ${moneyAccountsTable.name}.remote_id = ${emiPlansTable.name}.linked_account_remote_id WHERE ${emiPlansTable.name}.plan_mode = 'personal' AND ${moneyAccountsTable.name}.scope_account_remote_id = ? AND ${moneyAccountsTable.name}.deleted_at IS NULL AND ${emiPlansTable.name}.deleted_at IS NULL;`,
    values: [scope.activeAccountRemoteId],
  };
};

const buildScopedInstallmentPaymentLinkQuery = (
  scope: ExportScope,
): ScopedQuery => {
  if (scope.activeAccountType === AccountType.Business) {
    return {
      sql: `SELECT ${installmentPaymentLinksTable.name}.* FROM ${installmentPaymentLinksTable.name} INNER JOIN ${emiPlansTable.name} ON ${emiPlansTable.name}.remote_id = ${installmentPaymentLinksTable.name}.plan_remote_id WHERE ${emiPlansTable.name}.plan_mode = 'business' AND ${emiPlansTable.name}.business_account_remote_id = ? AND ${emiPlansTable.name}.deleted_at IS NULL;`,
      values: [scope.activeAccountRemoteId],
    };
  }

  return {
    sql: `SELECT ${installmentPaymentLinksTable.name}.* FROM ${installmentPaymentLinksTable.name} INNER JOIN ${emiPlansTable.name} ON ${emiPlansTable.name}.remote_id = ${installmentPaymentLinksTable.name}.plan_remote_id INNER JOIN ${moneyAccountsTable.name} ON ${moneyAccountsTable.name}.remote_id = ${emiPlansTable.name}.linked_account_remote_id WHERE ${emiPlansTable.name}.plan_mode = 'personal' AND ${moneyAccountsTable.name}.scope_account_remote_id = ? AND ${moneyAccountsTable.name}.deleted_at IS NULL AND ${emiPlansTable.name}.deleted_at IS NULL;`,
    values: [scope.activeAccountRemoteId],
  };
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
        buildScopedQuery: buildDirectScopedQuery(
          transactionsTable.name,
          "account_remote_id",
        ),
      },
    ],
  },
  [SettingsDataTransferModule.Products]: {
    label: "Products",
    tables: [
      {
        tableName: productsTable.name,
        columns: castTableColumns(productsTable.columns),
        buildScopedQuery: buildDirectScopedQuery(
          productsTable.name,
          "account_remote_id",
        ),
      },
    ],
  },
  [SettingsDataTransferModule.Contacts]: {
    label: "Contacts",
    tables: [
      {
        tableName: contactsTable.name,
        columns: castTableColumns(contactsTable.columns),
        buildScopedQuery: buildDirectScopedQuery(
          contactsTable.name,
          "account_remote_id",
        ),
      },
    ],
  },
  [SettingsDataTransferModule.Orders]: {
    label: "Orders",
    tables: [
      {
        tableName: ordersTable.name,
        columns: castTableColumns(ordersTable.columns),
        buildScopedQuery: buildDirectScopedQuery(
          ordersTable.name,
          "account_remote_id",
        ),
      },
      {
        tableName: orderLinesTable.name,
        columns: castTableColumns(orderLinesTable.columns),
        buildScopedQuery: (scope) => ({
          sql: `SELECT ${orderLinesTable.name}.* FROM ${orderLinesTable.name} INNER JOIN ${ordersTable.name} ON ${ordersTable.name}.remote_id = ${orderLinesTable.name}.order_remote_id WHERE ${ordersTable.name}.account_remote_id = ? AND ${ordersTable.name}.deleted_at IS NULL AND ${orderLinesTable.name}.deleted_at IS NULL;`,
          values: [scope.activeAccountRemoteId],
        }),
      },
    ],
  },
  [SettingsDataTransferModule.Budgets]: {
    label: "Budgets",
    tables: [
      {
        tableName: budgetPlansTable.name,
        columns: castTableColumns(budgetPlansTable.columns),
        buildScopedQuery: buildDirectScopedQuery(
          budgetPlansTable.name,
          "account_remote_id",
        ),
      },
    ],
  },
  [SettingsDataTransferModule.Ledger]: {
    label: "Ledger",
    tables: [
      {
        tableName: ledgerEntriesTable.name,
        columns: castTableColumns(ledgerEntriesTable.columns),
        buildScopedQuery: buildDirectScopedQuery(
          ledgerEntriesTable.name,
          "business_account_remote_id",
        ),
      },
    ],
  },
  [SettingsDataTransferModule.EmiLoans]: {
    label: "EMI & Loans",
    tables: [
      {
        tableName: emiPlansTable.name,
        columns: castTableColumns(emiPlansTable.columns),
        buildScopedQuery: buildScopedEmiPlanQuery,
      },
      {
        tableName: emiInstallmentsTable.name,
        columns: castTableColumns(emiInstallmentsTable.columns),
        buildScopedQuery: buildScopedEmiInstallmentQuery,
      },
      {
        tableName: installmentPaymentLinksTable.name,
        columns: castTableColumns(installmentPaymentLinksTable.columns),
        buildScopedQuery: buildScopedInstallmentPaymentLinkQuery,
      },
    ],
  },
  [SettingsDataTransferModule.Accounts]: {
    label: "Accounts",
    tables: [
      {
        tableName: moneyAccountsTable.name,
        columns: castTableColumns(moneyAccountsTable.columns),
        buildScopedQuery: buildDirectScopedQuery(
          moneyAccountsTable.name,
          "scope_account_remote_id",
        ),
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

const cloneRows = <TRow extends Record<string, unknown>>(
  rows: readonly TRow[],
): readonly TRow[] => {
  return rows.map((row) => ({ ...row }));
};

const fetchScopedRows = async (
  database: Database,
  table: TransferTableDefinition,
  scope: ExportScope,
): Promise<readonly Record<string, unknown>[]> => {
  const collection = database.get<Model>(table.tableName);
  const scopedQuery = table.buildScopedQuery(scope);

  return collection
    .query(Q.unsafeSqlQuery(scopedQuery.sql, [...scopedQuery.values]))
    .unsafeFetchRaw();
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
          help_faq_items: cloneRows(SETTINGS_HELP_FAQ_ITEMS),
          support_contact_items: cloneRows(SETTINGS_SUPPORT_CONTACT_ITEMS),
          terms_document_items: cloneRows(SETTINGS_TERMS_DOCUMENT_ITEMS),
          data_right_items: cloneRows(SETTINGS_DATA_RIGHT_ITEMS),
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

      if (
        !Number.isInteger(payload.starCount) ||
        payload.starCount < 1 ||
        payload.starCount > 5
      ) {
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

  async exportDataBundle(payload): Promise<
    Result<{
      version: 1;
      exportedAt: number;
      modules: readonly {
        moduleId: SettingsDataTransferModuleValue;
        label: string;
        tables: readonly SettingsDataTransferTable[];
      }[];
    }>
  > {
    try {
      const deduplicatedModuleIds = [...new Set(payload.moduleIds)];
      const scope: ExportScope = {
        activeAccountRemoteId: payload.activeAccountRemoteId,
        activeAccountType: payload.activeAccountType,
      };
      const modules: {
        moduleId: SettingsDataTransferModuleValue;
        label: string;
        tables: readonly SettingsDataTransferTable[];
      }[] = [];

      for (const moduleId of deduplicatedModuleIds) {
        const moduleDefinition = getModuleDefinition(moduleId);
        if (!moduleDefinition) {
          continue;
        }

        const tables: SettingsDataTransferTable[] = [];

        for (const table of moduleDefinition.tables) {
          const rows = await fetchScopedRows(database, table, scope);

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

  async importDataBundle(_payload): Promise<
    Result<{
      moduleId: SettingsDataTransferModuleValue;
      importedRowCount: number;
      skippedRowCount: number;
    }>
  > {
    return {
      success: false,
      error: new Error(SETTINGS_IMPORT_DISABLED_MESSAGE),
    };
  },
});
