import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { radius } from "../../theme/spacing";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useThemedStyles } from "../../theme/useThemedStyles";

interface ListRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export function ListRow({ title, subtitle, value, icon, onPress }: ListRowProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      <ChevronRight size={18} color={theme.colors.mutedForeground} />
    </Pressable>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    row: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: theme.scaleSpace(14),
      paddingVertical: theme.scaleSpace(14),
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.scaleSpace(12),
      marginBottom: theme.scaleSpace(10),
    },
    iconWrap: {
      width: theme.scaleSpace(42),
      height: theme.scaleSpace(42),
      borderRadius: radius.pill,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    title: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(14),
      fontFamily: "InterBold",
    },
    subtitle: {
      color: theme.colors.mutedForeground,
      fontSize: theme.scaleText(12),
      marginTop: theme.scaleSpace(2),
    },
    value: {
      color: theme.colors.primary,
      fontSize: theme.scaleText(12),
      fontFamily: "InterBold",
      marginRight: theme.scaleSpace(6),
    },
  });

