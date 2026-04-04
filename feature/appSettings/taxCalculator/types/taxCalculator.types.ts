import { Result } from "@/shared/types/result.types";

export const TaxCalculationMode = {
  Exclusive: "tax_exclusive",
  Inclusive: "tax_inclusive",
} as const;

export type TaxCalculationModeValue =
  (typeof TaxCalculationMode)[keyof typeof TaxCalculationMode];

export type TaxToolPreset = {
  code: string;
  label: string;
  ratePercent: number;
};

export type TaxToolPresetOption = {
  label: string;
  value: string;
};

export type CalculateTaxBreakdownPayload = {
  amount: number;
  presetCode: string;
  mode: TaxCalculationModeValue;
};

export type TaxBreakdown = {
  presetCode: string;
  presetLabel: string;
  ratePercent: number;
  mode: TaxCalculationModeValue;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
};

export const TaxCalculatorErrorType = {
  ValidationError: "VALIDATION_ERROR",
  PresetNotFound: "PRESET_NOT_FOUND",
  DataSourceError: "DATASOURCE_ERROR",
  UnknownError: "UNKNOWN_ERROR",
} as const;

export type TaxCalculatorError = {
  type: (typeof TaxCalculatorErrorType)[keyof typeof TaxCalculatorErrorType];
  message: string;
};

export const TaxCalculatorValidationError = (
  message: string,
): TaxCalculatorError => ({
  type: TaxCalculatorErrorType.ValidationError,
  message,
});

export const TaxCalculatorPresetNotFoundError: TaxCalculatorError = {
  type: TaxCalculatorErrorType.PresetNotFound,
  message: "The selected tax preset was not found.",
};

export const TaxCalculatorDatasourceError: TaxCalculatorError = {
  type: TaxCalculatorErrorType.DataSourceError,
  message: "Unable to load tax presets right now. Please try again.",
};

export const TaxCalculatorUnknownError: TaxCalculatorError = {
  type: TaxCalculatorErrorType.UnknownError,
  message: "An unexpected tax calculator error occurred.",
};

export type TaxToolPresetsResult = Result<TaxToolPreset[], TaxCalculatorError>;
export type TaxToolPresetResult = Result<TaxToolPreset | null, TaxCalculatorError>;
export type TaxBreakdownResult = Result<TaxBreakdown, TaxCalculatorError>;

export const TAX_CALCULATION_MODE_OPTIONS = [
  { label: "Tax Exclusive", value: TaxCalculationMode.Exclusive },
  { label: "Tax Inclusive", value: TaxCalculationMode.Inclusive },
] as const;
