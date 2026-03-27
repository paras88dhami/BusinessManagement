import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

interface ScreenContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padded?: boolean;
}

export function ScreenContainer({
  children,
  header,
  footer,
  padded = false,
}: ScreenContainerProps) {
  return (
    <View style={styles.container}>
      {header}
      <View style={styles.divider} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, padded && styles.padded]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  divider: {
    height: 4,
    backgroundColor: colors.destructive,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 110,
  },
  padded: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
