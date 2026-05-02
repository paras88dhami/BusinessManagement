import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Building2,
  Camera,
  CalendarDays,
  ChevronDown,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Save,
  Shield,
  Store,
  X,
} from "lucide-react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { Dropdown, DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";
import { EditableBusinessProfile } from "@/feature/profile/screen/types/profileScreen.types";
import { ProfileField } from "./ProfileField";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { pickImageFromLibrary } from "@/shared/utils/media/pickImage";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type BusinessProfileSectionProps = {
  activeBusinessProfileForm: EditableBusinessProfile;
  activeBusinessEstablishedYear: string;
  hasActiveBusinessProfile: boolean;
  canEditBusinessProfile: boolean;
  isBusinessEditing: boolean;
  isSavingBusinessProfile: boolean;
  businessTypeOptions: readonly { value: string; label: string }[];
  onStartBusinessEdit: () => void;
  onCancelBusinessEdit: () => void;
  onUpdateBusinessProfileField: (
    field: keyof EditableBusinessProfile,
    value: string,
  ) => void;
  onSaveBusinessProfile: () => Promise<void>;
};

export function BusinessProfileSection({
  activeBusinessProfileForm,
  activeBusinessEstablishedYear,
  hasActiveBusinessProfile,
  canEditBusinessProfile,
  isBusinessEditing,
  isSavingBusinessProfile,
  businessTypeOptions,
  onStartBusinessEdit,
  onCancelBusinessEdit,
  onUpdateBusinessProfileField,
  onSaveBusinessProfile,
}: BusinessProfileSectionProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPickingLogo, setIsPickingLogo] = useState(false);
  const businessLogoUrl = activeBusinessProfileForm.businessLogoUrl.trim();

  const businessTypeDropdownOptions = useMemo<DropdownOption[]>(() => {
    const mappedOptions = businessTypeOptions.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    if (
      activeBusinessProfileForm.businessType &&
      !mappedOptions.some(
        (option) => option.value === activeBusinessProfileForm.businessType,
      )
    ) {
      mappedOptions.unshift({
        value: activeBusinessProfileForm.businessType,
        label: activeBusinessProfileForm.businessType,
      });
    }

    return mappedOptions;
  }, [activeBusinessProfileForm.businessType, businessTypeOptions]);

  const onPickBusinessLogo = React.useCallback(async () => {
    if (!isBusinessEditing || isPickingLogo) {
      return;
    }

    setIsPickingLogo(true);
    try {
      const pickedImage = await pickImageFromLibrary();
      if (!pickedImage) {
        return;
      }
      onUpdateBusinessProfileField(
        "businessLogoUrl",
        pickedImage.dataUrl ?? pickedImage.uri,
      );
    } finally {
      setIsPickingLogo(false);
    }
  }, [isBusinessEditing, isPickingLogo, onUpdateBusinessProfileField]);

  const onClearBusinessLogo = React.useCallback(() => {
    onUpdateBusinessProfileField("businessLogoUrl", "");
  }, [onUpdateBusinessProfileField]);

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        {!isBusinessEditing && canEditBusinessProfile ? (
          <Pressable
            onPress={onStartBusinessEdit}
            style={styles.editTrigger}
            accessibilityRole="button"
          >
            <PencilLine size={14} color={theme.colors.primary} />
            <Text style={styles.editLabel}>
              {hasActiveBusinessProfile ? "Edit" : "Set up"}
            </Text>
          </Pressable>
        ) : isBusinessEditing ? (
          <View style={styles.editingActions}>
            <Pressable
              onPress={onCancelBusinessEdit}
              style={styles.actionTrigger}
              accessibilityRole="button"
            >
              <X size={14} color={theme.colors.destructive} />
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void onSaveBusinessProfile();
              }}
              style={styles.actionTrigger}
              accessibilityRole="button"
            >
              <Save size={14} color={theme.colors.success} />
              <Text style={styles.saveLabel}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.readOnlyBadge}>Read only</Text>
        )}
      </View>

      <Card style={styles.sectionCard}>
        <View style={styles.logoRow}>
          <View style={styles.logoPreview}>
            {businessLogoUrl.length > 0 ? (
              <Image
                source={{ uri: businessLogoUrl }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Building2 size={22} color={theme.colors.mutedForeground} />
            )}
          </View>

          <View style={styles.logoActions}>
            <Pressable
              onPress={() => {
                void onPickBusinessLogo();
              }}
              style={[
                styles.logoButton,
                !isBusinessEditing ? styles.logoButtonDisabled : null,
              ]}
              accessibilityRole="button"
              disabled={!isBusinessEditing || isPickingLogo}
            >
              <Camera size={14} color={theme.colors.primary} />
              <Text style={styles.logoButtonText}>
                {isPickingLogo ? "Selecting..." : "Choose logo"}
              </Text>
            </Pressable>

            {isBusinessEditing && businessLogoUrl.length > 0 ? (
              <Pressable
                onPress={onClearBusinessLogo}
                style={styles.logoClearButton}
                accessibilityRole="button"
              >
                <Text style={styles.logoClearText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <ProfileField
          label="Business Name"
          value={activeBusinessProfileForm.legalBusinessName}
          editable={isBusinessEditing}
          onChangeText={(nextValue) => {
            onUpdateBusinessProfileField("legalBusinessName", nextValue);
          }}
          placeholder="Legal business name"
          autoCapitalize="words"
          keyboardType="default"
          multiline={false}
          numberOfLines={1}
          autoComplete={null}
          textContentType={null}
          icon={<Building2 size={16} color={theme.colors.mutedForeground} />}
          isLast={false}
        />

        <ProfileField
          label="Business Phone"
          value={activeBusinessProfileForm.businessPhone}
          editable={isBusinessEditing}
          onChangeText={(nextValue) => {
            onUpdateBusinessProfileField("businessPhone", nextValue);
          }}
          placeholder="+977..."
          autoCapitalize="none"
          keyboardType="phone-pad"
          multiline={false}
          numberOfLines={1}
          autoComplete={null}
          textContentType={null}
          icon={<Phone size={16} color={theme.colors.mutedForeground} />}
          isLast={false}
        />

        <ProfileField
          label="Email"
          value={activeBusinessProfileForm.businessEmail}
          editable={isBusinessEditing}
          onChangeText={(nextValue) => {
            onUpdateBusinessProfileField("businessEmail", nextValue);
          }}
          placeholder="business@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          multiline={false}
          numberOfLines={1}
          autoComplete="email"
          textContentType="emailAddress"
          icon={<Mail size={16} color={theme.colors.mutedForeground} />}
          isLast={false}
        />

        <ProfileField
          label="Address"
          value={activeBusinessProfileForm.city}
          editable={isBusinessEditing}
          onChangeText={(nextValue) => {
            onUpdateBusinessProfileField("city", nextValue);
          }}
          placeholder="City / location"
          autoCapitalize="words"
          keyboardType="default"
          multiline={false}
          numberOfLines={1}
          autoComplete={null}
          textContentType={null}
          icon={<MapPin size={16} color={theme.colors.mutedForeground} />}
          isLast={!isExpanded}
        />

        {isExpanded ? (
          <ProfileField
            label="Street address"
            value={activeBusinessProfileForm.registeredAddress}
            editable={isBusinessEditing}
            onChangeText={(nextValue) => {
              onUpdateBusinessProfileField("registeredAddress", nextValue);
            }}
            placeholder="Street, ward, landmark"
            autoCapitalize="sentences"
            keyboardType="default"
            multiline={true}
            numberOfLines={2}
            autoComplete={null}
            textContentType={null}
            icon={<MapPin size={16} color={theme.colors.mutedForeground} />}
            isLast={false}
          />
        ) : null}

        {isExpanded ? (
          <ProfileField
            label="PAN / Tax ID"
            value={activeBusinessProfileForm.taxRegistrationId}
            editable={isBusinessEditing}
            onChangeText={(nextValue) => {
              onUpdateBusinessProfileField("taxRegistrationId", nextValue);
            }}
            placeholder="Tax registration number"
            autoCapitalize="characters"
            keyboardType="default"
            multiline={false}
            numberOfLines={1}
            autoComplete={null}
            textContentType={null}
            icon={<Shield size={16} color={theme.colors.mutedForeground} />}
            isLast={true}
          />
        ) : null}

        {isExpanded ? (
          <View style={styles.businessTypeRow}>
            <View style={styles.rowIconWrap}>
              <Store size={16} color={theme.colors.mutedForeground} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Business Type</Text>
              {isBusinessEditing ? (
                <Dropdown
                  value={activeBusinessProfileForm.businessType}
                  options={businessTypeDropdownOptions}
                  onChange={(nextValue) => {
                    onUpdateBusinessProfileField("businessType", nextValue);
                  }}
                  placeholder="Select business type"
                  modalTitle="Choose Business Type"
                  showLeadingIcon={false}
                  triggerStyle={styles.dropdownTrigger}
                  triggerTextStyle={styles.dropdownTriggerText}
                />
              ) : (
                <Text style={styles.rowValue}>
                  {activeBusinessProfileForm.businessType || "-"}
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {isExpanded ? (
          <View style={[styles.businessTypeRow, styles.lastRow]}>
            <View style={styles.rowIconWrap}>
              <CalendarDays size={16} color={theme.colors.mutedForeground} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Established</Text>
              <Text style={styles.rowValue}>
                {activeBusinessEstablishedYear || "-"}
              </Text>
            </View>
          </View>
        ) : null}
      </Card>

      <Pressable
        style={styles.seeMoreButton}
        onPress={() => {
          setIsExpanded((previousValue) => !previousValue);
        }}
        accessibilityRole="button"
      >
        <Text style={styles.seeMoreText}>
          {isExpanded ? "See less" : "See more"}
        </Text>
        <ChevronDown
          size={14}
          color={theme.colors.primary}
          style={isExpanded ? styles.seeMoreChevronOpen : undefined}
        />
      </Pressable>

      {isSavingBusinessProfile ? (
        <Text style={styles.pendingText}>Saving business profile...</Text>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  sectionWrap: { marginTop: theme.scaleSpace(spacing.xs), gap: theme.scaleSpace(spacing.sm) },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.scaleSpace(spacing.sm),
  },
  sectionTitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    letterSpacing: 0.7,
    textTransform: "uppercase",
    fontFamily: "InterBold",
  },
  editTrigger: { flexDirection: "row", alignItems: "center", gap: theme.scaleSpace(spacing.xs) },
  editLabel: { color: theme.colors.primary, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  editingActions: { flexDirection: "row", alignItems: "center", gap: theme.scaleSpace(spacing.sm) },
  actionTrigger: { flexDirection: "row", alignItems: "center", gap: theme.scaleSpace(spacing.xs) },
  cancelLabel: { color: theme.colors.destructive, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  saveLabel: { color: theme.colors.success, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  readOnlyBadge: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
    fontFamily: "InterSemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionCard: { padding: 0 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoPreview: {
    width: theme.scaleSpace(52),
    height: theme.scaleSpace(52),
    borderRadius: radius.md,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: { width: "100%", height: "100%" },
  logoActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
  },
  logoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
    paddingHorizontal: theme.scaleSpace(spacing.sm),
    paddingVertical: theme.scaleSpace(spacing.xs),
    borderRadius: radius.md,
    backgroundColor: theme.colors.accent,
  },
  logoButtonDisabled: { opacity: 0.55 },
  logoButtonText: { color: theme.colors.primary, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  logoClearButton: { paddingHorizontal: theme.scaleSpace(spacing.xs), paddingVertical: theme.scaleSpace(4) },
  logoClearText: { color: theme.colors.destructive, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  seeMoreButton: {
    alignSelf: "flex-start",
    marginTop: theme.scaleSpace(spacing.xs),
    marginLeft: theme.scaleSpace(spacing.xs),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(4),
    paddingHorizontal: theme.scaleSpace(spacing.xs),
    paddingVertical: theme.scaleSpace(4),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
  },
  seeMoreText: { color: theme.colors.primary, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  seeMoreChevronOpen: { transform: [{ rotate: "180deg" }] },
  businessTypeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowIconWrap: { marginTop: theme.scaleSpace(3), width: theme.scaleSpace(20), alignItems: "center" },
  rowContent: { flex: 1, gap: theme.scaleSpace(2) },
  rowLabel: { color: theme.colors.mutedForeground, fontSize: theme.scaleText(12), fontFamily: "InterMedium" },
  rowValue: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    lineHeight: theme.scaleLineHeight(20),
    fontFamily: "InterSemiBold",
  },
  dropdownTrigger: {
    minHeight: theme.scaleSpace(34),
    borderWidth: 0,
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dropdownTriggerText: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterSemiBold",
  },
  lastRow: { borderBottomWidth: 0 },
  pendingText: { color: theme.colors.mutedForeground, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
});
