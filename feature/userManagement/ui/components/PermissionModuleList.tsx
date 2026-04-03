import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, Circle } from "lucide-react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { UserManagementPermission } from "../../types/userManagement.types";

export type PermissionModuleGroup = {
  module: string;
  permissions: UserManagementPermission[];
};

type PermissionModuleListProps = {
  permissionGroups: readonly PermissionModuleGroup[];
  selectedPermissionCodes: readonly string[];
  editable: boolean;
  disabled: boolean;
  onTogglePermission: (permissionCode: string) => void;
};

export function PermissionModuleList({
  permissionGroups,
  selectedPermissionCodes,
  editable,
  disabled,
  onTogglePermission,
}: PermissionModuleListProps) {
  return (
    <>
      {permissionGroups.map((permissionGroup) => (
        <Card key={permissionGroup.module} style={styles.permissionGroupWrap}>
          <Text style={styles.permissionGroupTitle}>{permissionGroup.module}</Text>

          {permissionGroup.permissions.map((permission) => {
            const isSelected = selectedPermissionCodes.includes(permission.code);
            const canToggle = editable && !disabled;

            return canToggle ? (
              <Pressable
                key={permission.code}
                style={styles.permissionRow}
                onPress={() => onTogglePermission(permission.code)}
                accessibilityRole="button"
              >
                <View style={styles.permissionToggleIconWrap}>
                  {isSelected ? (
                    <Check size={15} color={colors.success} />
                  ) : (
                    <Circle size={15} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={styles.permissionRowTextWrap}>
                  <Text style={styles.permissionRowTitle}>{permission.label}</Text>
                  <Text style={styles.permissionRowSubtitle}>{permission.description}</Text>
                </View>
              </Pressable>
            ) : (
              <View key={permission.code} style={styles.permissionRow}>
                <View style={styles.permissionToggleIconWrap}>
                  {isSelected ? (
                    <Check size={15} color={colors.success} />
                  ) : (
                    <Circle size={15} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={styles.permissionRowTextWrap}>
                  <Text style={styles.permissionRowTitle}>{permission.label}</Text>
                  <Text style={styles.permissionRowSubtitle}>{permission.description}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  permissionGroupWrap: {
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  permissionGroupTitle: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingVertical: 4,
  },
  permissionToggleIconWrap: {
    width: 20,
    alignItems: "center",
    paddingTop: 2,
  },
  permissionRowTextWrap: {
    flex: 1,
  },
  permissionRowTitle: {
    color: colors.cardForeground,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
  permissionRowSubtitle: {
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
