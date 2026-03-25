import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { ChevronDown, Check, Globe } from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius } from "@/shared/components/theme/spacing";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select language",
  disabled = false,
}: DropdownProps) {
  const [visible, setVisible] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((item) => item.value === value);
  }, [options, value]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => {
          if (!disabled) setVisible(true);
        }}
      >
        <View style={styles.leftContent}>
          <Globe size={14} color={colors.primary} />
          <Text style={styles.triggerText}>
            {selectedOption?.label ?? placeholder}
          </Text>
        </View>

        <ChevronDown size={16} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Choose Language</Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isSelected ? (
                      <Check size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  triggerText: {
    color: colors.cardForeground,
    fontSize: 12,
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radius.xl ?? 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "70%",
  },
  sheetTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  optionRow: {
    minHeight: 44,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRowSelected: {
    backgroundColor: colors.muted,
  },
  optionText: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "800",
  },
  separator: {
    height: 8,
  },
});
