import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/components/theme/colors";
import { fontFamily } from "@/shared/components/theme/typography";
import { radius, spacing } from "@/shared/components/theme/spacing";

type StartupErrorScreenProps = {
  message: string;
  onRetry: (() => Promise<void>) | null;
  reasonCode: string | null;
  failedTaskKey: string | null;
};

export function StartupErrorScreen({
  message,
  onRetry,
  reasonCode,
  failedTaskKey,
}: StartupErrorScreenProps) {
  const shouldShowDiagnostics = Boolean(reasonCode || failedTaskKey);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Startup failed</Text>
      <Text style={styles.message}>{message}</Text>

      {shouldShowDiagnostics ? (
        <View style={styles.detailsCard}>
          {reasonCode ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Support code</Text>
              <Text style={styles.detailValue}>{reasonCode}</Text>
            </View>
          ) : null}

          {failedTaskKey ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Failed step</Text>
              <Text style={styles.detailValue}>{failedTaskKey}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.guidance}>
        If the issue continues after retry, update the app or share the support
        code with support.
      </Text>

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
  detailsCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: colors.mutedForeground,
    fontFamily: fontFamily.bold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    color: colors.cardForeground,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  guidance: {
    color: colors.mutedForeground,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
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
