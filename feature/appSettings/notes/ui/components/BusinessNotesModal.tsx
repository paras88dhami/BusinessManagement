import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { AppTextInput } from "@/shared/components/reusable/Form/AppTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

type BusinessNotesModalProps = {
  visible: boolean;
  title: string;
  placeholder: string;
  notesInput: string;
  errorMessage: string | null;
  saveButtonLabel: string;
  isSaving: boolean;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSave: () => Promise<void> | void;
};

export function BusinessNotesModal({
  visible,
  title,
  placeholder,
  notesInput,
  errorMessage,
  saveButtonLabel,
  isSaving,
  onNotesChange,
  onClose,
  onSave,
}: BusinessNotesModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <AppTextInput
            value={notesInput}
            onChangeText={onNotesChange}
            placeholder={placeholder}
            multiline
            numberOfLines={8}
            containerStyle={styles.inputWrap}
            style={styles.inputText}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <AppButton
            label={saveButtonLabel}
            variant="primary"
            size="lg"
            style={styles.saveButton}
            onPress={() => {
              void onSave();
            }}
            disabled={isSaving}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    minHeight: 220,
    alignItems: "flex-start",
    paddingTop: spacing.sm,
    backgroundColor: colors.secondary,
  },
  inputText: {
    minHeight: 180,
    paddingTop: spacing.xs,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "InterMedium",
  },
  saveButton: {
    width: "100%",
  },
});
