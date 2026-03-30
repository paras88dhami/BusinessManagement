import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeftRight,
  Building2,
  Check,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react-native";
import {
  AccountType,
  AccountTypeValue,
} from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { PrimaryHeader } from "@/shared/components/reusable/ScreenLayouts/PrimaryHeader";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { DashboardProfileViewModel } from "../viewModel/profile.viewModel";

type DashboardProfileScreenProps = {
  viewModel: DashboardProfileViewModel;
};

export function DashboardProfileScreen({
  viewModel,
}: DashboardProfileScreenProps) {
  return (
    <ScreenContainer
      header={
        <PrimaryHeader
          title="Profile"
          showBack
          onBack={viewModel.onBack}
          showBell={false}
          showProfile={false}
          bottomContent={
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{viewModel.initials}</Text>
              </View>

              <View style={styles.profileBody}>
                <Text style={styles.profileName}>{viewModel.profileName}</Text>
                <Text style={styles.profileRole}>{viewModel.roleLabel}</Text>
              </View>
            </View>
          }
        />
      }
      contentContainerStyle={styles.scrollContent}
      baseBottomPadding={spacing.xxl}
    >
      {viewModel.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : null}

      {!viewModel.isLoading ? (
        <View style={styles.accountSwitchWrap}>
          <Pressable
            style={styles.accountSwitchButton}
            onPress={viewModel.onToggleSwitchExpanded}
            accessibilityRole="button"
          >
            <View style={styles.accountSwitchLeft}>
              <View style={styles.accountIconWrap}>
                {renderAccountTypeIcon(
                  getActiveAccountType(
                    viewModel.activeAccountTypeLabel,
                    viewModel.accountOptions,
                    viewModel.activeAccountRemoteId,
                  ),
                )}
              </View>

              <View>
                <Text style={styles.accountTitle}>
                  {viewModel.activeAccountTypeLabel} Account
                </Text>
                <Text style={styles.accountSubtitle}>
                  {viewModel.activeAccountDisplayName || "No active account"}
                </Text>
              </View>
            </View>

            <ChevronDown
              size={16}
              color={colors.mutedForeground}
              style={viewModel.isSwitchExpanded ? styles.chevronOpen : undefined}
            />
          </Pressable>

          {viewModel.isSwitchExpanded ? (
            <View style={styles.accountOptionsWrap}>
              {viewModel.accountOptions.map((accountOption) => {
                const isActive =
                  accountOption.remoteId === viewModel.activeAccountRemoteId;

                return (
                  <Pressable
                    key={accountOption.remoteId}
                    style={styles.accountOptionRow}
                    onPress={() => {
                      void viewModel.onSelectAccount(accountOption.remoteId);
                    }}
                    accessibilityRole="button"
                  >
                    {renderAccountTypeIcon(accountOption.accountType)}

                    <View style={styles.accountOptionBody}>
                      <Text style={styles.accountOptionTitle}>
                        {accountOption.displayName}
                      </Text>
                      <Text style={styles.accountOptionSubtitle}>
                        {accountOption.accountType === AccountType.Business
                          ? "Business"
                          : "Personal"}
                        {accountOption.isDefault ? " - Default" : ""}
                      </Text>
                    </View>

                    {isActive ? <Check size={14} color={colors.success} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}

      {!viewModel.isLoading ? (
        <View style={styles.actionsCard}>
          <Pressable
            style={styles.actionRow}
            onPress={viewModel.onSwitchAccountViaSelector}
            accessibilityRole="button"
          >
            <View style={styles.actionIconWrap}>
              <ArrowLeftRight size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>Switch Account</Text>
              <Text style={styles.actionSubtitle}>
                Open account selection screen
              </Text>
            </View>
          </Pressable>

          <View style={styles.rowDivider} />

          <Pressable
            style={styles.actionRow}
            onPress={() => {
              void viewModel.onLogout();
            }}
            accessibilityRole="button"
          >
            <View style={styles.actionIconWrap}>
              <LogOut size={18} color={colors.destructive} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.logoutTitle}>Logout</Text>
              <Text style={styles.actionSubtitle}>Sign out from this device</Text>
            </View>
          </Pressable>
        </View>
      ) : null}

      {viewModel.loadError ? (
        <Text style={styles.errorText}>{viewModel.loadError}</Text>
      ) : null}
    </ScreenContainer>
  );
}

const getActiveAccountType = (
  activeAccountTypeLabel: string,
  accountOptions: readonly {
    remoteId: string;
    accountType: AccountTypeValue;
  }[],
  activeAccountRemoteId: string | null,
): AccountTypeValue => {
  const activeAccount = accountOptions.find(
    (accountOption) => accountOption.remoteId === activeAccountRemoteId,
  );

  if (activeAccount) {
    return activeAccount.accountType;
  }

  if (activeAccountTypeLabel === "Business") {
    return AccountType.Business;
  }

  return AccountType.Personal;
};

const renderAccountTypeIcon = (accountType: AccountTypeValue) => {
  if (accountType === AccountType.Business) {
    return <Building2 size={16} color={colors.primary} />;
  }

  return <User size={16} color={colors.primary} />;
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.headerForeground,
    fontSize: 18,
    fontWeight: "800",
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    color: colors.headerForeground,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  profileRole: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "500",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "500",
  },
  accountSwitchWrap: {
    gap: 2,
  },
  accountSwitchButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountSwitchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  accountIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  accountTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "700",
  },
  accountSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  accountOptionsWrap: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  accountOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountOptionBody: {
    flex: 1,
  },
  accountOptionTitle: {
    color: colors.cardForeground,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  accountOptionSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  actionsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBody: {
    flex: 1,
  },
  actionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  logoutTitle: {
    color: colors.destructive,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: "600",
  },
});