import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { AccountType } from "../types/accountSelection.types";
import { AccountSelectionViewModel } from "../viewModel/accountSelection.viewModel";

type AccountSelectionScreenProps = {
  viewModel: AccountSelectionViewModel;
};

const getAccountTypeLabel = (accountType: string): string => {
  if (accountType === AccountType.Business) {
    return "Business account";
  }

  return "Personal account";
};

export function AccountSelectionScreen({ viewModel }: AccountSelectionScreenProps) {
  const {
    accounts,
    selectedAccountRemoteId,
    isCreateMode,
    canStartCreateMode,
    canCancelCreateMode,
    newAccountType,
    newAccountDisplayName,
    isLoading,
    isSubmitting,
    submitError,
    successMessage,
    onSelectAccount,
    onStartCreateMode,
    onCancelCreateMode,
    onChangeNewAccountType,
    onChangeNewAccountDisplayName,
    onConfirmSelection,
    onBackToLogin,
  } = viewModel;

  const canSubmit = useMemo(() => {
    if (isCreateMode) {
      return !isLoading && !isSubmitting && newAccountDisplayName.trim().length > 0;
    }

    return !isLoading && !isSubmitting && Boolean(selectedAccountRemoteId);
  }, [isCreateMode, isLoading, isSubmitting, newAccountDisplayName, selectedAccountRemoteId]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isCreateMode ? "Create Account" : "Select Account"}
        </Text>
        <Text style={styles.description}>
          {isCreateMode
            ? accounts.length === 0
              ? "Create your first workspace as personal or business."
              : "Create an additional workspace as personal or business."
            : "Choose the account you want to use for this session."}
        </Text>

        {isLoading ? (
          <Text style={styles.infoText}>Loading your accounts...</Text>
        ) : null}

        {!isLoading && !isCreateMode ? (
          <View style={styles.accountsList}>
            {accounts.map((account) => {
              const isSelected = selectedAccountRemoteId === account.remoteId;

              return (
                <Pressable
                  key={account.remoteId}
                  style={[
                    styles.accountItem,
                    isSelected ? styles.accountItemSelected : undefined,
                  ]}
                  onPress={() => onSelectAccount(account.remoteId)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.accountHeader}>
                    <Text style={styles.accountTitle}>{account.displayName}</Text>

                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Check size={14} color={colors.primaryForeground} />
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.accountMeta}>
                    {getAccountTypeLabel(account.accountType)}
                  </Text>

                  {account.isDefault ? (
                    <Text style={styles.defaultLabel}>Default account</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {!isLoading && isCreateMode ? (
          <View style={styles.createContainer}>
            <View style={styles.typeSelectorRow}>
              <Pressable
                style={[
                  styles.typeButton,
                  newAccountType === AccountType.Personal
                    ? styles.typeButtonActive
                    : undefined,
                ]}
                onPress={() => onChangeNewAccountType(AccountType.Personal)}
                accessibilityRole="button"
                accessibilityState={{
                  selected: newAccountType === AccountType.Personal,
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newAccountType === AccountType.Personal
                      ? styles.typeButtonTextActive
                      : undefined,
                  ]}
                >
                  Personal
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.typeButton,
                  newAccountType === AccountType.Business
                    ? styles.typeButtonActive
                    : undefined,
                ]}
                onPress={() => onChangeNewAccountType(AccountType.Business)}
                accessibilityRole="button"
                accessibilityState={{
                  selected: newAccountType === AccountType.Business,
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newAccountType === AccountType.Business
                      ? styles.typeButtonTextActive
                      : undefined,
                  ]}
                >
                  Business
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Account name</Text>
            <TextInput
              value={newAccountDisplayName}
              onChangeText={onChangeNewAccountDisplayName}
              placeholder="Enter account name"
              style={styles.nameInput}
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Account name"
            />
          </View>
        ) : null}

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        {!isLoading && canStartCreateMode ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={onStartCreateMode}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Create New Account</Text>
          </Pressable>
        ) : null}

        {!isLoading && canCancelCreateMode ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={onCancelCreateMode}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            !canSubmit ? styles.primaryButtonDisabled : undefined,
          ]}
          onPress={() => {
            void onConfirmSelection();
          }}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting
              ? "Saving..."
              : isCreateMode
                ? "Create and Continue"
                : "Continue"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={onBackToLogin}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Back To Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  infoText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "500",
  },
  accountsList: {
    gap: spacing.sm,
  },
  createContainer: {
    gap: spacing.sm,
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  typeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  typeButtonText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  inputLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "600",
  },
  nameInput: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.foreground,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: "500",
  },
  accountItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary,
    gap: spacing.xs,
  },
  accountItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  accountTitle: {
    color: colors.cardForeground,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  accountMeta: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "500",
  },
  defaultLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: "600",
  },
  successText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: spacing.sm,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  secondaryButtonText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
  },
});
