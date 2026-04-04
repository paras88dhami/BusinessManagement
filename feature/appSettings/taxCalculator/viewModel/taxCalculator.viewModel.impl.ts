import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TaxBreakdown,
  TaxCalculationMode,
  TaxCalculationModeValue,
  TaxToolPreset,
} from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";
import { CalculateTaxBreakdownUseCase } from "@/feature/appSettings/taxCalculator/useCase/calculateTaxBreakdown.useCase";
import { GetTaxCalculatorPresetsUseCase } from "@/feature/appSettings/taxCalculator/useCase/getTaxCalculatorPresets.useCase";
import {
  TaxCalculatorScreenViewModel,
  TaxCalculationSummaryState,
} from "./taxCalculator.viewModel";

const formatCurrency = (value: number): string => {
  return `NPR ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const parseAmountInput = (value: string): number | null => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
};

const buildCalculationSummary = (
  breakdown: TaxBreakdown,
): TaxCalculationSummaryState => ({
  presetLabel: breakdown.presetLabel,
  modeLabel:
    breakdown.mode === TaxCalculationMode.Inclusive
      ? "Tax Inclusive"
      : "Tax Exclusive",
  subtotalLabel: formatCurrency(breakdown.subtotalAmount),
  taxAmountLabel: formatCurrency(breakdown.taxAmount),
  totalAmountLabel: formatCurrency(breakdown.totalAmount),
});

type Params = {
  getTaxCalculatorPresetsUseCase: GetTaxCalculatorPresetsUseCase;
  calculateTaxBreakdownUseCase: CalculateTaxBreakdownUseCase;
};

export const useTaxCalculatorViewModel = ({
  getTaxCalculatorPresetsUseCase,
  calculateTaxBreakdownUseCase,
}: Params): TaxCalculatorScreenViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [presets, setPresets] = useState<readonly TaxToolPreset[]>([]);
  const [selectedPresetCode, setSelectedPresetCode] = useState("");
  const [selectedMode, setSelectedMode] = useState<TaxCalculationModeValue>(
    TaxCalculationMode.Exclusive,
  );
  const [amountInput, setAmountInput] = useState("");
  const [calculationSummary, setCalculationSummary] =
    useState<TaxCalculationSummaryState | null>(null);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  const loadPresets = useCallback(async () => {
    setIsLoading(true);
    const result = await getTaxCalculatorPresetsUseCase.execute();

    if (!result.success) {
      setPresets([]);
      setSelectedPresetCode("");
      setErrorMessage(result.error.message);
      setCalculationSummary(null);
      setIsLoading(false);
      return;
    }

    setPresets(result.value);
    setSelectedPresetCode((current) => {
      if (current && result.value.some((preset) => preset.code === current)) {
        return current;
      }

      return result.value[2]?.code ?? result.value[0]?.code ?? "";
    });
    setErrorMessage(null);
    setIsLoading(false);
  }, [getTaxCalculatorPresetsUseCase]);

  useEffect(() => {
    void loadPresets();
  }, [loadPresets]);

  useEffect(() => {
    const amount = parseAmountInput(amountInput);

    if (amount === null) {
      setCalculationSummary(null);
      if (amountInput.trim()) {
        setErrorMessage("Enter a valid amount greater than zero.");
      } else {
        setErrorMessage(null);
      }
      return;
    }

    if (!selectedPresetCode) {
      setCalculationSummary(null);
      if (!isLoading) {
        setErrorMessage("Select a tax preset to continue.");
      }
      return;
    }

    let isMounted = true;

    const calculate = async () => {
      const result = await calculateTaxBreakdownUseCase.execute({
        amount,
        presetCode: selectedPresetCode,
        mode: selectedMode,
      });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setCalculationSummary(null);
        setErrorMessage(result.error.message);
        return;
      }

      setCalculationSummary(buildCalculationSummary(result.value));
      setErrorMessage(null);
    };

    void calculate();

    return () => {
      isMounted = false;
    };
  }, [
    amountInput,
    calculateTaxBreakdownUseCase,
    isLoading,
    selectedMode,
    selectedPresetCode,
  ]);

  const presetOptions = useMemo(
    () => presets.map((preset) => ({ label: preset.label, value: preset.code })),
    [presets],
  );

  const onOpenCalculator = useCallback(() => {
    if (presets.length === 0) {
      return;
    }

    setIsCalculatorVisible(true);
  }, [presets.length]);

  const onCloseCalculator = useCallback(() => {
    setIsCalculatorVisible(false);
  }, []);

  const onAmountChange = useCallback((value: string) => {
    setAmountInput(value);
  }, []);

  const onPresetChange = useCallback((value: string) => {
    setSelectedPresetCode(value);
  }, []);

  const onModeChange = useCallback((value: TaxCalculationModeValue) => {
    setSelectedMode(value);
  }, []);

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      isCalculatorVisible,
      amountInput,
      selectedPresetCode,
      selectedMode,
      presetOptions,
      calculationSummary,
      settingsSectionTitle: "Tools",
      taxToolTitle: "Tax / GST / VAT Calculator",
      taxToolSubtitle: "Calculate tax on amounts",
      onRefresh: loadPresets,
      onOpenCalculator,
      onCloseCalculator,
      onAmountChange,
      onPresetChange,
      onModeChange,
    }),
    [
      amountInput,
      calculationSummary,
      errorMessage,
      isCalculatorVisible,
      isLoading,
      loadPresets,
      onAmountChange,
      onCloseCalculator,
      onModeChange,
      onOpenCalculator,
      onPresetChange,
      presetOptions,
      selectedMode,
      selectedPresetCode,
    ],
  );
};

