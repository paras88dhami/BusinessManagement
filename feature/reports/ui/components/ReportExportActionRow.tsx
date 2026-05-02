import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { spacing } from "@/shared/components/theme/spacing";
import {
  ReportExportAction,
  ReportExportActionValue,
} from "@/feature/reports/types/report.state.types";
import { FileText, Printer, Share2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type ReportExportActionRowProps = {
  canShareCsv: boolean;
  isExporting: boolean;
  activeExportAction: ReportExportActionValue | null;
  onShareCsv: () => void;
  onSharePdf: () => void;
  onPrint: () => void;
};

export function ReportExportActionRow({
  canShareCsv,
  isExporting,
  activeExportAction,
  onShareCsv,
  onSharePdf,
  onPrint,
}: ReportExportActionRowProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Card style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Export</Text>
        <Text style={styles.subtitle}>Share report files or print a copy</Text>
      </View>

      <View style={styles.actionsRow}>
        <AppButton
          label="Share CSV"
          variant="secondary"
          size="sm"
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
          leadingIcon={<Share2 size={14} color={theme.colors.primary} />}
          disabled={isExporting || !canShareCsv}
          isLoading={activeExportAction === ReportExportAction.ShareCsv}
          onPress={onShareCsv}
        />

        <AppButton
          label="Share PDF"
          variant="secondary"
          size="sm"
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
          leadingIcon={<FileText size={14} color={theme.colors.primary} />}
          disabled={isExporting}
          isLoading={activeExportAction === ReportExportAction.SharePdf}
          onPress={onSharePdf}
        />

        <AppButton
          label="Print"
          variant="secondary"
          size="sm"
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
          leadingIcon={<Printer size={14} color={theme.colors.primary} />}
          disabled={isExporting}
          isLoading={activeExportAction === ReportExportAction.Print}
          onPress={onPrint}
        />
      </View>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    gap: theme.scaleSpace(spacing.sm),
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  headerRow: {
    gap: theme.scaleSpace(2),
  },
  title: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    lineHeight: theme.scaleLineHeight(16),
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.xs),
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: theme.scaleSpace(8),
  },
  actionButtonLabel: {
    color: theme.colors.primary,
    fontSize: theme.scaleText(12),
  },
});
