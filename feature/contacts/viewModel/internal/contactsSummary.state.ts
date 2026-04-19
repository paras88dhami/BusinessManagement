import {
  Contact,
  ContactBalanceDirection,
  ContactBalanceDirectionValue,
} from "@/feature/contacts/types/contact.types";
import {
  ContactSummaryState,
} from "@/feature/contacts/viewModel/contacts.viewModel";
import {
  formatCurrencyAmount,
  resolveCurrencyCode,
  resolveCurrencyPrefix,
} from "@/shared/utils/currency/accountCurrency";
import { useCallback, useMemo } from "react";

type UseContactsSummaryStateParams = {
  contacts: readonly Contact[];
  currencyCode: string | null;
  countryCode: string | null;
};

type ContactsSummaryStateSlice = {
  summary: ContactSummaryState;
  currencyPrefix: string;
  openingBalancePlaceholder: string;
  getContactAmountTone: (
    contact: Contact,
  ) => ContactBalanceDirectionValue | null;
};

export const useContactsSummaryState = ({
  contacts,
  currencyCode,
  countryCode,
}: UseContactsSummaryStateParams): ContactsSummaryStateSlice => {
  const resolvedCurrencyCode = useMemo(
    () => resolveCurrencyCode({ currencyCode, countryCode }),
    [countryCode, currencyCode],
  );

  const currencyPrefix = useMemo(
    () => resolveCurrencyPrefix({ currencyCode: resolvedCurrencyCode, countryCode }),
    [countryCode, resolvedCurrencyCode],
  );

  const summary = useMemo<ContactSummaryState>(() => {
    const receiveTotal = contacts.reduce((sum, contact) => {
      return contact.openingBalanceDirection === ContactBalanceDirection.Receive
        ? sum + contact.openingBalanceAmount
        : sum;
    }, 0);

    const payTotal = contacts.reduce((sum, contact) => {
      return contact.openingBalanceDirection === ContactBalanceDirection.Pay
        ? sum + contact.openingBalanceAmount
        : sum;
    }, 0);

    return {
      totalCount: contacts.length,
      receiveAmountLabel: formatCurrencyAmount({
        amount: receiveTotal,
        currencyCode: resolvedCurrencyCode,
        countryCode,
      }),
      payAmountLabel: formatCurrencyAmount({
        amount: payTotal,
        currencyCode: resolvedCurrencyCode,
        countryCode,
      }),
    };
  }, [contacts, countryCode, resolvedCurrencyCode]);

  const openingBalancePlaceholder = useMemo(
    () => `Opening Balance (${currencyPrefix})`,
    [currencyPrefix],
  );

  const getContactAmountTone = useCallback((contact: Contact) => {
    if (!contact.openingBalanceAmount) {
      return null;
    }

    return contact.openingBalanceDirection;
  }, []);

  return {
    summary,
    currencyPrefix,
    openingBalancePlaceholder,
    getContactAmountTone,
  };
};
