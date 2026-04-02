import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Circle, CircleDot } from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

export type RoleOptionGridItem<TValue extends string> = {
  value: TValue;
  label: string;
  category: "default" | "custom";
};

type RoleOptionGridProps<TValue extends string> = {
  options: readonly RoleOptionGridItem<TValue>[];
  selectedValue: TValue | null;
  onSelect: (value: TValue) => void;
  disabled?: boolean;
  isOptionDisabled?: (value: TValue) => boolean;
  defaultCategoryLabel?: string;
  customCategoryLabel?: string;
};

type RoleCategorySectionProps<TValue extends string> = {
  title: string;
  options: readonly RoleOptionGridItem<TValue>[];
  selectedValue: TValue | null;
  onSelect: (value: TValue) => void;
  disabled?: boolean;
  isOptionDisabled?: (value: TValue) => boolean;
};

function RoleCategorySection<TValue extends string>({
  title,
  options,
  selectedValue,
  onSelect,
  disabled,
  isOptionDisabled,
}: RoleCategorySectionProps<TValue>) {
  if (options.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal={true}
        alwaysBounceVertical={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          const optionDisabled = disabled || isOptionDisabled?.(option.value) === true;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.optionCard,
                isSelected ? styles.optionCardSelected : null,
                optionDisabled ? styles.optionCardDisabled : null,
              ]}
              onPress={() => onSelect(option.value)}
              disabled={optionDisabled}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected ? styles.optionLabelSelected : null,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>

              {isSelected ? (
                <CircleDot size={14} color={colors.primaryForeground} />
              ) : (
                <Circle size={14} color={colors.mutedForeground} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function RoleOptionGrid<TValue extends string>({
  options,
  selectedValue,
  onSelect,
  disabled,
  isOptionDisabled,
  defaultCategoryLabel = "Default Roles",
  customCategoryLabel = "Custom Roles",
}: RoleOptionGridProps<TValue>) {
  const defaultOptions = useMemo(
    () => options.filter((option) => option.category === "default"),
    [options],
  );
  const customOptions = useMemo(
    () => options.filter((option) => option.category === "custom"),
    [options],
  );

  return (
    <View style={styles.wrap}>
      <RoleCategorySection
        title={defaultCategoryLabel}
        options={defaultOptions}
        selectedValue={selectedValue}
        onSelect={onSelect}
        disabled={disabled}
        isOptionDisabled={isOptionDisabled}
      />
      <RoleCategorySection
        title={customCategoryLabel}
        options={customOptions}
        selectedValue={selectedValue}
        onSelect={onSelect}
        disabled={disabled}
        isOptionDisabled={isOptionDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  sectionWrap: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 12,
    fontFamily: "InterBold",
  },
  row: {
    gap: spacing.xs,
    alignItems: "center",
    paddingVertical: 2,
    paddingRight: spacing.md,
  },
  optionCard: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionCardDisabled: {
    opacity: 0.45,
  },
  optionLabel: {
    color: colors.foreground,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterSemiBold",
    flexShrink: 1,
  },
  optionLabelSelected: {
    color: colors.primaryForeground,
  },
});
