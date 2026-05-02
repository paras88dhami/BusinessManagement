import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { useToastMessage } from "@/shared/components/reusable/Feedback/useToastMessage";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import {
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Monitor,
  Shield,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SecuritySessionItem } from "../../types/settings.types";

type SecurityModalProps = {
  visible: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  isSavingPreference: boolean;
  passwordChangedLabel: string;
  biometricLoginEnabled: boolean;
  biometricLoginSubtitle: string;
  biometricLoginToggleDisabled: boolean;
  twoFactorAuthEnabled: boolean;
  twoFactorAuthSubtitle: string;
  twoFactorAuthToggleDisabled: boolean;
  securitySessions: readonly SecuritySessionItem[];
  onClose: () => void;
  onOpenChangePassword: () => void;
  onToggleBiometricLogin: (value: boolean) => Promise<void>;
  onToggleTwoFactorAuth: (value: boolean) => Promise<void>;
};

type SecurityRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  borderBottom?: boolean;
  rightContent?: React.ReactNode;
  onPress?: () => void;
};

const SecurityRow = ({
  icon,
  title,
  subtitle,
  borderBottom,
  rightContent,
  onPress,
}: SecurityRowProps) => {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        row: {
          minHeight: theme.scaleSpace(78),
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
          paddingHorizontal: theme.scaleSpace(spacing.md),
          paddingVertical: theme.scaleSpace(spacing.md),
        },
        rowBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        rowIconWrap: {
          width: theme.scaleSpace(36),
          height: theme.scaleSpace(36),
          borderRadius: radius.pill,
          backgroundColor: theme.colors.accent,
          alignItems: "center",
          justifyContent: "center",
        },
        rowTextWrap: {
          flex: 1,
        },
        rowTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(15),
          fontFamily: "InterBold",
          marginBottom: 2,
        },
        rowSubtitle: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterMedium",
        },
      }),
    [theme],
  );

  const content = (
    <>
      <View style={styles.rowIconWrap}>{icon}</View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {rightContent}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.row, borderBottom ? styles.rowBorder : null]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, borderBottom ? styles.rowBorder : null]}>
      {content}
    </View>
  );
};

export function SecurityModal({
  visible,
  errorMessage,
  successMessage,
  isSavingPreference,
  passwordChangedLabel,
  biometricLoginEnabled,
  biometricLoginSubtitle,
  biometricLoginToggleDisabled,
  twoFactorAuthEnabled,
  twoFactorAuthSubtitle,
  twoFactorAuthToggleDisabled,
  securitySessions,
  onClose,
  onOpenChangePassword,
  onToggleBiometricLogin,
  onToggleTwoFactorAuth,
}: SecurityModalProps) {
  useToastMessage({
    message: visible ? successMessage : null,
    type: "success",
  });

  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          gap: theme.scaleSpace(spacing.md),
        },
        listCard: {
          padding: 0,
          overflow: "hidden",
        },
        activeSessionCard: {
          backgroundColor: theme.colors.accent,
          gap: theme.scaleSpace(spacing.sm),
        },
        activeSessionHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(8),
        },
        activeSessionTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(16),
          fontFamily: "InterBold",
        },
        sessionRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.scaleSpace(spacing.md),
          paddingVertical: 2,
        },
        sessionRowBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingBottom: theme.scaleSpace(spacing.sm),
          marginBottom: theme.scaleSpace(spacing.xs),
        },
        sessionTextWrap: {
          flex: 1,
        },
        sessionLabelWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(6),
        },
        sessionTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(14),
          fontFamily: "InterSemiBold",
        },
        sessionSubtitle: {
          marginTop: 4,
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterMedium",
        },
        sessionActivity: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          fontFamily: "InterSemiBold",
          textAlign: "right",
        },
        sessionActivityActive: {
          color: theme.colors.primary,
        },
        signOutButton: {
          alignSelf: "flex-start",
          marginTop: theme.scaleSpace(spacing.xs),
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterSemiBold",
        },
        infoText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterMedium",
        },
      }),
    [theme],
  );

  return (
    <FormSheetModal
      visible={visible}
      title="Security"
      onClose={onClose}
      presentation="bottom-sheet"
      contentContainerStyle={styles.content}
    >
      <Card style={styles.listCard}>
        <SecurityRow
          icon={<LockKeyhole size={18} color={theme.colors.primary} />}
          title="Change Password"
          subtitle={passwordChangedLabel}
          borderBottom={true}
          rightContent={
            <KeyRound size={18} color={theme.colors.mutedForeground} />
          }
          onPress={onOpenChangePassword}
        />

        <SecurityRow
          icon={<Fingerprint size={18} color={theme.colors.primary} />}
          title="Biometric Login"
          subtitle={biometricLoginSubtitle}
          borderBottom={true}
          rightContent={
            <Switch
              value={biometricLoginEnabled}
              onValueChange={(value) => {
                void onToggleBiometricLogin(value);
              }}
              disabled={biometricLoginToggleDisabled}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.card}
            />
          }
        />

        <SecurityRow
          icon={<Shield size={18} color={theme.colors.primary} />}
          title="Two-Factor Auth (2FA)"
          subtitle={twoFactorAuthSubtitle}
          rightContent={
            <Switch
              value={twoFactorAuthEnabled}
              onValueChange={(value) => {
                void onToggleTwoFactorAuth(value);
              }}
              disabled={twoFactorAuthToggleDisabled}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.card}
            />
          }
        />
      </Card>

      <Card style={styles.activeSessionCard}>
        <View style={styles.activeSessionHeader}>
          <Shield size={16} color={theme.colors.primary} />
          <Text style={styles.activeSessionTitle}>Active Sessions</Text>
        </View>

        {securitySessions.map((session, index) => {
          const isLast = index === securitySessions.length - 1;

          return (
            <View
              key={session.id}
              style={[styles.sessionRow, !isLast ? styles.sessionRowBorder : null]}
            >
              <View style={styles.sessionTextWrap}>
                <View style={styles.sessionLabelWrap}>
                  <Monitor size={14} color={theme.colors.mutedForeground} />
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                </View>
                <Text style={styles.sessionSubtitle}>{session.subtitle}</Text>
              </View>

              <Text
                style={[
                  styles.sessionActivity,
                  session.isActive ? styles.sessionActivityActive : null,
                ]}
              >
                {session.activityLabel}
              </Text>
            </View>
          );
        })}

        <AppButton
          label="Sign out all other sessions"
          variant="accent"
          size="md"
          disabled={true}
          style={styles.signOutButton}
        />
      </Card>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {isSavingPreference ? (
        <Text style={styles.infoText}>Saving security preference...</Text>
      ) : null}
    </FormSheetModal>
  );
}
