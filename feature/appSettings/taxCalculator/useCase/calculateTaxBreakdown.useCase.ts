import {
  CalculateTaxBreakdownPayload,
  TaxBreakdownResult,
} from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";

export interface CalculateTaxBreakdownUseCase {
  execute(payload: CalculateTaxBreakdownPayload): Promise<TaxBreakdownResult>;
}
