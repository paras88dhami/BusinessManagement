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
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";

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
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          flexGrow: 0,
          flexShrink: 0,
        },
        row: {
          flexDirection: "row",
          gap: theme.scaleSpace(spacing.xs),
          alignItems: "center",
          paddingVertical: 2,
        },
        chip: {
          minHeight: theme.scaleSpace(34),
          borderRadius: radius.pill,
          paddingHorizontal: theme.scaleSpace(spacing.md),
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondary,
        },
        chipSelected: {
          borderColor: theme.isDarkMode
            ? theme.colors.foreground
            : theme.colors.primary,
          backgroundColor: theme.isDarkMode
            ? theme.colors.accent
            : theme.colors.primary,
        },
        chipText: {
          color: theme.colors.foreground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterMedium",
        },
        chipTextSelected: {
          color: theme.isDarkMode
            ? theme.colors.foreground
            : theme.colors.primaryForeground,
        },
      }),
    [theme],
  );

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
