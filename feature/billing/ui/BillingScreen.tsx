import { BillingDocumentStatus } from "@/feature/billing/types/billing.types";
import {
  BillingTabValue,
  BillingViewModel,
} from "@/feature/billing/viewModel/billing.viewModel";
import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card, CardPressable } from "@/shared/components/reusable/Cards/Card";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { Pill } from "@/shared/components/reusable/List/Pill";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
  Camera,
  FileText,
  ImageIcon,
  Plus,
  Receipt,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BillingDocumentEditorModal } from "./components/BillingDocumentEditorModal";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

const formatDate = (value: number): string => {
  return new Date(value).toISOString().slice(0, 10);
};

const getTone = (status: string): "success" | "warning" | "danger" | "neutral" => {
  switch (status) {
    case BillingDocumentStatus.Paid:
      return "success";
    case BillingDocumentStatus.PartiallyPaid:
      return "warning";
    case BillingDocumentStatus.Pending:
      return "warning";
    case BillingDocumentStatus.Overdue:
      return "danger";
    default:
      return "neutral";
  }
};

const TABS: readonly { key: BillingTabValue; label: string }[] = [
  { key: "invoices", label: "Invoices" },
  { key: "receipts", label: "Receipts" },
  { key: "billPhotos", label: "Bill Photos" },
];

type BillingScreenProps = {
  viewModel: BillingViewModel;
};

