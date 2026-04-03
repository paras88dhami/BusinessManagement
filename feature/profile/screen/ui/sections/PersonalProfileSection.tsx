import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mail, PencilLine, Phone, Save, UserRound, X } from "lucide-react-native";
import { EditablePersonalProfile } from "@/feature/profile/screen/types/profileScreen.types";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { ProfileField } from "./ProfileField";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";

type PersonalProfileSectionProps = {
  personalProfileForm: EditablePersonalProfile;
  isPersonalEditing: boolean;
  isSavingPersonalProfile: boolean;
  onStartPersonalEdit: () => void;
  onCancelPersonalEdit: () => void;
  onUpdatePersonalProfileField: (
    field: keyof EditablePersonalProfile,
    value: string,
  ) => void;
  onSavePersonalProfile: () => Promise<void>;
};

export function PersonalProfileSection({
  personalProfileForm,
  isPersonalEditing,
  isSavingPersonalProfile,
  onStartPersonalEdit,
  onCancelPersonalEdit,
  onUpdatePersonalProfileField,
  onSavePersonalProfile,
}: PersonalProfileSectionProps) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        {!isPersonalEditing ? (
          <Pressable
            onPress={onStartPersonalEdit}
            style={styles.editTrigger}
            accessibilityRole="button"
          >
            <PencilLine size={14} color={colors.primary} />
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.editingActions}>
            <Pressable
              onPress={onCancelPersonalEdit}
              style={styles.actionTrigger}
              accessibilityRole="button"
            >
              <X size={14} color={colors.destructive} />
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void onSavePersonalProfile();
              }}
              style={styles.actionTrigger}
              accessibilityRole="button"
            >
              <Save size={14} color={colors.success} />
              <Text style={styles.saveLabel}>Save</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Personal Information</Text>
      <Card style={styles.sectionCard}>
        <ProfileField
          label="Full Name"
          value={personalProfileForm.fullName}
          editable={isPersonalEditing}
          onChangeText={(nextValue) => {
            onUpdatePersonalProfileField("fullName", nextValue);
          }}
          placeholder="Your full name"
          autoCapitalize="words"
          keyboardType="default"
          multiline={false}
          numberOfLines={1}
          autoComplete={null}
          textContentType={null}
          icon={<UserRound size={16} color={colors.mutedForeground} />}
          isLast={false}
        />

        <ProfileField
          label="Phone"
          value={personalProfileForm.phone}
          editable={isPersonalEditing}
          onChangeText={(nextValue) => {
            onUpdatePersonalProfileField("phone", nextValue);
          }}
          placeholder="Phone number"
          autoCapitalize="none"
          keyboardType="phone-pad"
          multiline={false}
          numberOfLines={1}
          autoComplete={null}
          textContentType={null}
          icon={<Phone size={16} color={colors.mutedForeground} />}
          isLast={false}
        />

        <ProfileField
          label="Email"
          value={personalProfileForm.email}
          editable={isPersonalEditing}
          onChangeText={(nextValue) => {
            onUpdatePersonalProfileField("email", nextValue);
          }}
          placeholder="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          multiline={false}
          numberOfLines={1}
          autoComplete="email"
          textContentType="emailAddress"
          icon={<Mail size={16} color={colors.mutedForeground} />}
          isLast={true}
        />
      </Card>

      {isSavingPersonalProfile ? (
        <Text style={styles.pendingText}>Saving personal profile...</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    fontFamily: "InterBold",
  },
  editTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  editLabel: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
  editingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actionTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cancelLabel: {
    color: colors.destructive,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
  saveLabel: {
    color: colors.success,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
  sectionCard: {
    padding: 0,
  },
  pendingText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
});
