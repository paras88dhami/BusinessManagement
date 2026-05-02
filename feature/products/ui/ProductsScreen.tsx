import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import {
    Product,
    ProductKind,
    ProductKindValue,
} from "@/feature/products/types/product.types";
import { ProductsViewModel } from "@/feature/products/viewModel/products.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { SearchInputRow } from "@/shared/components/reusable/Form/SearchInputRow";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { InlineSectionHeader } from "@/shared/components/reusable/ScreenLayouts/InlineSectionHeader";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import { Box, Plus } from "lucide-react-native";
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ProductEditorModal } from "./components/ProductEditorModal";

type ProductsScreenProps = {
  viewModel: ProductsViewModel;
};

const PRODUCT_KIND_FILTER_OPTIONS: readonly {
  label: string;
  value: "all" | ProductKindValue;
}[] = [
  { label: "All", value: "all" },
  { label: "Items", value: ProductKind.Item },
  { label: "Services", value: ProductKind.Service },
];

const buildProductSubtitle = (product: Product): string => {
  const productTypeLabel = product.kind === ProductKind.Item ? "Item" : "Service";

  if (product.kind === ProductKind.Service) {
    return productTypeLabel;
  }

  if (product.stockQuantity === null) {
    return productTypeLabel;
  }

  const unitLabel = product.unitLabel === null ? "unit" : product.unitLabel;
  return `${productTypeLabel} | Stock: ${product.stockQuantity} ${unitLabel}`;
};

export function ProductsScreen({ viewModel }: ProductsScreenProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const handleClearFilters = useCallback((): void => {
    viewModel.onSearchChange("");
    viewModel.onKindFilterChange("all");
  }, [viewModel]);

  const handleDeleteProduct = useCallback(
    (product: Product): void => {
      if (!viewModel.canManage) {
        return;
      }

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
    },
    [viewModel],
  );

  const handleDeletePress = useCallback(
    (event: GestureResponderEvent, product: Product): void => {
      event.stopPropagation();
      handleDeleteProduct(product);
    },
    [handleDeleteProduct],
  );

  return (
    <>
      <DashboardTabScaffold
        footer={
          <BottomTabAwareFooter>
            <AppButton
              label="Add Product"
              size="lg"
              style={styles.primaryActionButton}
              leadingIcon={
                <Plus size={18} color={theme.colors.primaryForeground} />
              }
              onPress={viewModel.onOpenCreate}
              disabled={!viewModel.canManage}
            />
          </BottomTabAwareFooter>
        }
        baseBottomPadding={140}
        contentContainerStyle={styles.content}
        showDivider={false}
      >
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
            valueColor={theme.colors.warning}
          />
        </View>

        <SearchInputRow
          value={viewModel.searchQuery}
          onChangeText={viewModel.onSearchChange}
          placeholder="Search products"
          inputStyle={styles.searchInput}
        />

        <FilterChipGroup
          options={PRODUCT_KIND_FILTER_OPTIONS}
          selectedValue={viewModel.selectedKind}
          onSelect={viewModel.onKindFilterChange}
        />

        <InlineSectionHeader
          title="Products"
          actionLabel="Clear Filters"
          onActionPress={handleClearFilters}
        />

        {viewModel.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : viewModel.errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          </View>
        ) : viewModel.products.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>No products found for selected filters.</Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            {viewModel.products.map((product, index) => (
              <Pressable
                key={product.remoteId}
                style={[
                  styles.productRow,
                  index < viewModel.products.length - 1 ? styles.productRowDivider : null,
                ]}
                onPress={() => {
                  if (viewModel.canManage) {
                    viewModel.onOpenEdit(product);
                  }
                }}
                disabled={!viewModel.canManage}
              >
                <View style={styles.productIconWrap}>
                  <Box size={18} color={theme.colors.primary} />
                </View>

                <View style={styles.productBody}>
                  <Text style={styles.productTitle}>{product.name}</Text>
                  <Text style={styles.productSubtitle}>{buildProductSubtitle(product)}</Text>
                </View>

                <View style={styles.priceWrap}>
                  <Text style={styles.salePrice}>
                    {formatCurrencyAmount({
                      amount: product.salePrice,
                      currencyCode: viewModel.currencyCode,
                      countryCode: viewModel.countryCode,
                    })}
                  </Text>
                  {product.costPrice !== null ? (
                    <Text style={styles.costPrice}>
                      Cost:{" "}
                      {formatCurrencyAmount({
                        amount: product.costPrice,
                        currencyCode: viewModel.currencyCode,
                        countryCode: viewModel.countryCode,
                      })}
                    </Text>
                  ) : null}
                  {viewModel.canManage ? (
                    <Pressable
                      onPress={(event) => handleDeletePress(event, product)}
                      hitSlop={8}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </DashboardTabScaffold>

      <ProductEditorModal
        visible={viewModel.isEditorVisible}
        mode={viewModel.editorMode}
        form={viewModel.form}
        fieldErrors={viewModel.fieldErrors}
        categoryOptions={viewModel.categoryOptions}
        unitOptions={viewModel.unitOptions}
        taxRateOptions={viewModel.taxRateOptions}
        onClose={viewModel.onCloseEditor}
        onChange={viewModel.onFormChange}
        onPickImage={viewModel.onPickImage}
        onClearImage={viewModel.onClearImage}
        onSubmit={viewModel.onSubmit}
      />
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  content: {
    gap: theme.scaleSpace(spacing.sm),
  },
  primaryActionButton: {
    width: "100%",
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.sm),
  },
  statIcon: {
    color: theme.colors.primary,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(18),
  },
  searchInput: {
    color: theme.colors.cardForeground,
  },
  tableContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(13),
  },
  productRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productIconWrap: {
    width: theme.scaleSpace(40),
    height: theme.scaleSpace(40),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  productBody: {
    flex: 1,
    gap: theme.scaleSpace(2),
  },
  productTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  productSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  priceWrap: {
    alignItems: "flex-end",
    gap: theme.scaleSpace(2),
    maxWidth: theme.scaleSpace(150),
  },
  salePrice: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  costPrice: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
  },
  deleteText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(11),
    fontFamily: "InterBold",
    marginTop: theme.scaleSpace(2),
  },
  centerState: {
    minHeight: theme.scaleSpace(180),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.scaleSpace(spacing.lg),
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(13),
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    textAlign: "center",
    lineHeight: theme.scaleLineHeight(20),
  },
});
