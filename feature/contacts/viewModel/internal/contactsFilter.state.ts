import { Contact } from "@/feature/contacts/types/contact.types";
import {
  ContactFilterValue,
} from "@/feature/contacts/viewModel/contacts.viewModel";
import { useEffect, useMemo, useState } from "react";

type ContactFilterOption = Readonly<{
  value: ContactFilterValue;
  label: string;
}>;

type UseContactsFilterStateParams = {
  contacts: readonly Contact[];
  filterOptions: readonly ContactFilterOption[];
};

type ContactsFilterState = {
  searchQuery: string;
  selectedFilter: ContactFilterValue;
  filteredContacts: readonly Contact[];
  setSearchQuery: (value: string) => void;
  setSelectedFilter: (value: ContactFilterValue) => void;
};

const normalizeSearchableText = (value: string | null): string =>
  (value ?? "").trim().toLowerCase();

export const useContactsFilterState = ({
  contacts,
  filterOptions,
}: UseContactsFilterStateParams): ContactsFilterState => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ContactFilterValue>("all");

  const filteredContacts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesFilter =
        selectedFilter === "all" || contact.contactType === selectedFilter;
      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        contact.fullName,
        contact.phoneNumber,
        contact.emailAddress,
        contact.address,
        contact.taxId,
        contact.notes,
      ].some((candidate) =>
        normalizeSearchableText(candidate).includes(normalizedSearch),
      );
    });
  }, [contacts, searchQuery, selectedFilter]);

  useEffect(() => {
    const allowedFilterValues = new Set(filterOptions.map((item) => item.value));
    if (!allowedFilterValues.has(selectedFilter)) {
      setSelectedFilter("all");
    }
  }, [filterOptions, selectedFilter]);

  return {
    searchQuery,
    selectedFilter,
    filteredContacts,
    setSearchQuery,
    setSelectedFilter,
  };
};
