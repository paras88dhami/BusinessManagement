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
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

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
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

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
        color={theme.colors.mutedForeground}
        style={expanded ? styles.chevronExpanded : undefined}
      />
    </Pressable>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  button: {
    minHeight: theme.scaleSpace(54),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: radius.lg,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.sm),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.scaleSpace(spacing.sm),
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
    gap: theme.scaleSpace(spacing.sm),
  },
  iconWrap: {
    width: theme.scaleSpace(32),
    height: theme.scaleSpace(32),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: theme.scaleSpace(2),
  },
  label: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
    lineHeight: theme.scaleLineHeight(15),
    fontFamily: "InterMedium",
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
});
