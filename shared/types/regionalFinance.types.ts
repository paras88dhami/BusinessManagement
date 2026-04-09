export const TaxMode = {
  Exclusive: "tax_exclusive",
  Inclusive: "tax_inclusive",
} as const;

export type TaxModeValue = (typeof TaxMode)[keyof typeof TaxMode];

export type RegionalFinanceCountryProfile = {
  countryCode: string;
  countryName: string;
  locale: string;
  currencyCode: string;
  currencyPrefix: string;
  taxLabel: string;
  defaultTaxRatePercent: number;
  taxRateOptions: readonly number[];
};

export type ResolveRegionalFinancePolicyParams = {
  countryCode?: string | null;
  currencyCode?: string | null;
  defaultTaxRatePercent?: number | null;
  defaultTaxMode?: TaxModeValue | null;
};

export type ResolvedRegionalFinancePolicy = {
  countryCode: string;
  countryName: string;
  locale: string;
  currencyCode: string;
  currencyPrefix: string;
  taxLabel: string;
  taxRateOptions: readonly number[];
  defaultTaxRatePercent: number;
  defaultTaxMode: TaxModeValue;
};

export type RegionalFinanceOption = {
  label: string;
  value: string;
};
