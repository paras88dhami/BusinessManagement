import React from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
};

type FilterChipGroupProps<T extends string> = {
  options: readonly FilterChipOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  chipStyle?: StyleProp<ViewStyle>;
  selectedChipStyle?: StyleProp<ViewStyle>;
  chipTextStyle?: StyleProp<TextStyle>;
  selectedChipTextStyle?: StyleProp<TextStyle>;
};

export function FilterChipGroup<T extends string>({
  options,
  selectedValue,
  onSelect,
  scrollStyle,
  contentContainerStyle,
  chipStyle,
  selectedChipStyle,
  chipTextStyle,
  selectedChipTextStyle,
}: FilterChipGroupProps<T>) {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      alwaysBounceVertical={false}
      style={[styles.scroll, scrollStyle]}
      contentContainerStyle={[styles.row, contentContainerStyle]}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.chip,
              chipStyle,
              isSelected ? styles.chipSelected : null,
              isSelected ? selectedChipStyle : null,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.chipText,
                chipTextStyle,
                isSelected ? styles.chipTextSelected : null,
                isSelected ? selectedChipTextStyle : null,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    paddingVertical: 2,
  },
  chip: {
    height: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.foreground,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterMedium",
  },
  chipTextSelected: {
    color: colors.primaryForeground,
  },
});
