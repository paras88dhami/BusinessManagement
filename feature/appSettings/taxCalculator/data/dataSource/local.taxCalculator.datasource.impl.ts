import { Result } from "@/shared/types/result.types";
import {
  TaxCalculatorDatasource,
  TaxToolPresetRecord,
} from "./taxCalculator.datasource";

const TAX_TOOL_PRESET_RECORDS: readonly TaxToolPresetRecord[] = [
  { code: "tax_0", label: "Tax 0%", rate_percent: 0 },
  { code: "tax_5", label: "Tax 5%", rate_percent: 5 },
  { code: "tax_7_5", label: "Tax 7.5%", rate_percent: 7.5 },
  { code: "tax_10", label: "Tax 10%", rate_percent: 10 },
  { code: "tax_12", label: "Tax 12%", rate_percent: 12 },
  { code: "tax_13", label: "Tax 13%", rate_percent: 13 },
  { code: "tax_15", label: "Tax 15%", rate_percent: 15 },
  { code: "tax_18", label: "Tax 18%", rate_percent: 18 },
  { code: "tax_28", label: "Tax 28%", rate_percent: 28 },
] as const;

export const createLocalTaxCalculatorDatasource = (): TaxCalculatorDatasource => ({
  async getTaxToolPresets(): Promise<Result<TaxToolPresetRecord[]>> {
    try {
      return {
        success: true,
        value: [...TAX_TOOL_PRESET_RECORDS],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getTaxToolPresetByCode(code: string): Promise<Result<TaxToolPresetRecord | null>> {
    try {
      const normalizedCode = code.trim();
      const preset =
        TAX_TOOL_PRESET_RECORDS.find((item) => item.code === normalizedCode) ?? null;

      return {
        success: true,
        value: preset,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
