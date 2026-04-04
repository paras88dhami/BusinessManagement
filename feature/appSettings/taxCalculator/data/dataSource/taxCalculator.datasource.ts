import { Result } from "@/shared/types/result.types";

export type TaxToolPresetRecord = {
  code: string;
  label: string;
  rate_percent: number;
};

export interface TaxCalculatorDatasource {
  getTaxToolPresets(): Promise<Result<TaxToolPresetRecord[]>>;
  getTaxToolPresetByCode(code: string): Promise<Result<TaxToolPresetRecord | null>>;
}
