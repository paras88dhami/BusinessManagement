import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type ElekhaLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const LOGO_CIRCLE_COLOR = "#0B4F2E";
const LOGO_TEXT_COLOR = "#FFFFFF";

export function ElekhaLogo({ size = 96, style }: ElekhaLogoProps) {
  const borderRadius = size / 2;
  const fontSize = Math.round(size * 0.42);
  const lineHeight = Math.round(size * 0.45);

  return (
    <View
      style={[
        styles.logoCircle,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.logoText,
          {
            fontSize,
            lineHeight,
          },
        ]}
      >
        eL
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoCircle: {
    backgroundColor: LOGO_CIRCLE_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: LOGO_TEXT_COLOR,
    fontFamily: "InterSemiBold",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
