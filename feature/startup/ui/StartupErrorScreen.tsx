import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/components/theme/colors";
import { fontFamily } from "@/shared/components/theme/typography";
import { radius, spacing } from "@/shared/components/theme/spacing";

type StartupErrorScreenProps = {
  message: string;
  onRetry: (() => Promise<void>) | null;
};

export function StartupErrorScreen({
  message,
  onRetry,
}: StartupErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Startup failed</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            void onRetry();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry startup"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.destructive,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    color: colors.foreground,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    minHeight: 44,
    minWidth: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  retryButtonText: {
    color: colors.primaryForeground,
    fontFamily: fontFamily.bold,
    fontSize: 14,
  },
});
