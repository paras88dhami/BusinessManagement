import { TaxCalculatorRepository } from "@/feature/appSettings/taxCalculator/data/repository/taxCalculator.repository";
import {
  CalculateTaxBreakdownPayload,
  TaxBreakdown,
  TaxBreakdownResult,
  TaxCalculationMode,
  TaxCalculatorPresetNotFoundError,
  TaxCalculatorUnknownError,
  TaxCalculatorValidationError,
} from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";
import { CalculateTaxBreakdownUseCase } from "./calculateTaxBreakdown.useCase";

const roundCurrency = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const buildBreakdown = (
  payload: CalculateTaxBreakdownPayload,
  presetLabel: string,
  ratePercent: number,
): TaxBreakdown => {
  const rateFactor = ratePercent / 100;

  if (payload.mode === TaxCalculationMode.Inclusive) {
    const totalAmount = roundCurrency(payload.amount);
    const subtotalAmount = roundCurrency(totalAmount / (1 + rateFactor));
    const taxAmount = roundCurrency(totalAmount - subtotalAmount);

    return {
      presetCode: payload.presetCode,
      presetLabel,
      ratePercent,
      mode: payload.mode,
      subtotalAmount,
      taxAmount,
      totalAmount,
    };
  }

  const subtotalAmount = roundCurrency(payload.amount);
  const taxAmount = roundCurrency(subtotalAmount * rateFactor);
  const totalAmount = roundCurrency(subtotalAmount + taxAmount);

  return {
    presetCode: payload.presetCode,
    presetLabel,
    ratePercent,
    mode: payload.mode,
    subtotalAmount,
    taxAmount,
    totalAmount,
  };
};

export const createCalculateTaxBreakdownUseCase = (
  repository: TaxCalculatorRepository,
): CalculateTaxBreakdownUseCase => ({
  async execute(payload: CalculateTaxBreakdownPayload): Promise<TaxBreakdownResult> {
    try {
      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        return {
          success: false,
          error: TaxCalculatorValidationError(
            "Enter a valid amount greater than zero.",
          ),
        };
      }

      if (!payload.presetCode.trim()) {
        return {
          success: false,
          error: TaxCalculatorValidationError("Select a tax preset to continue."),
        };
      }

      const presetResult = await repository.getTaxToolPresetByCode(payload.presetCode);
      if (!presetResult.success) {
        return presetResult;
      }

      const preset = presetResult.value;
      if (!preset) {
        return {
          success: false,
          error: TaxCalculatorPresetNotFoundError,
        };
      }

      return {
        success: true,
        value: buildBreakdown(payload, preset.label, preset.ratePercent),
      };
    } catch {
      return {
        success: false,
        error: TaxCalculatorUnknownError,
      };
    }
  },
});
