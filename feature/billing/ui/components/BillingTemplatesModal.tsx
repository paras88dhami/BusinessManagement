import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, FileText, Receipt, X } from "lucide-react-native";
import { BillingTemplateOption, BillingTemplateTypeValue } from "@/feature/billing/types/billing.types";
import { CardPressable } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

export function BillingTemplatesModal({
  visible,
  activeTemplateType,
  templateOptions,
  onClose,
  onSelect,
}: {
  visible: boolean;
  activeTemplateType: BillingTemplateTypeValue;
  templateOptions: readonly BillingTemplateOption[];
  onClose: () => void;
  onSelect: (value: BillingTemplateTypeValue) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayDismiss} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Invoice Templates</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.listWrap}>
            {templateOptions.map((option) => {
              const isActive = option.value === activeTemplateType;
              return (
                <CardPressable
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={[styles.optionCard, isActive ? styles.optionCardActive : null]}
                >
                  <View style={styles.iconWrap}>
                    {option.value === "pos_receipt" ? (
                      <Receipt size={22} color={colors.primary} />
                    ) : (
                      <FileText size={22} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {isActive ? (
                    <View style={styles.activeBadge}>
                      <Check size={18} color={colors.primaryForeground} />
                    </View>
                  ) : null}
                </CardPressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", paddingHorizontal: spacing.lg },
  overlayDismiss: { ...StyleSheet.absoluteFillObject },
  modalCard: { backgroundColor: colors.card, borderRadius: radius.xl ?? 24, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, maxHeight: "78%", zIndex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { color: colors.cardForeground, fontFamily: "InterBold", fontSize: 20 },
  listWrap: { gap: spacing.sm },
  optionCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  optionCardActive: { backgroundColor: colors.accent, borderColor: colors.primary },
  iconWrap: { width: 48, height: 48, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", backgroundColor: colors.secondary },
  body: { flex: 1 },
  optionTitle: { color: colors.cardForeground, fontFamily: "InterBold", fontSize: 16, marginBottom: 4 },
  optionDescription: { color: colors.mutedForeground, fontSize: 13 },
  activeBadge: { width: 30, height: 30, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
