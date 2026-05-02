import {
    ReportListItem,
    ReportMenuSection,
    ReportSummaryCard,
} from "@/feature/reports/types/report.entity.types";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { ListRow } from "@/shared/components/reusable/List/ListRow";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { spacing } from "@/shared/components/theme/spacing";
import {
    BarChart3,
    Boxes,
    CircleDollarSign,
    CreditCard,
    Download,
    FileBarChart,
    PieChart,
    Receipt,
    Users,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

export function ReportsSummaryRow({
  cards,
}: {
  cards: readonly ReportSummaryCard[];
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.summaryRow}>
      {cards.map((card) => {
        const valueColor =
          card.tone === "positive"
            ? theme.colors.success
            : card.tone === "negative"
              ? theme.colors.destructive
              : theme.colors.cardForeground;
        return (
          <Card key={card.id} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{card.label}</Text>
            <Text style={[styles.summaryValue, { color: valueColor }]}>
              {card.value}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}

export function ReportMenuSections({
  sections,
  onOpen,
}: {
  sections: readonly ReportMenuSection[];
  onOpen: (id: ReportMenuSection["items"][number]["id"]) => void;
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.sectionsWrap}>
      {sections.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={resolveIcon(item.id, theme)}
              onPress={() => onOpen(item.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function ReportListItems({
  items,
}: {
  items: readonly ReportListItem[];
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.listWrap}>
      {items.map((item) => {
        const valueColor =
          item.tone === "positive"
            ? theme.colors.success
            : item.tone === "negative"
              ? theme.colors.destructive
              : theme.colors.cardForeground;
        return (
          <Card key={item.id} style={styles.listCard}>
            <View style={styles.listTopRow}>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.listValue, { color: valueColor }]}>
                {item.value}
              </Text>
            </View>
            {typeof item.progressRatio === "number" ? (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(0, Math.min(item.progressRatio, 1)) * 100}%`,
                    },
                  ]}
                />
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

export function ExportPreviewCard({ csvPreview }: { csvPreview: string }) {
  const styles = useThemedStyles(createStyles);

  return (
    <Card style={styles.exportCard}>
      <Text style={styles.exportLabel}>CSV Preview</Text>
      <Text style={styles.exportBody}>{csvPreview}</Text>
    </Card>
  );
}

const resolveIcon = (reportId: string, theme: ReturnType<typeof useAppTheme>) => {
  switch (reportId) {
    case "sales_report":
      return <BarChart3 size={20} color={theme.colors.primary} />;
    case "party_balances":
      return <Users size={20} color={theme.colors.primary} />;
    case "collection_report":
      return <CircleDollarSign size={20} color={theme.colors.primary} />;
    case "payment_report":
      return <Receipt size={20} color={theme.colors.primary} />;
    case "category_summary":
      return <PieChart size={20} color={theme.colors.primary} />;
    case "account_statement":
      return <FileBarChart size={20} color={theme.colors.primary} />;
    case "emi_loan_report":
      return <CreditCard size={20} color={theme.colors.primary} />;
    case "stock_report":
      return <Boxes size={20} color={theme.colors.primary} />;
    case "export_data":
      return <Download size={20} color={theme.colors.primary} />;
    default:
      return <BarChart3 size={20} color={theme.colors.primary} />;
  }
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.sm),
    marginBottom: theme.scaleSpace(spacing.md),
  },
  summaryCard: {
    flex: 1,
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  summaryLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  summaryValue: {
    marginTop: theme.scaleSpace(6),
    fontSize: theme.scaleText(18),
    fontFamily: "InterBold",
  },
  sectionsWrap: {
    gap: theme.scaleSpace(spacing.lg),
  },
  sectionBlock: {
    gap: theme.scaleSpace(spacing.xs),
  },
  sectionTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(17),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(spacing.xs),
  },
  listWrap: {
    gap: theme.scaleSpace(spacing.sm),
  },
  listCard: {
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  listTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
  },
  listBody: {
    flex: 1,
  },
  listTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  listSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    marginTop: theme.scaleSpace(2),
  },
  listValue: {
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  progressTrack: {
    marginTop: theme.scaleSpace(spacing.sm),
    height: theme.scaleSpace(8),
    borderRadius: 999,
    backgroundColor: theme.colors.muted,
    overflow: "hidden",
  },
  progressFill: {
    height: theme.scaleSpace(8),
    borderRadius: 999,
    backgroundColor: theme.colors.success,
  },
  exportCard: {
    gap: theme.scaleSpace(spacing.sm),
  },
  exportLabel: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  exportBody: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    lineHeight: theme.scaleLineHeight(18),
    fontFamily: "InterMedium",
  },
});
