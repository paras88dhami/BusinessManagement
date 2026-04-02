import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";

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
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable style={styles.action} onPress={onActionPress}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRight size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 17,
    fontFamily: "InterBold",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionLabel: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
});
