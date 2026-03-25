import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, ChevronLeft } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";

interface PrimaryHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onProfilePress?: () => void;
  rightLabel?: string;
}

export function PrimaryHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  onProfilePress,
  rightLabel = "KD",
}: PrimaryHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.leftRow}>
          {showBack ? (
            <Pressable onPress={onBack} style={styles.iconButton}>
              <ChevronLeft color={colors.headerForeground} size={22} />
            </Pressable>
          ) : (
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>eL</Text>
            </View>
          )}
          <View>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        <View style={styles.rightRow}>
          <Pressable style={styles.iconButton}>
            <Bell color={colors.headerForeground} size={20} />
          </Pressable>
          <Pressable style={styles.profileButton} onPress={onProfilePress}>
            <Text style={styles.profileText}>{rightLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.header,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.headerForeground,
    fontWeight: "800",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    color: colors.headerForeground,
    fontSize: 12,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginBottom: 2,
  },
  title: {
    color: colors.headerForeground,
    fontSize: 20,
    fontWeight: "800",
  },
});
