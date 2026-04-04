import { TaxToolPreset } from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";
import { TaxToolPresetRecord } from "@/feature/appSettings/taxCalculator/data/dataSource/taxCalculator.datasource";

export const mapTaxToolPresetRecordToEntity = (
  record: TaxToolPresetRecord,
): TaxToolPreset => ({
  code: record.code,
  label: record.label,
  ratePercent: record.rate_percent,
});