export function BillingScreen({ viewModel }: BillingScreenProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <DashboardTabScaffold
      footer={null}
      baseBottomPadding={110}
      contentContainerStyle={null}
      showDivider={false}
    >
      <View style={styles.summaryRow}>
        <StatCard
          icon={<Text style={styles.summaryIcon}>#</Text>}
          value={String(viewModel.summary.totalDocuments)}
          label="Total"
        />
          <StatCard
            icon={<Text style={styles.summaryIcon}>!</Text>}
            value={formatCurrencyAmount({
              amount: viewModel.summary.pendingAmount,
              currencyCode: viewModel.currencyCode,
              countryCode: viewModel.countryCode,
            })}
            label="Pending"
            valueColor={theme.colors.warning}
          />
          <StatCard
            icon={<Text style={styles.summaryIcon}>!</Text>}
            value={formatCurrencyAmount({
              amount: viewModel.summary.overdueAmount,
              currencyCode: viewModel.currencyCode,
              countryCode: viewModel.countryCode,
            })}
            label="Overdue"
            valueColor={theme.colors.destructive}
          />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === viewModel.activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
              onPress={() => viewModel.onTabChange(tab.key)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isActive ? styles.tabButtonTextActive : null,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {viewModel.activeTab === "billPhotos" ? (
        <>
          <AppButton
            label="Upload Bill Photo"
            size="lg"
            leadingIcon={
              <Camera size={18} color={theme.colors.primaryForeground} />
            }
            onPress={() => void viewModel.onUploadBillPhoto()}
            disabled={!viewModel.canManage}
          />

          <Card style={styles.billPhotoCard}>
            {viewModel.billPhotos.length === 0 ? (
              <View style={styles.emptyStateWrap}>
                <ImageIcon size={36} color={theme.colors.mutedForeground} />
                <Text style={styles.emptyStateTitle}>No bill photos yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Upload photos of your bills and receipts for records
                </Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {viewModel.billPhotos.map((photo) => (
                  <View key={photo.remoteId} style={styles.photoItem}>
                    <Image
                      source={{ uri: photo.imageDataUrl }}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                    <Text numberOfLines={1} style={styles.photoName}>
                      {photo.fileName}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      ) : (
        <>
          <View style={styles.actionRow}>
            <AppButton
              label={viewModel.activeTab === "receipts" ? "New Receipt" : "New Invoice"}
              size="lg"
              style={styles.flexButton}
              leadingIcon={
                <Plus size={18} color={theme.colors.primaryForeground} />
              }
              onPress={viewModel.onOpenCreate}
              disabled={!viewModel.canManage}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Recent {viewModel.activeTab === "receipts" ? "Receipts" : "Invoices"}
          </Text>

          {viewModel.isLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}
          {viewModel.errorMessage ? (
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          ) : null}

          <View style={styles.listWrap}>
            {viewModel.documents.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>No billing documents yet.</Text>
              </Card>
            ) : (
              viewModel.documents.map((document) => (
                <CardPressable
                  key={document.remoteId}
                  style={styles.listCard}
                  onPress={() => viewModel.onOpenEdit(document)}
                >
                  <View style={styles.iconWrap}>
                    {document.documentType === "receipt" ? (
                      <Receipt size={20} color={theme.colors.primary} />
                    ) : (
                      <FileText size={20} color={theme.colors.primary} />
                    )}
                  </View>

                  <View style={styles.listBody}>
                    <View style={styles.titleRow}>
                      <Text style={styles.documentTitle}>{document.documentNumber}</Text>
                      <Pill
                        label={document.status[0].toUpperCase() + document.status.slice(1)}
                        tone={getTone(document.status)}
                      />
                    </View>
                    <Text style={styles.documentSubtitle}>
                      {document.customerName} - {formatDate(document.issuedAt)}
                      {document.dueAt ? ` | Due ${formatDate(document.dueAt)}` : ""}
                      {document.isOverdue ? " | Overdue" : ""}
                    </Text>
                  </View>

                  <View style={styles.amountWrap}>
                    <Text style={styles.amountText}>
                      {formatCurrencyAmount({
                        amount:
                          document.outstandingAmount > 0
                            ? document.outstandingAmount
                            : document.totalAmount,
                        currencyCode: viewModel.currencyCode,
                        countryCode: viewModel.countryCode,
                      })}
                    </Text>
                    {viewModel.canManage ? (
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            `Delete ${document.documentType === "receipt" ? "receipt" : "invoice"}`,
                            `Delete ${document.documentNumber}?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => {
                                  void viewModel.onDelete(document);
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </CardPressable>
              ))
            )}
          </View>
        </>
      )}

      <BillingDocumentEditorModal
        visible={viewModel.isEditorVisible}
        title={viewModel.editorTitle}
        form={viewModel.form}
        canManage={viewModel.canManage}
        onClose={viewModel.onCloseEditor}
        onChange={viewModel.onFormChange}
        onLineItemChange={viewModel.onLineItemChange}
        onAddLineItem={viewModel.onAddLineItem}
        onRemoveLineItem={viewModel.onRemoveLineItem}
        onSubmit={viewModel.onSubmit}
        onPrintPreview={viewModel.onPrintPreview}
        currencyCode={viewModel.currencyCode}
        countryCode={viewModel.countryCode}
        taxLabel={viewModel.taxLabel}
        taxRateOptions={viewModel.taxRateOptions}
        availableSettlementAccounts={viewModel.availableSettlementAccounts}
        draftTotals={viewModel.draftTotals}
      />
    </DashboardTabScaffold>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: theme.scaleSpace(spacing.sm) },
  summaryIcon: {
    color: theme.colors.primary,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(18),
  },
  tabRow: { flexDirection: "row", gap: theme.scaleSpace(spacing.sm) },
  tabButton: {
    flex: 1,
    minHeight: theme.scaleSpace(44),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabButtonText: {
    color: theme.colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(14),
  },
  tabButtonTextActive: { color: theme.colors.primaryForeground },
  actionRow: { flexDirection: "row", gap: theme.scaleSpace(spacing.sm) },
  flexButton: { flex: 1 },
  sectionTitle: {
    color: theme.colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(18),
    marginTop: theme.scaleSpace(spacing.xs),
  },
  errorText: {
    color: theme.colors.destructive,
    fontFamily: "InterMedium",
    fontSize: theme.scaleText(12),
  },
  listWrap: { gap: theme.scaleSpace(spacing.sm) },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
  },
  iconWrap: {
    width: theme.scaleSpace(50),
    height: theme.scaleSpace(50),
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  listBody: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
    marginBottom: theme.scaleSpace(4),
    flexWrap: "wrap",
  },
  documentTitle: {
    color: theme.colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(16),
  },
  documentSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  amountWrap: { alignItems: "flex-end", gap: theme.scaleSpace(4) },
  amountText: {
    color: theme.colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(15),
  },
  deleteText: {
    color: theme.colors.destructive,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(12),
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
  },
  billPhotoCard: { minHeight: theme.scaleSpace(220) },
  emptyStateWrap: {
    flex: 1,
    minHeight: theme.scaleSpace(180),
    alignItems: "center",
    justifyContent: "center",
    gap: theme.scaleSpace(spacing.xs),
  },
  emptyStateTitle: {
    color: theme.colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(22),
  },
  emptyStateDescription: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(14),
    textAlign: "center",
    maxWidth: theme.scaleSpace(260),
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.scaleSpace(spacing.sm),
  },
  photoItem: { width: "48%", gap: theme.scaleSpace(6) },
  photoImage: {
    width: "100%",
    aspectRatio: 1.2,
    borderRadius: radius.lg,
    backgroundColor: theme.colors.secondary,
  },
  photoName: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
});
