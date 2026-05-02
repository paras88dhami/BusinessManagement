import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type InlineSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function InlineSectionHeader({
  title,
  actionLabel,
  onActionPress,
  style,
}: InlineSectionHeaderProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable style={styles.action} onPress={onActionPress}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRight size={14} color={theme.colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: theme.scaleSpace(spacing.xs),
    },
    title: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(17),
      fontFamily: "InterBold",
    },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.scaleSpace(2),
    },
    actionLabel: {
      color: theme.colors.primary,
      fontSize: theme.scaleText(13),
      fontFamily: "InterMedium",
    },
  });
