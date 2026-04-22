import { ProductKind, type ProductKindValue } from "@/feature/products/types/product.types";
import type { PosQuickProductFieldErrors } from "@/feature/pos/types/pos.state.types";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import type { DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";
import { FormModalActionFooter } from "@/shared/components/reusable/Form/FormModalActionFooter";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledDropdownField } from "@/shared/components/reusable/Form/LabeledDropdownField";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet } from "react-native";

type PosQuickProductModalProps = {
  visible: boolean;
  name: string;
  salePrice: string;
  categoryName: string;
  kind: ProductKindValue;
  openingStockQuantity: string;
  fieldErrors: PosQuickProductFieldErrors;
  onNameChange: (value: string) => void;
  onSalePriceChange: (value: string) => void;
  onCategoryNameChange: (value: string) => void;
  onKindChange: (value: ProductKindValue) => void;
  onOpeningStockQuantityChange: (value: string) => void;
  onCreate: () => void;
  onClose: () => void;
};

const PRODUCT_KIND_OPTIONS: readonly DropdownOption[] = [
  { label: "Item", value: ProductKind.Item },
  { label: "Service", value: ProductKind.Service },
];

export function PosQuickProductModal({
  visible,
  name,
  salePrice,
  categoryName,
  kind,
  openingStockQuantity,
  fieldErrors,
  onNameChange,
  onSalePriceChange,
  onCategoryNameChange,
  onKindChange,
  onOpeningStockQuantityChange,
  onCreate,
  onClose,
}: PosQuickProductModalProps) {
  return (
    <FormSheetModal
      visible={visible}
      title="Create Product"
      subtitle="Quickly add a new product for direct selling"
      onClose={onClose}
      closeAccessibilityLabel="Close quick product form"
      presentation="bottom-sheet"
      contentContainerStyle={styles.content}
      footer={
        <FormModalActionFooter>
          <AppButton
            label="Cancel"
            variant="secondary"
            size="lg"
            style={styles.actionButton}
            onPress={onClose}
          />
          <AppButton
            label="Create Product"
            size="lg"
            style={styles.actionButton}
            onPress={onCreate}
          />
        </FormModalActionFooter>
      }
    >
      <LabeledTextInput
        label="Product Name"
        value={name}
        placeholder="Product name"
        onChangeText={onNameChange}
        autoCapitalize="words"
        errorText={fieldErrors.name}
      />

      <LabeledTextInput
        label="Sale Price"
        value={salePrice}
        placeholder="Sale price"
        keyboardType="decimal-pad"
        onChangeText={onSalePriceChange}
        errorText={fieldErrors.salePrice}
      />

      <LabeledTextInput
        label="Category"
        value={categoryName}
        placeholder="Category (optional)"
        onChangeText={onCategoryNameChange}
      />

      <LabeledDropdownField
        label="Type"
        value={kind}
        options={PRODUCT_KIND_OPTIONS}
        onChange={(value) => {
          if (value === ProductKind.Item || value === ProductKind.Service) {
            onKindChange(value);
          }
        }}
        placeholder="Select type"
        modalTitle="Select type"
      />

      {kind === ProductKind.Item ? (
        <LabeledTextInput
          label="Opening Stock"
          value={openingStockQuantity}
          placeholder="0"
          keyboardType="number-pad"
          onChangeText={onOpeningStockQuantityChange}
          errorText={fieldErrors.openingStockQuantity}
        />
      ) : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
