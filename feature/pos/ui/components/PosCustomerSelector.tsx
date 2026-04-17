import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { SearchInputRow } from "@/shared/components/reusable/Form/SearchInputRow";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Plus, User, X } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PosCustomer } from "../../types/pos.entity.types";
import type { PosCustomerOption } from "../../types/pos.ui.types";

type PosCustomerSelectorProps = {
  selectedCustomer: PosCustomer | null;
  customerSearchTerm: string;
  customerOptions: readonly PosCustomerOption[];
  onCustomerSearchChange: (value: string) => void;
  onSelectCustomer: (customer: PosCustomer) => void;
  onClearCustomer: () => void;
  onOpenCustomerCreateModal: () => void;
  disabled?: boolean;
};

export function PosCustomerSelector({
  selectedCustomer,
  customerSearchTerm,
  customerOptions,
  onCustomerSearchChange,
  onSelectCustomer,
  onClearCustomer,
  onOpenCustomerCreateModal,
  disabled = false,
}: PosCustomerSelectorProps) {

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Customer</Text>
      
      <View style={styles.inputRow}>
        <SearchInputRow
          value={customerSearchTerm}
          onChangeText={onCustomerSearchChange}
          placeholder="Search customers..."
          containerStyle={styles.searchInput}
        />
        
        <AppButton
          onPress={onOpenCustomerCreateModal}
          style={styles.addButton}
          disabled={disabled}
          label=""
          leadingIcon={<Plus size={16} color={colors.primary} />}
        />
      </View>

      {customerSearchTerm.trim() !== "" && (
        <View style={styles.resultsContainer}>
          {customerOptions.length > 0 ? (
            customerOptions.slice(0, 10).map((option) => (
              <Pressable
                key={option.value}
                style={styles.resultRow}
                onPress={() => {
                  onSelectCustomer({
                    remoteId: option.customerData.remoteId,
                    fullName: option.customerData.fullName,
                    phone: option.customerData.phone,
                    address: option.customerData.address,
                  });
                }}
                disabled={disabled}
              >
                <Text style={styles.resultName}>{option.customerData?.fullName}</Text>
                {option.customerData?.phone && (
                  <Text style={styles.resultPhone}>{option.customerData.phone}</Text>
                )}
              </Pressable>
            ))
          ) : (
            <Text style={styles.noResultsText}>No customers found</Text>
          )}
        </View>
      )}

      {selectedCustomer && (
        <View style={styles.selectedCustomer}>
          <View style={styles.customerInfo}>
            <User size={16} color={colors.mutedForeground} />
            <Text style={styles.customerName}>{selectedCustomer.fullName}</Text>
            {selectedCustomer.phone && (
              <Text style={styles.customerPhone}>{selectedCustomer.phone}</Text>
            )}
          </View>
          
          <Pressable
            style={styles.clearButton}
            onPress={onClearCustomer}
            disabled={disabled}
          >
            <X size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCustomer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
    flex: 1,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  clearButton: {
    padding: spacing.xs,
  },
  resultsContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    maxHeight: 200,
  },
  resultRow: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  resultPhone: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  noResultsText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontStyle: "italic",
    padding: spacing.sm,
    textAlign: "center",
  },
});
