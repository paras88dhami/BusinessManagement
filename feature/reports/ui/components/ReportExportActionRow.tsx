import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
import {
  ReportExportAction,
  ReportExportActionValue,
} from "@/feature/reports/types/report.state.types";
import { FileText, Printer, Share2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
          leadingIcon={<Share2 size={14} color={colors.primary} />}
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
          leadingIcon={<FileText size={14} color={colors.primary} />}
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
          leadingIcon={<Printer size={14} color={colors.primary} />}
          disabled={isExporting}
          isLoading={activeExportAction === ReportExportAction.Print}
          onPress={onPrint}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  headerRow: {
    gap: 2,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 8,
  },
  actionButtonLabel: {
    color: colors.primary,
    fontSize: 12,
  },
});
