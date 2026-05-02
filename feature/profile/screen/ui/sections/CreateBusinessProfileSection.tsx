import React, { useMemo } from "react";
import {
  ChevronDown,
  Plus,
  Store,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Building2,
  Shield,
  Camera,
} from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import {
  Dropdown,
  DropdownOption,
} from "@/shared/components/reusable/DropDown/Dropdown";
import { EditableBusinessProfile } from "@/feature/profile/screen/types/profileScreen.types";
import { ProfileField } from "./ProfileField";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { pickImageFromLibrary } from "@/shared/utils/media/pickImage";
import { BusinessProfileFieldErrors } from "@/feature/profile/business/types/businessProfile.types";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type CreateBusinessProfileSectionProps = {
  createBusinessProfileForm: EditableBusinessProfile;
  createBusinessProfileFieldErrors: BusinessProfileFieldErrors;
  isCreateBusinessExpanded: boolean;
  isCreatingBusinessProfile: boolean;
  businessTypeOptions: readonly { value: string; label: string }[];
  onToggleCreateBusinessExpanded: () => void;
  onUpdateCreateBusinessProfileField: (
    field: keyof EditableBusinessProfile,
    value: string,
  ) => void;
  onCreateBusinessProfile: () => Promise<void>;
};

export function CreateBusinessProfileSection({
  createBusinessProfileForm,
  createBusinessProfileFieldErrors,
  isCreateBusinessExpanded,
  isCreatingBusinessProfile,
  businessTypeOptions,
  onToggleCreateBusinessExpanded,
  onUpdateCreateBusinessProfileField,
  onCreateBusinessProfile,
}: CreateBusinessProfileSectionProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [isPickingLogo, setIsPickingLogo] = React.useState(false);
  const establishedYear = useMemo(
    () => String(new Date().getFullYear()),
    [],
  );
  const businessLogoUrl = createBusinessProfileForm.businessLogoUrl.trim();

  const businessTypeDropdownOptions = useMemo<DropdownOption[]>(
    () =>
      businessTypeOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [businessTypeOptions],
  );

  const onPickBusinessLogo = React.useCallback(async () => {
    if (isCreatingBusinessProfile || isPickingLogo) {
      return;
    }

    setIsPickingLogo(true);
    try {
      const pickedImage = await pickImageFromLibrary();
      if (!pickedImage) {
        return;
      }

      onUpdateCreateBusinessProfileField(
        "businessLogoUrl",
        pickedImage.dataUrl ?? pickedImage.uri,
      );
    } finally {
      setIsPickingLogo(false);
    }
  }, [
    isCreatingBusinessProfile,
    isPickingLogo,
    onUpdateCreateBusinessProfileField,
  ]);

  const onClearBusinessLogo = React.useCallback(() => {
    onUpdateCreateBusinessProfileField("businessLogoUrl", "");
  }, [onUpdateCreateBusinessProfileField]);

  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>More</Text>
      <Card style={styles.sectionCard}>
        <Pressable
          style={styles.createTriggerRow}
          onPress={onToggleCreateBusinessExpanded}
          accessibilityRole="button"
        >
          <View style={styles.triggerLeft}>
            <View style={styles.triggerIconWrap}>
              <Plus size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.triggerCopy}>
              <Text style={styles.triggerTitle}>Create New Business</Text>
              <Text style={styles.triggerSubtitle}>Add another workspace</Text>
            </View>
          </View>
          <ChevronDown
            size={16}
            color={theme.colors.mutedForeground}
            style={isCreateBusinessExpanded ? styles.chevronOpen : undefined}
          />
        </Pressable>

        {isCreateBusinessExpanded ? (
          <View style={styles.expandedWrap}>
            <Card style={styles.formCard}>
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
                    style={styles.logoButton}
                    accessibilityRole="button"
                    disabled={isCreatingBusinessProfile || isPickingLogo}
                  >
                    <Camera size={14} color={theme.colors.primary} />
                    <Text style={styles.logoButtonText}>
                      {isPickingLogo ? "Selecting..." : "Choose logo"}
                    </Text>
                  </Pressable>

                  {businessLogoUrl.length > 0 ? (
                    <Pressable
                      onPress={onClearBusinessLogo}
                      style={styles.logoClearButton}
                      accessibilityRole="button"
                      disabled={isCreatingBusinessProfile}
                    >
                      <Text style={styles.logoClearText}>Remove</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <ProfileField
                label="Business Name"
                value={createBusinessProfileForm.legalBusinessName}
                editable={!isCreatingBusinessProfile}
                onChangeText={(nextValue) => {
                  onUpdateCreateBusinessProfileField(
                    "legalBusinessName",
                    nextValue,
                  );
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
                errorText={createBusinessProfileFieldErrors.legalBusinessName}
              />

              <ProfileField
                label="Business Phone"
                value={createBusinessProfileForm.businessPhone}
                editable={!isCreatingBusinessProfile}
                onChangeText={(nextValue) => {
                  onUpdateCreateBusinessProfileField("businessPhone", nextValue);
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
                errorText={createBusinessProfileFieldErrors.businessPhone}
              />

              <ProfileField
                label="Email"
                value={createBusinessProfileForm.businessEmail}
                editable={!isCreatingBusinessProfile}
                onChangeText={(nextValue) => {
                  onUpdateCreateBusinessProfileField("businessEmail", nextValue);
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
                errorText={createBusinessProfileFieldErrors.businessEmail}
              />

              <ProfileField
                label="Address"
                value={createBusinessProfileForm.city}
                editable={!isCreatingBusinessProfile}
                onChangeText={(nextValue) => {
                  onUpdateCreateBusinessProfileField("city", nextValue);
                }}
                placeholder="City / location"
                autoCapitalize="words"
                keyboardType="default"
                multiline={false}
                numberOfLines={1}
                autoComplete={null}
                textContentType={null}
                icon={<MapPin size={16} color={theme.colors.mutedForeground} />}
                isLast={false}
              />

              <ProfileField
                label="Street address"
                value={createBusinessProfileForm.registeredAddress}
                editable={!isCreatingBusinessProfile}
                onChangeText={(nextValue) => {
                  onUpdateCreateBusinessProfileField(
                    "registeredAddress",
                    nextValue,
                  );
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
                errorText={createBusinessProfileFieldErrors.registeredAddress}
              />

              <ProfileField
                label="PAN / Tax ID"
                value={createBusinessProfileForm.taxRegistrationId}
                editable={!isCreatingBusinessProfile}
                onChangeText={(nextValue) => {
                  onUpdateCreateBusinessProfileField(
                    "taxRegistrationId",
                    nextValue,
                  );
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

              <View style={styles.businessTypeRow}>
                <View style={styles.rowIconWrap}>
                  <Store size={16} color={theme.colors.mutedForeground} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Business Type</Text>
                  <Dropdown
                    value={createBusinessProfileForm.businessType}
                    options={businessTypeDropdownOptions}
                    onChange={(nextValue) => {
                      onUpdateCreateBusinessProfileField("businessType", nextValue);
                    }}
                    placeholder="Select business type"
                    modalTitle="Choose Business Type"
                    showLeadingIcon={false}
                    disabled={isCreatingBusinessProfile}
                    triggerStyle={styles.dropdownTrigger}
                    triggerTextStyle={styles.dropdownTriggerText}
                  />
                  {createBusinessProfileFieldErrors.businessType ? (
                    <Text style={styles.inlineErrorText}>
                      {createBusinessProfileFieldErrors.businessType}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={[styles.businessTypeRow, styles.lastRow]}>
                <View style={styles.rowIconWrap}>
                  <CalendarDays size={16} color={theme.colors.mutedForeground} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Established</Text>
                  <Text style={styles.rowValue}>{establishedYear}</Text>
                </View>
              </View>
            </Card>

            <AppButton
              label={isCreatingBusinessProfile ? "Creating..." : "Create Business"}
              variant="primary"
              size="lg"
              style={styles.createButton}
              onPress={() => {
                void onCreateBusinessProfile();
              }}
              disabled={isCreatingBusinessProfile}
              accessibilityState={{ busy: isCreatingBusinessProfile }}
            />
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  sectionWrap: { marginTop: theme.scaleSpace(spacing.xs), gap: theme.scaleSpace(spacing.sm) },
  sectionTitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    letterSpacing: 0.7,
    textTransform: "uppercase",
    fontFamily: "InterBold",
  },
  sectionCard: { padding: 0 },
  createTriggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.scaleSpace(spacing.md),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  triggerLeft: { flexDirection: "row", alignItems: "center", gap: theme.scaleSpace(spacing.sm), flex: 1 },
  triggerIconWrap: {
    width: theme.scaleSpace(34),
    height: theme.scaleSpace(34),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerCopy: { flex: 1 },
  triggerTitle: { color: theme.colors.cardForeground, fontSize: theme.scaleText(14), fontFamily: "InterSemiBold" },
  triggerSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    marginTop: theme.scaleSpace(1),
    fontFamily: "InterMedium",
  },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  expandedWrap: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.scaleSpace(spacing.md),
    gap: theme.scaleSpace(spacing.sm),
  },
  formCard: { padding: 0 },
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
  logoActions: { flex: 1, flexDirection: "row", alignItems: "center", gap: theme.scaleSpace(spacing.sm) },
  logoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
    paddingHorizontal: theme.scaleSpace(spacing.sm),
    paddingVertical: theme.scaleSpace(spacing.xs),
    borderRadius: radius.md,
    backgroundColor: theme.colors.accent,
  },
  logoButtonText: { color: theme.colors.primary, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
  logoClearButton: { paddingHorizontal: theme.scaleSpace(spacing.xs), paddingVertical: theme.scaleSpace(4) },
  logoClearText: { color: theme.colors.destructive, fontSize: theme.scaleText(12), fontFamily: "InterSemiBold" },
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
  inlineErrorText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(12),
    lineHeight: theme.scaleLineHeight(16),
    fontFamily: "InterMedium",
    marginTop: theme.scaleSpace(2),
  },
  lastRow: { borderBottomWidth: 0 },
  createButton: { marginTop: theme.scaleSpace(spacing.xs) },
});
