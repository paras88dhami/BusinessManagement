import {
    AccountType,
    AccountTypeValue,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
import { ProfileAccountOption } from "@/feature/profile/screen/types/profileScreen.types";
import { Card, CardPressable } from "@/shared/components/reusable/Cards/Card";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Building2, Check, ChevronDown, User } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type AccountSwitchSectionProps = {
  activeAccountTypeLabel: string;
  activeAccountDisplayName: string;
  activeAccountRemoteId: string | null;
  accountOptions: readonly ProfileAccountOption[];
  isSwitchExpanded: boolean;
  onToggleSwitchExpanded: () => void;
  onSelectAccount: (accountRemoteId: string) => Promise<void>;
};

const renderAccountTypeIcon = (
  theme: ReturnType<typeof useAppTheme>,
  accountType: AccountTypeValue,
) => {
  if (accountType === AccountType.Business) {
    return <Building2 size={16} color={theme.colors.primary} />;
  }

  return <User size={16} color={theme.colors.primary} />;
};

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

export function AccountSwitchSection({
  activeAccountTypeLabel,
  activeAccountDisplayName,
  activeAccountRemoteId,
  accountOptions,
  isSwitchExpanded,
  onToggleSwitchExpanded,
  onSelectAccount,
}: AccountSwitchSectionProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.accountSwitchWrap}>
      <CardPressable
        style={styles.accountSwitchButton}
        onPress={onToggleSwitchExpanded}
      >
        <View style={styles.accountSwitchLeft}>
          <View style={styles.accountIconWrap}>
            {renderAccountTypeIcon(
              theme,
              getActiveAccountType(
                activeAccountTypeLabel,
                accountOptions,
                activeAccountRemoteId,
              ),
            )}
          </View>

          <View>
            <Text style={styles.accountTitle}>
              {activeAccountTypeLabel} Account
            </Text>
            <Text style={styles.accountSubtitle}>
              {activeAccountDisplayName || "No active account"}
            </Text>
          </View>
        </View>

        <ChevronDown
          size={16}
          color={theme.colors.mutedForeground}
          style={isSwitchExpanded ? styles.chevronOpen : undefined}
        />
      </CardPressable>

      {isSwitchExpanded ? (
        <Card style={styles.accountOptionsCard}>
          {accountOptions.map((accountOption) => {
            const isActive = accountOption.remoteId === activeAccountRemoteId;

            return (
              <Pressable
                key={accountOption.remoteId}
                style={styles.accountOptionRow}
                onPress={() => {
                  void onSelectAccount(accountOption.remoteId);
                }}
                accessibilityRole="button"
              >
                {renderAccountTypeIcon(theme, accountOption.accountType)}

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

                {isActive ? <Check size={14} color={theme.colors.success} /> : null}
              </Pressable>
            );
          })}
        </Card>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  accountSwitchWrap: {
    gap: theme.scaleSpace(2),
  },
  accountSwitchButton: {
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountSwitchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
  },
  accountIconWrap: {
    width: theme.scaleSpace(36),
    height: theme.scaleSpace(36),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  accountTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  accountSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    marginTop: theme.scaleSpace(2),
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  accountOptionsCard: {
    padding: 0,
  },
  accountOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  accountOptionBody: {
    flex: 1,
  },
  accountOptionTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(2),
  },
  accountOptionSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
});
