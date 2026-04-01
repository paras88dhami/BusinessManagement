import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
  SignUpPhoneCountryCode,
  SignUpPhoneCountryOption,
} from "@/feature/auth/signUp/types/signUp.types";

export type StaffMemberRoleOption = {
  remoteId: string;
  label: string;
};

type StaffMemberEditorModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  fullName: string;
  phoneCountryCode: SignUpPhoneCountryCode;
  phoneCountryOptions: readonly SignUpPhoneCountryOption[];
  phone: string;
  email: string;
  password: string;
  roleRemoteId: string | null;
  roleOptions: readonly StaffMemberRoleOption[];
  canAssignRoles: boolean;
  isSaving: boolean;
  onChangeFullName: (fullName: string) => void;
  onChangeSelectedPhoneCountry: (phoneCountryCode: SignUpPhoneCountryCode) => void;
  onChangePhone: (phone: string) => void;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
  onChangeRole: (roleRemoteId: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function StaffMemberEditorModal({
  visible,
  mode,
  fullName,
  phoneCountryCode,
  phoneCountryOptions,
  phone,
  email,
  password,
  roleRemoteId,
  roleOptions,
  canAssignRoles,
  isSaving,
  onChangeFullName,
  onChangeSelectedPhoneCountry,
  onChangePhone,
  onChangeEmail,
  onChangePassword,
  onChangeRole,
  onCancel,
  onSave,
}: StaffMemberEditorModalProps) {
  const title = mode === "create" ? "Add Staff Member" : "Edit Staff Member";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismissArea} onPress={onCancel} />

        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>Set profile and role access</Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Close staff editor"
            >
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput
            value={fullName}
            onChangeText={onChangeFullName}
            placeholder="Enter full name"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            editable={!isSaving}
          />

          <Text style={styles.inputLabel}>Phone country</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleOptionsRow}
          >
            {phoneCountryOptions.map((phoneCountryOption) => {
              const isSelected = phoneCountryOption.code === phoneCountryCode;

              return (
                <Pressable
                  key={phoneCountryOption.code}
                  style={[
                    styles.roleChip,
                    isSelected ? styles.roleChipSelected : null,
                  ]}
                  onPress={() => onChangeSelectedPhoneCountry(phoneCountryOption.code)}
                  disabled={isSaving}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      isSelected ? styles.roleChipTextSelected : null,
                    ]}
                  >
                    {phoneCountryOption.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.inputLabel}>Phone number</Text>
          <TextInput
            value={phone}
            onChangeText={onChangePhone}
            placeholder="Enter local phone number"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            keyboardType="phone-pad"
            editable={!isSaving}
          />

          <Text style={styles.inputLabel}>Email (optional)</Text>
          <TextInput
            value={email}
            onChangeText={onChangeEmail}
            placeholder="Enter email"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSaving}
          />

          <Text style={styles.inputLabel}>
            {mode === "create" ? "Password" : "Reset password (optional)"}
          </Text>
          <TextInput
            value={password}
            onChangeText={onChangePassword}
            placeholder={mode === "create" ? "Set password" : "Leave blank to keep current password"}
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            secureTextEntry={true}
            editable={!isSaving}
          />

          <Text style={styles.roleLabel}>Role</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleOptionsRow}
          >
            {roleOptions.map((roleOption) => {
              const isSelected = roleOption.remoteId === roleRemoteId;

              return (
                <Pressable
                  key={roleOption.remoteId}
                  style={[
                    styles.roleChip,
                    isSelected ? styles.roleChipSelected : null,
                    !canAssignRoles ? styles.roleChipDisabled : null,
                  ]}
                  onPress={() => onChangeRole(roleOption.remoteId)}
                  disabled={!canAssignRoles || isSaving}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      isSelected ? styles.roleChipTextSelected : null,
                    ]}
                  >
                    {roleOption.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.actionRow}>
            <AppButton
              label="Cancel"
              variant="secondary"
              size="md"
              style={styles.actionButton}
              onPress={onCancel}
              disabled={isSaving}
            />
            <AppButton
              label={isSaving ? "Saving..." : "Save"}
              variant="primary"
              size="md"
              style={styles.actionButton}
              onPress={onSave}
              disabled={isSaving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    zIndex: 1,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  modalTitle: {
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  modalSubtitle: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  inputLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    color: colors.cardForeground,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  roleLabel: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterBold",
    marginBottom: spacing.xs,
  },
  roleOptionsRow: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  roleChip: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  roleChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChipDisabled: {
    opacity: 0.45,
  },
  roleChipText: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 14,
    fontFamily: "InterSemiBold",
  },
  roleChipTextSelected: {
    color: colors.primaryForeground,
  },
  actionRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
