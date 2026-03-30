import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowLeftRight,
  BookOpen,
  ChevronRight,
  CreditCard,
  PiggyBank,
  ShoppingCart,
  User,
} from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { MoreDashboardViewModel } from "../viewModel/moreDashboard.viewModel";

type MoreDashboardScreenProps = {
  viewModel: MoreDashboardViewModel;
};

export function MoreDashboardScreen({ viewModel }: MoreDashboardScreenProps) {
  return (
    <DashboardTabScaffold
      title="More"
      activeTab={viewModel.activeTab}
      tabItems={viewModel.tabItems}
      onTabPress={viewModel.onTabPress}
    >
      {viewModel.sections.map((section) => (
        <View key={section.id} style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.row}
                onPress={() => viewModel.onMenuItemPress(item.id)}
                accessibilityRole="button"
              >
                <View style={styles.iconWrap}>{getItemIcon(item.id)}</View>

                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>

                <ChevronRight size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </DashboardTabScaffold>
  );
}

const getItemIcon = (itemId: string) => {
  switch (itemId) {
    case "profile":
      return <User size={18} color={colors.primary} />;
    case "ledger":
      return <BookOpen size={18} color={colors.primary} />;
    case "pos":
      return <ShoppingCart size={18} color={colors.primary} />;
    case "emi":
      return <CreditCard size={18} color={colors.primary} />;
    case "transactions":
      return <ArrowLeftRight size={18} color={colors.primary} />;
    case "budget":
      return <PiggyBank size={18} color={colors.primary} />;
    default:
      return <User size={18} color={colors.primary} />;
  }
};

const styles = StyleSheet.create({
  sectionWrap: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  rowSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
  },
});
