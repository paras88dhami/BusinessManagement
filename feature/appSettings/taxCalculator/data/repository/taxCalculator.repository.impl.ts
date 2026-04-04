import {
  TaxCalculatorDatasourceError,
  TaxCalculatorUnknownError,
  TaxToolPresetResult,
  TaxToolPresetsResult,
} from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";
import { TaxCalculatorDatasource } from "@/feature/appSettings/taxCalculator/data/dataSource/taxCalculator.datasource";
import { TaxCalculatorRepository } from "./taxCalculator.repository";
import { mapTaxToolPresetRecordToEntity } from "./mapper/taxCalculator.mapper";

const mapDatasourceError = (): typeof TaxCalculatorDatasourceError => {
  return TaxCalculatorDatasourceError;
};

export const createTaxCalculatorRepository = (
  datasource: TaxCalculatorDatasource,
): TaxCalculatorRepository => ({
  async getTaxToolPresets(): Promise<TaxToolPresetsResult> {
    try {
      const result = await datasource.getTaxToolPresets();

      if (!result.success) {
        return {
          success: false,
          error: mapDatasourceError(),
        };
      }

      return {
        success: true,
        value: result.value.map(mapTaxToolPresetRecordToEntity),
      };
    } catch {
      return {
        success: false,
        error: TaxCalculatorUnknownError,
      };
    }
  },

  async getTaxToolPresetByCode(code: string): Promise<TaxToolPresetResult> {
    try {
      const result = await datasource.getTaxToolPresetByCode(code);

      if (!result.success) {
        return {
          success: false,
          error: mapDatasourceError(),
        };
      }

      return {
        success: true,
        value: result.value ? mapTaxToolPresetRecordToEntity(result.value) : null,
      };
    } catch {
      return {
        success: false,
        error: TaxCalculatorUnknownError,
      };
    }
  },
});
