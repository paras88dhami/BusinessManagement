import {
  MoneyAccount,
} from "@/feature/accounts/types/moneyAccount.types";
import {
  LedgerEntry,
} from "@/feature/ledger/types/ledger.entity.types";
import {
  LedgerAccountOptionState,
  LedgerSettlementLinkOptionState,
} from "@/feature/ledger/types/ledger.state.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { requiresPaymentMode } from "./ledger.shared";
import { mapMoneyAccountToSettlementOption } from "./ledgerEditor.shared";
import {
  LedgerEditorLookupViewModel,
  UseLedgerEditorLookupViewModelParams,
} from "./ledgerEditorLookup.viewModel";

export const useLedgerEditorLookupViewModel = ({
  activeBusinessAccountRemoteId,
  activeBusinessCurrencyCode,
  state,
  setState,
  getLedgerEntriesUseCase,
  getMoneyAccountsUseCase,
  buildSettlementLinkCandidatesUseCase,
}: UseLedgerEditorLookupViewModelParams): LedgerEditorLookupViewModel => {
  const [knownParties, setKnownParties] = useState<readonly string[]>([]);
  const [knownLedgerEntries, setKnownLedgerEntries] = useState<
    readonly LedgerEntry[]
  >([]);
  const [availableSettlementAccounts, setAvailableSettlementAccounts] =
    useState<readonly LedgerAccountOptionState[]>([]);
  const [knownMoneyAccounts, setKnownMoneyAccounts] = useState<
    readonly MoneyAccount[]
  >([]);
  const [settlementLinkOptions, setSettlementLinkOptions] = useState<
    readonly LedgerSettlementLinkOptionState[]
  >([]);

  const loadMoneyAccounts = useCallback(async () => {
    if (!activeBusinessAccountRemoteId) {
      setAvailableSettlementAccounts([]);
      setKnownMoneyAccounts([]);
      return;
    }

    const moneyAccountsResult = await getMoneyAccountsUseCase.execute(
      activeBusinessAccountRemoteId,
    );
    if (!moneyAccountsResult.success) {
      setAvailableSettlementAccounts([]);
      setKnownMoneyAccounts([]);
      return;
    }

    const activeMoneyAccounts = moneyAccountsResult.value.filter(
      (moneyAccount) => moneyAccount.isActive,
    );
    const sortedActiveMoneyAccounts = [...activeMoneyAccounts].sort(
      (left, right) => {
        if (left.isPrimary && !right.isPrimary) return -1;
        if (!left.isPrimary && right.isPrimary) return 1;
        return left.name.localeCompare(right.name);
      },
    );

    setKnownMoneyAccounts(sortedActiveMoneyAccounts);
    setAvailableSettlementAccounts(
      sortedActiveMoneyAccounts.map(mapMoneyAccountToSettlementOption),
    );

    const defaultSettlementAccountRemoteId =
      sortedActiveMoneyAccounts[0]?.remoteId ?? "";
    setState((currentState) => {
      if (!requiresPaymentMode(currentState.entryType)) {
        return currentState;
      }

      if (currentState.settlementAccountRemoteId.trim().length > 0) {
        return currentState;
      }

      return {
        ...currentState,
        settlementAccountRemoteId: defaultSettlementAccountRemoteId,
      };
    });
  }, [activeBusinessAccountRemoteId, getMoneyAccountsUseCase, setState]);

  const loadKnownParties = useCallback(async () => {
    if (!activeBusinessAccountRemoteId) {
      setKnownParties([]);
      setKnownLedgerEntries([]);
      return;
    }

    const result = await getLedgerEntriesUseCase.execute({
      businessAccountRemoteId: activeBusinessAccountRemoteId,
    });

    if (!result.success) {
      setKnownLedgerEntries([]);
      return;
    }

    const deduped = new Set<string>();
    result.value.forEach((entry) => {
      const name = entry.partyName.trim();
      if (name.length > 0) {
        deduped.add(name);
      }
    });

    setKnownParties(
      Array.from(deduped.values()).sort((left, right) =>
        left.localeCompare(right),
      ),
    );
    setKnownLedgerEntries(result.value);
  }, [activeBusinessAccountRemoteId, getLedgerEntriesUseCase]);

  const partySuggestions = useMemo(() => {
    const query = state.partyName.trim().toLowerCase();
    if (query.length === 0) {
      return [] as string[];
    }

    return knownParties
      .filter((partyName) => {
        const normalized = partyName.toLowerCase();
        return normalized.includes(query) && normalized !== query;
      })
      .slice(0, 6);
  }, [knownParties, state.partyName]);

  const loadSettlementLinkOptions = useCallback(async () => {
    const baseOptions = (
      await buildSettlementLinkCandidatesUseCase.execute({
        entries: knownLedgerEntries,
        settlementEntryType: state.entryType,
        partyName: state.partyName,
        fallbackCurrencyCode: activeBusinessCurrencyCode,
      })
    ).map((candidate) => ({
      value: candidate.remoteId,
      label: candidate.label,
    }));

    const selectedRemoteId = state.settledAgainstEntryRemoteId.trim();
    if (!selectedRemoteId) {
      setSettlementLinkOptions(baseOptions);
      return;
    }

    const selectedStillPresent = baseOptions.some(
      (option) => option.value === selectedRemoteId,
    );
    if (selectedStillPresent) {
      setSettlementLinkOptions(baseOptions);
      return;
    }

    setSettlementLinkOptions([
      {
        value: selectedRemoteId,
        label: "Previously linked due (settled/closed)",
      },
      ...baseOptions,
    ]);
  }, [
    activeBusinessCurrencyCode,
    buildSettlementLinkCandidatesUseCase,
    knownLedgerEntries,
    state.entryType,
    state.partyName,
    state.settledAgainstEntryRemoteId,
  ]);

  useEffect(() => {
    void loadSettlementLinkOptions();
  }, [loadSettlementLinkOptions]);

  const resolveDefaultSettlementAccountRemoteId = useCallback((): string => {
    if (knownMoneyAccounts.length === 0) {
      return "";
    }

    return knownMoneyAccounts[0].remoteId;
  }, [knownMoneyAccounts]);

  return {
    partySuggestions,
    availableSettlementAccounts,
    settlementLinkOptions,
    loadKnownParties,
    loadMoneyAccounts,
    resolveDefaultSettlementAccountRemoteId,
  };
};
