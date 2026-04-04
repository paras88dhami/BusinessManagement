import { DashboardInfoCard, DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { ChevronRight, StickyNote } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BusinessNotesViewModel } from "../viewModel/notes.viewModel";
import { BusinessNotesModal } from "./components/BusinessNotesModal";

type NotesScreenProps = {
  viewModel: BusinessNotesViewModel;
};

export function NotesScreen({ viewModel }: NotesScreenProps) {
  return (
    <>
      <DashboardTabScaffold
        footer={null}
        baseBottomPadding={110}
        contentContainerStyle={null}
        showDivider={false}
      >
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Utilities</Text>

          {viewModel.isLoading ? (
            <DashboardInfoCard
              title="Loading notes"
              description="Please wait while notes are prepared."
            />
          ) : (
            <Card style={styles.sectionCard}>
              <Pressable
                style={styles.row}
                onPress={viewModel.onOpenNotes}
                accessibilityRole="button"
              >
                <View style={styles.iconWrap}>
                  <StickyNote size={18} color={colors.primary} />
                </View>

                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{viewModel.toolTitle}</Text>
                  <Text style={styles.rowSubtitle}>{viewModel.toolSubtitle}</Text>
                </View>

                <ChevronRight size={16} color={colors.mutedForeground} />
              </Pressable>
            </Card>
          )}

          {viewModel.errorMessage && !viewModel.isNotesVisible ? (
            <DashboardInfoCard
              title="Notes unavailable"
              description={viewModel.errorMessage}
            />
          ) : null}
        </View>
      </DashboardTabScaffold>

      <BusinessNotesModal
        visible={viewModel.isNotesVisible}
        title={viewModel.modalTitle}
        placeholder={viewModel.modalPlaceholder}
        notesInput={viewModel.notesInput}
        errorMessage={viewModel.errorMessage}
        saveButtonLabel={viewModel.saveButtonLabel}
        isSaving={viewModel.isSaving}
        onNotesChange={viewModel.onNotesChange}
        onClose={viewModel.onCloseNotes}
        onSave={viewModel.onSaveNotes}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionCard: {
    padding: 0,
  },
  row: {
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: colors.cardForeground,
    fontSize: 15,
    fontFamily: "InterBold",
    marginBottom: 2,
  },
  rowSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "InterMedium",
  },
});
