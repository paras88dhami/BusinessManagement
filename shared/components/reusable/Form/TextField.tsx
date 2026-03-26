import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";
interface TextFieldProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  placeholder: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (value: string) => void;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

export function TextField({
  leftIcon,
  rightIcon,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize = "none",
}: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      {leftIcon ? <View style={styles.side}>{leftIcon}</View> : null}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {rightIcon ? <View style={styles.side}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 54,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  side: {
    width: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: 14,
    paddingVertical: 14,
  },
});
