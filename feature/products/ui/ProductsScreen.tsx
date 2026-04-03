import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import {
  ProductKind,
  ProductKindValue,
} from "@/feature/products/types/product.types";
import { ProductsViewModel } from "@/feature/products/viewModel/products.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { CardPressable } from "@/shared/components/reusable/Cards/Card";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { AppTextInput } from "@/shared/components/reusable/Form/AppTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Box, Plus, Search } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ProductEditorModal } from "./components/ProductEditorModal";

export function ProductsScreen({
  viewModel,
}: {
  viewModel: ProductsViewModel;
}) {
  const kindOptions: readonly {
    label: string;
    value: "all" | ProductKindValue;
  }[] = [
    { label: "All", value: "all" },
    { label: "Items", value: ProductKind.Item },
    { label: "Services", value: ProductKind.Service },
  ];

  return (
    <DashboardTabScaffold>
      <View style={styles.summaryRow}>
        <StatCard
          icon={<Text style={styles.statIcon}>#</Text>}
          value={String(viewModel.summary.totalItems)}
          label="Items"
        />
        <StatCard
          icon={<Text style={styles.statIcon}>#</Text>}
          value={String(viewModel.summary.totalServices)}
          label="Services"
        />
        <StatCard
          icon={<Text style={styles.statIcon}>!</Text>}
          value={String(viewModel.summary.lowStockCount)}
          label="Low Stock"
          valueColor={colors.warning}
        />
      </View>

      <AppTextInput
        value={viewModel.searchQuery}
        placeholder="Search products..."
        onChangeText={viewModel.onSearchChange}
        leftIcon={<Search size={18} color={colors.mutedForeground} />}
      />

      <View style={styles.filterRow}>
        {kindOptions.map((option) => {
          const isActive = viewModel.selectedKind === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.pill, isActive ? styles.pillActive : null]}
              onPress={() => viewModel.onKindFilterChange(option.value)}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {viewModel.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}
      {viewModel.errorMessage ? (
        <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
      ) : null}

      <View style={styles.listWrap}>
        {viewModel.products.map((product) => (
          <CardPressable
            key={product.remoteId}
            style={styles.listCard}
            onPress={() => {
              if (viewModel.canManage) {
                viewModel.onOpenEdit(product);
              }
            }}
          >
            <View style={styles.listIconWrap}>
              <Box size={20} color={colors.primary} />
            </View>
            <View style={styles.listBody}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <Text style={styles.productSubtitle}>
                {product.kind === ProductKind.Item ? "Item" : "Service"}
                {product.kind === ProductKind.Item &&
                product.stockQuantity !== null
                  ? ` | Stock: ${product.stockQuantity}${product.unitLabel ? ` ${product.unitLabel}` : ""}`
                  : ""}
              </Text>
            </View>
            <View style={styles.priceWrap}>
              <Text style={styles.salePrice}>
                NPR {product.salePrice.toLocaleString()}
              </Text>
              {product.costPrice !== null ? (
                <Text style={styles.costPrice}>
                  Cost: NPR {product.costPrice.toLocaleString()}
                </Text>
              ) : null}
              {viewModel.canManage ? (
                <Pressable
                  onPress={() => {
                    Alert.alert("Delete product", `Delete ${product.name}?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          void viewModel.onDelete(product);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          </CardPressable>
        ))}
      </View>

      <AppButton
        label="Add Product"
        size="lg"
        leadingIcon={<Plus size={18} color={colors.primaryForeground} />}
        onPress={viewModel.onOpenCreate}
        disabled={!viewModel.canManage}
      />

      <ProductEditorModal
        visible={viewModel.isEditorVisible}
        mode={viewModel.editorMode}
        form={viewModel.form}
        categoryOptions={viewModel.categoryOptions}
        unitOptions={viewModel.unitOptions}
        taxRateOptions={viewModel.taxRateOptions}
        onClose={viewModel.onCloseEditor}
        onChange={viewModel.onFormChange}
        onSubmit={viewModel.onSubmit}
      />
    </DashboardTabScaffold>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: spacing.sm },
  statIcon: { color: colors.primary, fontFamily: "InterBold", fontSize: 18 },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  pill: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 12,
  },
  pillTextActive: { color: colors.primaryForeground },
  listWrap: { gap: spacing.sm },
  listCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  listIconWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  listBody: { flex: 1 },
  productTitle: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 15,
    marginBottom: 4,
  },
  productSubtitle: { color: colors.mutedForeground, fontSize: 12 },
  priceWrap: { alignItems: "flex-end", gap: 2 },
  salePrice: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 14,
  },
  costPrice: { color: colors.mutedForeground, fontSize: 11 },
  deleteText: {
    color: colors.destructive,
    fontFamily: "InterBold",
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
});


