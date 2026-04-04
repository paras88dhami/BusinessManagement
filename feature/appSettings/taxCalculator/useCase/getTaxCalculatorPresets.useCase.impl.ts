import { TaxCalculatorRepository } from "@/feature/appSettings/taxCalculator/data/repository/taxCalculator.repository";
import { GetTaxCalculatorPresetsUseCase } from "./getTaxCalculatorPresets.useCase";

export const createGetTaxCalculatorPresetsUseCase = (
  repository: TaxCalculatorRepository,
): GetTaxCalculatorPresetsUseCase => ({
  async execute() {
    return repository.getTaxToolPresets();
  },
});
