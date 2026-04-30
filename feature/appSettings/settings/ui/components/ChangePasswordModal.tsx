import { SETTINGS_MIN_PASSWORD_LENGTH } from "@/feature/appSettings/settings/constants/settings.constants";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SettingsChangePasswordForm } from "../../viewModel/settings.viewModel";

type ChangePasswordModalProps = {
  visible: boolean;
  form: SettingsChangePasswordForm;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onClose: () => void;
  onChange: (field: keyof SettingsChangePasswordForm, value: string) => void;
  onSubmit: () => Promise<void>;
};

export function ChangePasswordModal({
  visible,
  form,
  isSubmitting,
  errorMessage,
  successMessage,
  onClose,
  onChange,
  onSubmit,
}: ChangePasswordModalProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          gap: theme.scaleSpace(spacing.md),
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterSemiBold",
        },
        successText: {
          color: theme.colors.success,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterSemiBold",
        },
      }),
    [theme],
  );

  return (
    <FormSheetModal
      visible={visible}
      title="Change Password"
      subtitle="Update your login password"
      onClose={onClose}
      presentation="dialog"
      contentContainerStyle={styles.content}
    >
      <LabeledTextInput
        label="Current Password"
        value={form.currentPassword}
        onChangeText={(value) => onChange("currentPassword", value)}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <LabeledTextInput
        label="New Password"
        value={form.nextPassword}
        onChangeText={(value) => onChange("nextPassword", value)}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
        helperText={`Use at least ${SETTINGS_MIN_PASSWORD_LENGTH} characters and choose a password different from the current one.`}
      />

      <LabeledTextInput
        label="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(value) => onChange("confirmPassword", value)}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <AppButton
        label={isSubmitting ? "Updating Password..." : "Update Password"}
        size="lg"
        onPress={() => {
          void onSubmit();
        }}
        disabled={isSubmitting}
      />
    </FormSheetModal>
  );
}
