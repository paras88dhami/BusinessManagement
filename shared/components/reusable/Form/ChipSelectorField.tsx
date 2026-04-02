import React from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

export type ChipSelectorOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type ChipSelectorFieldProps<TValue extends string> = {
  label: string;
  options: readonly ChipSelectorOption<TValue>[];
  selectedValue: TValue | null;
  onSelect: (value: TValue) => void;
  disabled?: boolean;
  isOptionDisabled?: (value: TValue) => boolean;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ChipSelectorField<TValue extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  disabled,
  isOptionDisabled,
  scrollStyle,
  contentContainerStyle,
}: ChipSelectorFieldProps<TValue>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal={true}
        style={scrollStyle}
        alwaysBounceVertical={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.optionsRow, contentContainerStyle]}
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          const optionDisabled = disabled || isOptionDisabled?.(option.value) === true;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : null,
                optionDisabled ? styles.chipDisabled : null,
              ]}
              onPress={() => onSelect(option.value)}
              disabled={optionDisabled}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  optionsRow: {
    gap: spacing.xs,
    alignItems: "center",
    paddingVertical: 2,
    paddingRight: spacing.md,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: colors.foreground,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterSemiBold",
  },
  chipTextSelected: {
    color: colors.primaryForeground,
  },
});
