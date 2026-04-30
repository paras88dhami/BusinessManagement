import {
    Dropdown,
    DropdownOption,
} from "@/shared/components/reusable/DropDown/Dropdown";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import React from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

type LabeledDropdownFieldProps = {
  label: string;
  value: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  modalTitle?: string;
  showLeadingIcon?: boolean;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
};

export function LabeledDropdownField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
  modalTitle = "Choose option",
  showLeadingIcon = false,
  helperText,
  errorText,
  containerStyle,
  labelStyle,
  triggerStyle,
  triggerTextStyle,
}: LabeledDropdownFieldProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: theme.scaleSpace(6),
        },
        label: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(11),
          fontFamily: "InterBold",
          textTransform: "uppercase",
          letterSpacing: 0.45,
        },
        helperText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterMedium",
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterSemiBold",
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>

      <Dropdown
        value={value}
        options={options}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        modalTitle={modalTitle}
        showLeadingIcon={showLeadingIcon}
        triggerStyle={triggerStyle}
        triggerTextStyle={triggerTextStyle}
      />

      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}
