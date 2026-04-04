import { Result } from "@/shared/types/result.types";
import {
  TaxCalculatorDatasource,
  TaxToolPresetRecord,
} from "./taxCalculator.datasource";

const TAX_TOOL_PRESET_RECORDS: readonly TaxToolPresetRecord[] = [
  { code: "gst_5", label: "GST 5%", rate_percent: 5 },
  { code: "gst_12", label: "GST 12%", rate_percent: 12 },
  { code: "vat_13", label: "VAT 13%", rate_percent: 13 },
  { code: "gst_18", label: "GST 18%", rate_percent: 18 },
  { code: "gst_28", label: "GST 28%", rate_percent: 28 },
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
