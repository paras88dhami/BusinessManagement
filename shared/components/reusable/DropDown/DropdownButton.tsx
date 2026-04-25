import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { ChevronDown } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type DropdownButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  expanded: boolean;
  subtitle?: string;
  leadingIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export function DropdownButton({
  label,
  expanded,
  subtitle,
  leadingIcon,
  style,
  labelStyle,
  subtitleStyle,
  disabled = false,
  accessibilityRole,
  accessibilityState,
  ...props
}: DropdownButtonProps) {
  const isDisabled = disabled === true;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        expanded,
      }}
      style={({ pressed }) => [
        styles.button,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      <View style={styles.leftContent}>
        {leadingIcon ? <View style={styles.iconWrap}>{leadingIcon}</View> : null}
        <View style={styles.textWrap}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <ChevronDown
        size={18}
        color={colors.mutedForeground}
        style={expanded ? styles.chevronExpanded : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.88,
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterBold",
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "InterMedium",
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
});
