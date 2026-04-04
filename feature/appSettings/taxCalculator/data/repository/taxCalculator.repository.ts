import {
  TaxToolPresetResult,
  TaxToolPresetsResult,
} from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";

export interface TaxCalculatorRepository {
  getTaxToolPresets(): Promise<TaxToolPresetsResult>;
  getTaxToolPresetByCode(code: string): Promise<TaxToolPresetResult>;
}
