import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Boxes,
  Box,
  Calculator,
  ChevronRight,
  CreditCard,
  ReceiptText,
  PieChart,
  StickyNote,
  PiggyBank,
  ShieldCheck,
  ShoppingCart,
  LogOut,
  Settings2,
  Tags,
  User,
  WalletCards,
  Users,
} from "lucide-react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { MoreDashboardViewModel } from "../viewModel/moreDashboard.viewModel";
import { MoreDashboardMenuItemId } from "../types/moreDashboard.types";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type MoreDashboardScreenProps = {
  viewModel: MoreDashboardViewModel;
};

export function MoreDashboardScreen({ viewModel }: MoreDashboardScreenProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <DashboardTabScaffold
      footer={null}
      baseBottomPadding={110}
      contentContainerStyle={null}
      showDivider={false}
    >
      {viewModel.sections.map((section) => (
        <View key={section.id} style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={styles.sectionCard}>
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.row}
                onPress={() => viewModel.onMenuItemPress(item.id)}
                accessibilityRole="button"
              >
                <View style={styles.iconWrap}>{getItemIcon(item.id, theme)}</View>

                <View style={styles.rowBody}>
                  <Text
                    style={
                      item.id === "logout" ? styles.logoutTitle : styles.rowTitle
                    }
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>

                <ChevronRight size={16} color={theme.colors.mutedForeground} />
              </Pressable>
            ))}
          </Card>
        </View>
      ))}
    </DashboardTabScaffold>
  );
}

const getItemIcon = (
  itemId: MoreDashboardMenuItemId,
  theme: ReturnType<typeof useAppTheme>,
) => {
  switch (itemId) {
    case "profile":
      return <User size={18} color={theme.colors.primary} />;
    case "ledger":
      return <BookOpen size={18} color={theme.colors.primary} />;
    case "pos":
      return <ShoppingCart size={18} color={theme.colors.primary} />;
    case "orders":
      return <ReceiptText size={18} color={theme.colors.primary} />;
    case "reports":
      return <PieChart size={18} color={theme.colors.primary} />;
    case "products":
      return <Box size={18} color={theme.colors.primary} />;
    case "categories":
      return <Tags size={18} color={theme.colors.primary} />;
    case "inventory":
      return <Boxes size={18} color={theme.colors.primary} />;
    case "moneyAccounts":
      return <WalletCards size={18} color={theme.colors.primary} />;
    case "contacts":
      return <Users size={18} color={theme.colors.primary} />;
    case "billing":
      return <ReceiptText size={18} color={theme.colors.primary} />;
    case "taxCalculator":
      return <Calculator size={18} color={theme.colors.primary} />;
    case "notes":
      return <StickyNote size={18} color={theme.colors.primary} />;
    case "emi":
      return <CreditCard size={18} color={theme.colors.primary} />;
    case "transactions":
      return <ArrowLeftRight size={18} color={theme.colors.primary} />;
    case "budget":
      return <PiggyBank size={18} color={theme.colors.primary} />;
    case "userManagement":
      return <ShieldCheck size={18} color={theme.colors.primary} />;
    case "settings":
      return <Settings2 size={18} color={theme.colors.primary} />;
    case "notifications":
      return <Bell size={18} color={theme.colors.primary} />;
    case "logout":
      return <LogOut size={18} color={theme.colors.destructive} />;
    default:
      return <User size={18} color={theme.colors.primary} />;
  }
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  sectionWrap: {
    gap: theme.scaleSpace(spacing.sm),
  },
  sectionTitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionCard: {
    padding: 0,
  },
  row: {
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconWrap: {
    width: theme.scaleSpace(34),
    height: theme.scaleSpace(34),
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(2),
  },
  logoutTitle: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(2),
  },
  rowSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    lineHeight: theme.scaleLineHeight(17),
  },
});
