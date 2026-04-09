import { resolveRegionalFinancePolicy } from "@/shared/utils/finance/regionalFinancePolicy";

type CurrencyResolutionParams = {
  currencyCode?: string | null;
  countryCode?: string | null;
};

type CurrencyFormatParams = CurrencyResolutionParams & {
  amount: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export const DEFAULT_CURRENCY_CODE = "NPR";

export const resolveCurrencyCode = ({
  currencyCode,
  countryCode,
}: CurrencyResolutionParams): string => {
  return resolveRegionalFinancePolicy({ currencyCode, countryCode }).currencyCode;
};

export const resolveCurrencyPrefix = (
  params: CurrencyResolutionParams,
): string => {
  return resolveRegionalFinancePolicy(params).currencyPrefix;
};

export const formatCurrencyAmount = ({
  amount,
  currencyCode,
  countryCode,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
}: CurrencyFormatParams): string => {
  const policy = resolveRegionalFinancePolicy({ currencyCode, countryCode });
  const formattedAmount = new Intl.NumberFormat(policy.locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return `${policy.currencyPrefix} ${formattedAmount}`;
};
