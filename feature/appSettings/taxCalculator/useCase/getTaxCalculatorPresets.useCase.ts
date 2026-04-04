import { TaxToolPresetsResult } from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";

export interface GetTaxCalculatorPresetsUseCase {
  execute(): Promise<TaxToolPresetsResult>;
}
