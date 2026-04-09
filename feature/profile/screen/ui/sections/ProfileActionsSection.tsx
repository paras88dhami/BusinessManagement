import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, LogOut, Settings2 } from "lucide-react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

type ProfileActionsSectionProps = {
  onOpenSettings: () => void;
  onLogout: () => Promise<void>;
};

export function ProfileActionsSection({
  onOpenSettings,
  onLogout,
}: ProfileActionsSectionProps) {
  return (
    <Card style={styles.sectionCard}>
      <Pressable
        style={[styles.actionCard, styles.actionCardBorder]}
        onPress={onOpenSettings}
        accessibilityRole="button"
      >
        <View style={styles.actionIconWrap}>
          <Settings2 size={18} color={colors.primary} />
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Settings</Text>
          <Text style={styles.actionSubtitle}>Security, appearance, and support</Text>
        </View>
        <ChevronRight size={16} color={colors.mutedForeground} />
      </Pressable>

      <Pressable
        style={styles.actionCard}
        onPress={() => {
          void onLogout();
        }}
        accessibilityRole="button"
      >
        <View style={styles.actionIconWrap}>
          <LogOut size={18} color={colors.destructive} />
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.logoutTitle}>Logout</Text>
          <Text style={styles.actionSubtitle}>Sign out from this device</Text>
        </View>
        <ChevronRight size={16} color={colors.mutedForeground} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    padding: 0,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBody: {
    flex: 1,
  },
  actionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
    marginBottom: 2,
  },
  logoutTitle: {
    color: colors.destructive,
    fontSize: 14,
    fontFamily: "InterBold",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
});

