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
import {
  formatCurrencyAmount,
  resolveCurrencyPrefix,
} from "@/shared/utils/currency/accountCurrency";
import { resolveRegionalFinancePolicy } from "@/shared/utils/finance/regionalFinancePolicy";

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
  currencyCode: string,
  countryCode: string | null,
  taxLabel: string,
): TaxCalculationSummaryState => ({
  presetLabel: `${taxLabel} ${breakdown.ratePercent}%`,
  modeLabel:
    breakdown.mode === TaxCalculationMode.Inclusive
      ? "Tax Inclusive"
      : "Tax Exclusive",
  subtotalLabel: formatCurrencyAmount({
    amount: breakdown.subtotalAmount,
    currencyCode,
    countryCode,
    maximumFractionDigits: 2,
  }),
  taxAmountLabel: formatCurrencyAmount({
    amount: breakdown.taxAmount,
    currencyCode,
    countryCode,
    maximumFractionDigits: 2,
  }),
  totalAmountLabel: formatCurrencyAmount({
    amount: breakdown.totalAmount,
    currencyCode,
    countryCode,
    maximumFractionDigits: 2,
  }),
});

type Params = {
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  activeAccountDefaultTaxRatePercent: number | null;
  activeAccountDefaultTaxMode: TaxCalculationModeValue | null;
  getTaxCalculatorPresetsUseCase: GetTaxCalculatorPresetsUseCase;
  calculateTaxBreakdownUseCase: CalculateTaxBreakdownUseCase;
};

export const useTaxCalculatorViewModel = ({
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  activeAccountDefaultTaxRatePercent,
  activeAccountDefaultTaxMode,
  getTaxCalculatorPresetsUseCase,
  calculateTaxBreakdownUseCase,
}: Params): TaxCalculatorScreenViewModel => {
  const regionalFinancePolicy = useMemo(
    () =>
      resolveRegionalFinancePolicy({
        countryCode: activeAccountCountryCode,
        currencyCode: activeAccountCurrencyCode,
        defaultTaxRatePercent: activeAccountDefaultTaxRatePercent,
        defaultTaxMode: activeAccountDefaultTaxMode,
      }),
    [
      activeAccountCountryCode,
      activeAccountCurrencyCode,
      activeAccountDefaultTaxMode,
      activeAccountDefaultTaxRatePercent,
    ],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [calculationErrorMessage, setCalculationErrorMessage] =
    useState<string | null>(null);
  const [presets, setPresets] = useState<readonly TaxToolPreset[]>([]);
  const [selectedPresetCode, setSelectedPresetCode] = useState("");
  const [selectedMode, setSelectedMode] = useState<TaxCalculationModeValue>(
    regionalFinancePolicy.defaultTaxMode,
  );
  const [amountInput, setAmountInput] = useState("");
  const [calculationSummary, setCalculationSummary] =
    useState<TaxCalculationSummaryState | null>(null);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const currencyCode = regionalFinancePolicy.currencyCode;
  const amountInputPlaceholder = useMemo(() => {
    const currencyPrefix = resolveCurrencyPrefix({
      currencyCode,
      countryCode: regionalFinancePolicy.countryCode,
    });
    return `Enter Amount (${currencyPrefix})`;
  }, [currencyCode, regionalFinancePolicy.countryCode]);

  useEffect(() => {
    setSelectedMode(regionalFinancePolicy.defaultTaxMode);
  }, [regionalFinancePolicy.defaultTaxMode]);

  const loadPresets = useCallback(async () => {
    setIsLoading(true);
    const result = await getTaxCalculatorPresetsUseCase.execute();

    if (!result.success) {
      setPresets([]);
      setSelectedPresetCode("");
      setLoadErrorMessage(result.error.message);
      setCalculationErrorMessage(null);
      setCalculationSummary(null);
      setIsLoading(false);
      return;
    }

    const presetsByRate = new Map(
      result.value.map((preset) => [preset.ratePercent, preset]),
    );
    const filteredPresets = regionalFinancePolicy.taxRateOptions
      .map((ratePercent) => presetsByRate.get(ratePercent))
      .filter((preset): preset is TaxToolPreset => Boolean(preset));
    const nextPresets = filteredPresets.length > 0 ? filteredPresets : result.value;

    setPresets(nextPresets);
    setSelectedPresetCode((current) => {
      if (current && nextPresets.some((preset) => preset.code === current)) {
        return current;
      }

      const defaultPreset = nextPresets.find(
        (preset) =>
          preset.ratePercent === regionalFinancePolicy.defaultTaxRatePercent,
      );

      return defaultPreset?.code ?? nextPresets[0]?.code ?? "";
    });
    setLoadErrorMessage(null);
    setCalculationErrorMessage(null);
    setIsLoading(false);
  }, [
    getTaxCalculatorPresetsUseCase,
    regionalFinancePolicy.defaultTaxRatePercent,
    regionalFinancePolicy.taxRateOptions,
  ]);

  useEffect(() => {
    void loadPresets();
  }, [loadPresets]);

  useEffect(() => {
    if (loadErrorMessage) {
      setCalculationSummary(null);
      setCalculationErrorMessage(null);
      return;
    }

    const amount = parseAmountInput(amountInput);

    if (amount === null) {
      setCalculationSummary(null);
      if (amountInput.trim()) {
        setCalculationErrorMessage("Enter a valid amount greater than zero.");
      } else {
        setCalculationErrorMessage(null);
      }
      return;
    }

    if (!selectedPresetCode) {
      setCalculationSummary(null);
      if (!isLoading) {
        setCalculationErrorMessage("Select a tax preset to continue.");
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
        setCalculationErrorMessage(result.error.message);
        return;
      }

      setCalculationSummary(
        buildCalculationSummary(
          result.value,
          currencyCode,
          regionalFinancePolicy.countryCode,
          regionalFinancePolicy.taxLabel,
        ),
      );
      setCalculationErrorMessage(null);
    };

    void calculate();

    return () => {
      isMounted = false;
    };
  }, [
    amountInput,
    calculateTaxBreakdownUseCase,
    currencyCode,
    isLoading,
    loadErrorMessage,
    regionalFinancePolicy.countryCode,
    regionalFinancePolicy.taxLabel,
    selectedMode,
    selectedPresetCode,
  ]);

  const presetOptions = useMemo(
    () =>
      presets.map((preset) => ({
        label: `${regionalFinancePolicy.taxLabel} ${preset.ratePercent}%`,
        value: preset.code,
      })),
    [presets, regionalFinancePolicy.taxLabel],
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

  const errorMessage = calculationErrorMessage ?? loadErrorMessage;

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      isCalculatorVisible,
      amountInput,
      amountInputPlaceholder,
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
      amountInputPlaceholder,
      calculationSummary,
      calculationErrorMessage,
      errorMessage,
      isCalculatorVisible,
      isLoading,
      loadErrorMessage,
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
