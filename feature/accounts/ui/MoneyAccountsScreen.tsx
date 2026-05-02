import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Landmark, Plus, Smartphone, Wallet } from "lucide-react-native";
import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { MoneyAccountsViewModel } from "@/feature/accounts/viewModel/moneyAccounts.viewModel";
import {
  MoneyAccount,
  MoneyAccountType,
} from "@/feature/accounts/types/moneyAccount.types";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card, CardPressable } from "@/shared/components/reusable/Cards/Card";
import { ConfirmDeleteModal } from "@/shared/components/reusable/Modals/ConfirmDeleteModal";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";
import { MoneyAccountAdjustmentModal } from "./components/MoneyAccountAdjustmentModal";
import { MoneyAccountEditorModal } from "./components/MoneyAccountEditorModal";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";

const resolveAccountTypeLabel = (account: MoneyAccount): string => {
  switch (account.type) {
    case MoneyAccountType.Bank:
      return "Bank";
    case MoneyAccountType.Wallet:
      return "Wallet";
    case MoneyAccountType.Cash:
    default:
      return "Cash";
  }
};

const resolveAccountIcon = (
  theme: ReturnType<typeof useAppTheme>,
  account: MoneyAccount,
): React.ReactElement => {
  switch (account.type) {
    case MoneyAccountType.Bank:
      return <Landmark size={20} color={theme.colors.primary} />;
    case MoneyAccountType.Wallet:
      return <Smartphone size={20} color={theme.colors.primary} />;
    case MoneyAccountType.Cash:
    default:
      return <Wallet size={20} color={theme.colors.primary} />;
  }
};

type MoneyAccountsScreenProps = {
  viewModel: MoneyAccountsViewModel;
};

export function MoneyAccountsScreen({
  viewModel,
}: MoneyAccountsScreenProps): React.ReactElement {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <DashboardTabScaffold
      footer={
        <BottomTabAwareFooter>
          <AppButton
            label="Add Account"
            variant="primary"
            size="lg"
            style={styles.primaryActionButton}
            leadingIcon={
              <Plus size={18} color={theme.colors.primaryForeground} />
            }
            onPress={viewModel.onOpenCreate}
            disabled={!viewModel.canManage}
          />
        </BottomTabAwareFooter>
      }
      baseBottomPadding={140}
      contentContainerStyle={styles.content}
      showDivider={false}
    >
      <Card style={styles.totalBalanceCard}>
        <Text style={styles.totalBalanceLabel}>Total Balance</Text>
        <Text style={styles.totalBalanceValue}>
          {viewModel.totalBalanceLabel}
        </Text>
      </Card>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>All Accounts</Text>
      </View>

      {viewModel.errorMessage ? (
        <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
      ) : null}

      {viewModel.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      ) : null}

      {viewModel.accounts.length === 0 && !viewModel.isLoading ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No money accounts yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first cash, bank, or wallet account for this workspace.
          </Text>
        </Card>
      ) : null}

      {viewModel.accounts.length > 0 ? (
        <Card style={styles.listCard}>
          {viewModel.accounts.map((account, index) => {
            const isLast = index === viewModel.accounts.length - 1;

            return (
              <CardPressable
                key={account.remoteId}
                style={[
                  styles.accountRow,
                  !isLast ? styles.accountRowDivider : null,
                ]}
                onPress={() => viewModel.onOpenEdit(account)}
                disabled={!viewModel.canManage}
              >
                <View style={styles.iconWrap}>
                  {resolveAccountIcon(theme, account)}
                </View>

                <View style={styles.accountBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    {account.isPrimary ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.accountTypeLabel}>
                    {resolveAccountTypeLabel(account)}
                  </Text>
                </View>

                <Text style={styles.accountBalance}>
                  {formatCurrencyAmount({
                    amount: account.currentBalance,
                    currencyCode: viewModel.currencyCode,
                    countryCode: viewModel.countryCode,
                  })}
                </Text>
              </CardPressable>
            );
          })}
        </Card>
      ) : null}

      <MoneyAccountEditorModal viewModel={viewModel} />
      <MoneyAccountAdjustmentModal viewModel={viewModel} />

      <ConfirmDeleteModal
        visible={viewModel.isDeleteModalVisible}
        title="Delete money account?"
        message={
          viewModel.pendingDeleteAccountName
            ? `Delete ${viewModel.pendingDeleteAccountName}? Existing transactions remain but this account will be archived.`
            : "Delete this money account? Existing transactions remain but this account will be archived."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDeleting={viewModel.isDeleting}
        errorMessage={viewModel.deleteErrorMessage}
        onCancel={viewModel.onCloseDeleteModal}
        onConfirm={() => void viewModel.onConfirmDelete()}
      />
    </DashboardTabScaffold>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  content: {
    gap: theme.scaleSpace(spacing.sm),
  },
  primaryActionButton: {
    width: "100%",
  },
  totalBalanceCard: {
    minHeight: theme.scaleSpace(104),
    alignItems: "center",
    justifyContent: "center",
    gap: theme.scaleSpace(spacing.sm),
  },
  totalBalanceLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterMedium",
  },
  totalBalanceValue: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(26),
    fontFamily: "InterBold",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.scaleSpace(spacing.sm),
  },
  sectionTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(18),
    fontFamily: "InterBold",
  },
  listCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
    borderRadius: 0,
  },
  accountRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconWrap: {
    width: theme.scaleSpace(50),
    height: theme.scaleSpace(50),
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  accountBody: {
    flex: 1,
    gap: theme.scaleSpace(3),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
    flexWrap: "wrap",
  },
  accountName: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(15),
    fontFamily: "InterBold",
  },
  accountTypeLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  accountBalance: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(15),
    fontFamily: "InterBold",
  },
  primaryBadge: {
    minHeight: theme.scaleSpace(22),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.scaleSpace(spacing.sm),
  },
  primaryBadgeText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.scaleText(11),
    fontFamily: "InterBold",
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  loadingWrap: {
    minHeight: theme.scaleSpace(56),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.sm),
  },
  loadingText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterMedium",
  },
  emptyCard: {
    gap: theme.scaleSpace(4),
  },
  emptyTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(15),
    fontFamily: "InterBold",
  },
  emptySubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    lineHeight: theme.scaleLineHeight(18),
    fontFamily: "InterMedium",
  },
});
