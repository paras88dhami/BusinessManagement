import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Bell, ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius } from "../../theme/spacing";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface PrimaryHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onProfilePress?: () => void;
  onBellPress?: () => void;
  rightLabel?: string;
  showBell?: boolean;
  showProfile?: boolean;
  topInsetEnabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  bottomContentStyle?: StyleProp<ViewStyle>;
}

export function PrimaryHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  onProfilePress,
  onBellPress,
  rightLabel = "KD",
  showBell = true,
  showProfile = true,
  topInsetEnabled = true,
  containerStyle,
  rightContent,
  bottomContent,
  bottomContentStyle,
}: PrimaryHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          backgroundColor: theme.colors.header,
          paddingHorizontal: theme.scaleSpace(16),
          paddingBottom: theme.scaleSpace(18),
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        leftRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(12),
        },
        rightRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(10),
        },
        logoCircle: {
          width: theme.scaleSpace(42),
          height: theme.scaleSpace(42),
          borderRadius: radius.pill,
          backgroundColor: "rgba(255,255,255,0.18)",
          alignItems: "center",
          justifyContent: "center",
        },
        logoText: {
          color: theme.colors.headerForeground,
          fontFamily: "InterBold",
          fontSize: theme.scaleText(13),
        },
        iconButton: {
          width: theme.scaleSpace(38),
          height: theme.scaleSpace(38),
          borderRadius: radius.pill,
          backgroundColor: "rgba(255,255,255,0.12)",
          alignItems: "center",
          justifyContent: "center",
        },
        profileButton: {
          width: theme.scaleSpace(38),
          height: theme.scaleSpace(38),
          borderRadius: radius.pill,
          backgroundColor: "rgba(255,255,255,0.18)",
          alignItems: "center",
          justifyContent: "center",
        },
        profileText: {
          color: theme.colors.headerForeground,
          fontSize: theme.scaleText(12),
          fontFamily: "InterBold",
        },
        subtitle: {
          color: "rgba(255,255,255,0.8)",
          fontSize: theme.scaleText(11),
          marginBottom: 2,
        },
        title: {
          color: theme.colors.headerForeground,
          fontSize: theme.scaleText(20),
          fontFamily: "InterBold",
        },
        bottomContent: {
          marginTop: theme.scaleSpace(14),
        },
      }),
    [theme],
  );

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: (topInsetEnabled ? insets.top : 0) + 12 },
        containerStyle,
      ]}
      >
      <View style={styles.row}>
        <View style={styles.leftRow}>
          {showBack ? (
            <Pressable onPress={onBack} style={styles.iconButton} accessibilityRole="button">
              <ChevronLeft color={theme.colors.headerForeground} size={22} />
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

        {rightContent ? (
          rightContent
        ) : (
          <View style={styles.rightRow}>
            {showBell ? (
              <Pressable
                style={styles.iconButton}
                onPress={onBellPress}
                accessibilityRole="button"
              >
                <Bell color={theme.colors.headerForeground} size={20} />
              </Pressable>
            ) : null}
            {showProfile ? (
              <Pressable
                style={styles.profileButton}
                onPress={onProfilePress}
                accessibilityRole="button"
              >
                <Text style={styles.profileText}>{rightLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>

      {bottomContent ? (
        <View style={[styles.bottomContent, bottomContentStyle]}>{bottomContent}</View>
      ) : null}
    </View>
  );
}
