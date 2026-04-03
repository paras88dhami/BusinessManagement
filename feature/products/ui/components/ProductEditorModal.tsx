import { ProductKind } from "@/feature/products/types/product.types";
import { ProductFormState } from "@/feature/products/viewModel/products.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Dropdown } from "@/shared/components/reusable/DropDown/Dropdown";
import { AppTextInput } from "@/shared/components/reusable/Form/AppTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { X } from "lucide-react-native";
import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  mode: "create" | "edit";
  form: ProductFormState;
  categoryOptions: readonly string[];
  unitOptions: readonly string[];
  taxRateOptions: readonly string[];
  onClose: () => void;
  onChange: (field: keyof ProductFormState, value: string) => void;
  onSubmit: () => Promise<void>;
};

export function ProductEditorModal({
  visible,
  mode,
  form,
  categoryOptions,
  unitOptions,
  taxRateOptions,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {mode === "create" ? "New Product" : "Edit Product"}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.formWrap}
            showsVerticalScrollIndicator={false}
          >
            <AppTextInput
              value={form.imageUrl}
              placeholder="Product photo URL (optional)"
              onChangeText={(value) => onChange("imageUrl", value)}
            />
            <AppTextInput
              value={form.name}
              placeholder="Product Name *"
              onChangeText={(value) => onChange("name", value)}
              autoCapitalize="words"
            />
            <Dropdown
              value={form.kind}
              options={[
                { label: "Item", value: ProductKind.Item },
                { label: "Service", value: ProductKind.Service },
              ]}
              onChange={(value) => onChange("kind", value)}
              placeholder="Select kind"
              modalTitle="Select product kind"
              showLeadingIcon={false}
              triggerStyle={styles.dropdownTrigger}
              triggerTextStyle={styles.dropdownText}
            />
            <Dropdown
              value={form.categoryName}
              options={categoryOptions.map((item) => ({
                label: item,
                value: item,
              }))}
              onChange={(value) => onChange("categoryName", value)}
              placeholder="Select Category"
              modalTitle="Select category"
              showLeadingIcon={false}
              triggerStyle={styles.dropdownTrigger}
              triggerTextStyle={styles.dropdownText}
            />
            <View style={styles.doubleRow}>
              <AppTextInput
                value={form.salePrice}
                placeholder="Sale Price *"
                keyboardType="decimal-pad"
                onChangeText={(value) => onChange("salePrice", value)}
                containerStyle={styles.flexOne}
              />
              <AppTextInput
                value={form.costPrice}
                placeholder="Cost Price"
                keyboardType="decimal-pad"
                onChangeText={(value) => onChange("costPrice", value)}
                containerStyle={styles.flexOne}
              />
            </View>
            {form.kind === ProductKind.Item ? (
              <View style={styles.doubleRow}>
                <AppTextInput
                  value={form.stockQuantity}
                  placeholder="Stock Qty"
                  keyboardType="decimal-pad"
                  onChangeText={(value) => onChange("stockQuantity", value)}
                  containerStyle={styles.flexOne}
                />
                <View style={styles.flexOne}>
                  <Dropdown
                    value={form.unitLabel}
                    options={unitOptions.map((item) => ({
                      label: item,
                      value: item,
                    }))}
                    onChange={(value) => onChange("unitLabel", value)}
                    placeholder="Unit"
                    modalTitle="Select unit"
                    showLeadingIcon={false}
                    triggerStyle={styles.dropdownTrigger}
                    triggerTextStyle={styles.dropdownText}
                  />
                </View>
              </View>
            ) : null}
            <AppTextInput
              value={form.skuOrBarcode}
              placeholder="SKU / Barcode"
              onChangeText={(value) => onChange("skuOrBarcode", value)}
            />
            <Dropdown
              value={form.taxRateLabel}
              options={taxRateOptions.map((item) => ({
                label: item,
                value: item,
              }))}
              onChange={(value) => onChange("taxRateLabel", value)}
              placeholder="Tax Rate"
              modalTitle="Select tax rate"
              showLeadingIcon={false}
              triggerStyle={styles.dropdownTrigger}
              triggerTextStyle={styles.dropdownText}
            />
            <AppTextInput
              value={form.description}
              placeholder="Description"
              onChangeText={(value) => onChange("description", value)}
              multiline
              numberOfLines={4}
              style={styles.multilineInput}
            />
            <AppButton
              label={mode === "create" ? "Save Product" : "Update Product"}
              size="lg"
              onPress={() => {
                void onSubmit();
              }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  dismissArea: { ...StyleSheet.absoluteFillObject },
  sheet: {
    maxHeight: "86%",
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  formWrap: { gap: spacing.md, paddingBottom: spacing.md },
  dropdownTrigger: {
    minHeight: 54,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "InterMedium",
    color: colors.cardForeground,
  },
  doubleRow: { flexDirection: "row", gap: spacing.sm },
  flexOne: { flex: 1 },
  multilineInput: { minHeight: 90, textAlignVertical: "top" },
});

