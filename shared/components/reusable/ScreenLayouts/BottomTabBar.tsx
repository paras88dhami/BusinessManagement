import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowLeftRight,
  BookOpen,
  Home,
  MoreHorizontal,
  ShoppingCart,
} from "lucide-react-native";
import { RouteName } from "@/shared/types/navigation";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";

interface BottomTabBarProps {
  route: RouteName;
  onNavigate: (route: RouteName) => void;
}

const items = [
  { key: "home" as const, label: "Home", icon: Home },
  { key: "ledger" as const, label: "Ledger", icon: BookOpen },
  { key: "pos" as const, label: "POS", icon: ShoppingCart, center: true },
  { key: "transactions" as const, label: "Txns", icon: ArrowLeftRight },
  { key: "more" as const, label: "More", icon: MoreHorizontal },
];

export function BottomTabBar({ route, onNavigate }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = route === item.key;

          if (item.center) {
            return (
              <Pressable
                key={item.key}
                style={styles.centerItem}
                onPress={() => onNavigate(item.key)}
              >
                <View style={styles.centerCircle}>
                  <Icon color={colors.primaryForeground} size={24} />
                </View>
                <Text style={[styles.label, active && styles.activeLabel]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={item.key}
              style={styles.item}
              onPress={() => onNavigate(item.key)}
            >
              <Icon
                color={active ? colors.navActive : colors.navForeground}
                size={21}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: colors.nav,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  centerItem: {
    flex: 1,
    alignItems: "center",
    marginTop: -28,
  },
  centerCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    color: colors.navForeground,
    fontSize: 10,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.navActive,
    fontWeight: "800",
  },
});
