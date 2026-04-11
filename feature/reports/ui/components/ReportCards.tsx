import {
    ReportListItem,
    ReportMenuSection,
    ReportSummaryCard,
} from "@/feature/reports/types/report.entity.types";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { ListRow } from "@/shared/components/reusable/List/ListRow";
import { colors } from "@/shared/components/theme/colors";
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

export function ReportsSummaryRow({
  cards,
}: {
  cards: readonly ReportSummaryCard[];
}) {
  return (
    <View style={styles.summaryRow}>
      {cards.map((card) => {
        const valueColor =
          card.tone === "positive"
            ? colors.success
            : card.tone === "negative"
              ? colors.destructive
              : colors.cardForeground;
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
              icon={resolveIcon(item.id)}
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
  return (
    <View style={styles.listWrap}>
      {items.map((item) => {
        const valueColor =
          item.tone === "positive"
            ? colors.success
            : item.tone === "negative"
              ? colors.destructive
              : colors.cardForeground;
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
  return (
    <Card style={styles.exportCard}>
      <Text style={styles.exportLabel}>CSV Preview</Text>
      <Text style={styles.exportBody}>{csvPreview}</Text>
    </Card>
  );
}

const resolveIcon = (reportId: string) => {
  switch (reportId) {
    case "sales_report":
      return <BarChart3 size={20} color={colors.primary} />;
    case "party_balances":
      return <Users size={20} color={colors.primary} />;
    case "collection_report":
      return <CircleDollarSign size={20} color={colors.primary} />;
    case "payment_report":
      return <Receipt size={20} color={colors.primary} />;
    case "category_summary":
      return <PieChart size={20} color={colors.primary} />;
    case "account_statement":
      return <FileBarChart size={20} color={colors.primary} />;
    case "emi_loan_report":
      return <CreditCard size={20} color={colors.primary} />;
    case "stock_report":
      return <Boxes size={20} color={colors.primary} />;
    case "export_data":
      return <Download size={20} color={colors.primary} />;
    default:
      return <BarChart3 size={20} color={colors.primary} />;
  }
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  sectionsWrap: {
    gap: spacing.lg,
  },
  sectionBlock: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 17,
    fontFamily: "InterBold",
    marginBottom: spacing.xs,
  },
  listWrap: {
    gap: spacing.sm,
  },
  listCard: {
    paddingVertical: spacing.md,
  },
  listTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  listBody: {
    flex: 1,
  },
  listTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  listSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  listValue: {
    fontSize: 13,
    fontFamily: "InterBold",
  },
  progressTrack: {
    marginTop: spacing.sm,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  exportCard: {
    gap: spacing.sm,
  },
  exportLabel: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  exportBody: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "InterMedium",
  },
});
