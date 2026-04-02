import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Search } from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

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
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Search size={18} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
    paddingVertical: 12,
  },
});
