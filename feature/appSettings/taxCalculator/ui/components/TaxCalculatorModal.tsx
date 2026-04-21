import {
    TAX_CALCULATION_MODE_OPTIONS,
    TaxCalculationModeValue,
    TaxToolPresetOption,
} from "@/feature/appSettings/taxCalculator/types/taxCalculator.types";
import { TaxCalculationSummaryState } from "@/feature/appSettings/taxCalculator/viewModel/taxCalculator.viewModel";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledDropdownField } from "@/shared/components/reusable/Form/LabeledDropdownField";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Calculator } from "lucide-react-native";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type TaxCalculatorModalProps = {
  visible: boolean;
  amountInput: string;
  amountInputPlaceholder: string;
  selectedMode: TaxCalculationModeValue;
  selectedPresetCode: string;
  presetOptions: readonly TaxToolPresetOption[];
  errorMessage: string | null;
  calculationSummary: TaxCalculationSummaryState | null;
  onAmountChange: (value: string) => void;
  onModeChange: (value: TaxCalculationModeValue) => void;
  onPresetChange: (value: string) => void;
  onClose: () => void;
};

export function TaxCalculatorModal({
  visible,
  amountInput,
  amountInputPlaceholder,
  selectedMode,
  selectedPresetCode,
  presetOptions,
  errorMessage,
  calculationSummary,
  onAmountChange,
  onModeChange,
  onPresetChange,
  onClose,
}: TaxCalculatorModalProps) {
  return (
    <FormSheetModal
      visible={visible}
      title="Tax Calculator"
      onClose={onClose}
      closeAccessibilityLabel="Close tax calculator"
      presentation="bottom-sheet"
      contentContainerStyle={styles.content}
    >
      <View style={styles.segmentWrap}>
        {TAX_CALCULATION_MODE_OPTIONS.map((option) => {
          const isSelected = option.value === selectedMode;

          return (
            <Pressable
              key={option.value}
              style={[styles.segmentButton, isSelected ? styles.segmentButtonActive : null]}
              onPress={() => onModeChange(option.value)}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.segmentLabel,
                  isSelected ? styles.segmentLabelActive : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <LabeledTextInput
        label="Amount"
        value={amountInput}
        onChangeText={onAmountChange}
        keyboardType="decimal-pad"
        placeholder={amountInputPlaceholder}
      />

      <LabeledDropdownField
        label="Tax Preset"
        value={selectedPresetCode}
        options={[...presetOptions]}
        onChange={onPresetChange}
        placeholder="Select tax preset"
        modalTitle="Select tax preset"
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {calculationSummary ? (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeaderRow}>
            <View style={styles.resultBadge}>
              <Calculator size={14} color={colors.primary} />
              <Text style={styles.resultBadgeText}>{calculationSummary.presetLabel}</Text>
            </View>
            <Text style={styles.resultModeText}>{calculationSummary.modeLabel}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Subtotal</Text>
            <Text style={styles.resultValue}>{calculationSummary.subtotalLabel}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tax Amount</Text>
            <Text style={styles.resultValue}>{calculationSummary.taxAmountLabel}</Text>
          </View>
          <View style={[styles.resultRow, styles.resultRowTotal]}>
            <Text style={styles.resultTotalLabel}>Total Amount</Text>
            <Text style={styles.resultTotalValue}>{calculationSummary.totalAmountLabel}</Text>
          </View>
        </Card>
      ) : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  segmentWrap: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: "InterSemiBold",
  },
  segmentLabelActive: {
    color: colors.primaryForeground,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "InterMedium",
  },
  resultCard: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderColor: colors.border,
  },
  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    minHeight: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "InterBold",
  },
  resultModeText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  resultRowTotal: {
    marginTop: 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
  resultValue: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterSemiBold",
  },
  resultTotalLabel: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  resultTotalValue: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: "InterBold",
  },
});
