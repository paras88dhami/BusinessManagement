import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
});
