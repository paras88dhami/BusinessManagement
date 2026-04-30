import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Search } from "lucide-react-native";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";

type SearchInputRowProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps["style"];
};

export function SearchInputRow({
  value,
  onChangeText,
  placeholder,
  containerStyle,
  inputStyle,
}: SearchInputRowProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          minHeight: theme.scaleSpace(50),
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondary,
          paddingHorizontal: theme.scaleSpace(spacing.md),
        },
        input: {
          flex: 1,
          color: theme.colors.foreground,
          fontSize: theme.scaleText(14),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
          paddingVertical: theme.scaleSpace(12),
        } satisfies TextStyle,
      }),
    [theme],
  );

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Search size={18} color={theme.colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
}
