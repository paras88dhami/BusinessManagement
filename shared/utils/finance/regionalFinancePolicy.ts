import {
  RegionalFinanceCountryProfile,
  RegionalFinanceOption,
  ResolvedRegionalFinancePolicy,
  ResolveRegionalFinancePolicyParams,
  TaxMode,
  TaxModeValue,
} from "@/shared/types/regionalFinance.types";

const COUNTRY_PROFILES: Record<string, RegionalFinanceCountryProfile> = {
  NP: {
    countryCode: "NP",
    countryName: "Nepal",
    locale: "en-NP",
    currencyCode: "NPR",
    currencyPrefix: "Rs",
    taxLabel: "VAT",
    defaultTaxRatePercent: 13,
    taxRateOptions: [0, 5, 13],
  },
  IN: {
    countryCode: "IN",
    countryName: "India",
    locale: "en-IN",
    currencyCode: "INR",
    currencyPrefix: "INR",
    taxLabel: "GST",
    defaultTaxRatePercent: 18,
    taxRateOptions: [0, 5, 12, 18, 28],
  },
  BD: {
    countryCode: "BD",
    countryName: "Bangladesh",
    locale: "en-BD",
    currencyCode: "BDT",
    currencyPrefix: "BDT",
    taxLabel: "VAT",
    defaultTaxRatePercent: 15,
    taxRateOptions: [0, 5, 7.5, 10, 15],
  },
} as const;

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  NP: "NP",
  NEPAL: "NP",
  NPL: "NP",
  IN: "IN",
  INDIA: "IN",
  IND: "IN",
  BD: "BD",
  BANGLADESH: "BD",
  BGD: "BD",
};

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  NPR: "NP",
  INR: "IN",
  BDT: "BD",
};

const DEFAULT_COUNTRY_CODE = "NP";

const isValidTaxMode = (value: string | null | undefined): value is TaxModeValue =>
  value === TaxMode.Exclusive || value === TaxMode.Inclusive;

const normalizeUpper = (value: string | null | undefined): string =>
  value?.trim().toUpperCase() ?? "";

const resolveCountryCode = (
  countryCode: string | null | undefined,
  currencyCode: string | null | undefined,
): string => {
  const normalizedCountry = normalizeUpper(countryCode);
  if (normalizedCountry) {
    const mappedCountry = COUNTRY_NAME_ALIASES[normalizedCountry];
    if (mappedCountry) {
      return mappedCountry;
    }
  }

  const normalizedCurrency = normalizeUpper(currencyCode);
  if (normalizedCurrency && CURRENCY_TO_COUNTRY[normalizedCurrency]) {
    return CURRENCY_TO_COUNTRY[normalizedCurrency];
  }

  return DEFAULT_COUNTRY_CODE;
};

const resolveCurrencyCode = (
  inputCurrencyCode: string | null | undefined,
  fallbackProfileCurrencyCode: string,
): string => {
  const normalizedCurrency = normalizeUpper(inputCurrencyCode);
  if (normalizedCurrency.length === 3) {
    return normalizedCurrency;
  }

  return fallbackProfileCurrencyCode;
};

const resolveDefaultTaxRatePercent = (
  preferredRate: number | null | undefined,
  profile: RegionalFinanceCountryProfile,
): number => {
  if (typeof preferredRate === "number" && Number.isFinite(preferredRate) && preferredRate >= 0) {
    return preferredRate;
  }

  return profile.defaultTaxRatePercent;
};

export const getRegionalFinanceCountryOptions = (): readonly RegionalFinanceOption[] =>
  Object.values(COUNTRY_PROFILES).map((profile) => ({
    label: profile.countryName,
    value: profile.countryCode,
  }));

export const getTaxModeOptions = (): readonly RegionalFinanceOption[] => [
  { label: "Tax Exclusive", value: TaxMode.Exclusive },
  { label: "Tax Inclusive", value: TaxMode.Inclusive },
];

export const resolveRegionalFinancePolicy = (
  params: ResolveRegionalFinancePolicyParams,
): ResolvedRegionalFinancePolicy => {
  const countryCode = resolveCountryCode(params.countryCode, params.currencyCode);
  const profile = COUNTRY_PROFILES[countryCode] ?? COUNTRY_PROFILES[DEFAULT_COUNTRY_CODE];
  const resolvedCurrencyCode = resolveCurrencyCode(params.currencyCode, profile.currencyCode);
  const resolvedTaxMode = isValidTaxMode(params.defaultTaxMode)
    ? params.defaultTaxMode
    : TaxMode.Exclusive;
  const resolvedTaxRate = resolveDefaultTaxRatePercent(params.defaultTaxRatePercent, profile);

  return {
    countryCode: profile.countryCode,
    countryName: profile.countryName,
    locale: profile.locale,
    currencyCode: resolvedCurrencyCode,
    currencyPrefix: profile.currencyCode === resolvedCurrencyCode
      ? profile.currencyPrefix
      : resolvedCurrencyCode,
    taxLabel: profile.taxLabel,
    taxRateOptions: profile.taxRateOptions,
    defaultTaxRatePercent: resolvedTaxRate,
    defaultTaxMode: resolvedTaxMode,
  };
};

export const buildTaxRateLabel = (ratePercent: number): string => `${ratePercent}%`;

export const buildTaxSummaryLabel = ({
  taxLabel,
  taxRatePercent,
}: {
  taxLabel: string;
  taxRatePercent: number;
}): string => `${taxLabel} (${taxRatePercent}%)`;
