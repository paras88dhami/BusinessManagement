import { Card } from "@/shared/components/reusable/Cards/Card";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { ArrowUpRight, CircleHelp, Mail } from "lucide-react-native";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { HelpFaqItem, SupportContactItem } from "../../types/settings.types";

type HelpFaqModalProps = {
  visible: boolean;
  items: readonly HelpFaqItem[];
  supportContacts: readonly SupportContactItem[];
  onClose: () => void;
};

const openLink = async (href: string): Promise<void> => {
  try {
    await Linking.openURL(href);
  } catch (error) {
    console.error("Failed to open help or support link.", error);
  }
};

export function HelpFaqModal({
  visible,
  items,
  supportContacts,
  onClose,
}: HelpFaqModalProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          gap: theme.scaleSpace(spacing.md),
        },
        faqCard: {
          gap: theme.scaleSpace(spacing.md),
        },
        faqRow: {
          gap: theme.scaleSpace(6),
        },
        faqQuestion: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(14),
          lineHeight: theme.scaleLineHeight(20),
          fontFamily: "InterSemiBold",
        },
        faqAnswer: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
        },
        faqAction: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(6),
          paddingTop: theme.scaleSpace(2),
        },
        faqActionLabel: {
          color: theme.colors.primary,
          fontSize: theme.scaleText(12),
          fontFamily: "InterSemiBold",
        },
        sectionWrap: {
          gap: theme.scaleSpace(spacing.sm),
        },
        sectionTitle: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          fontFamily: "InterBold",
          letterSpacing: 0.7,
          textTransform: "uppercase",
        },
        listCard: {
          padding: 0,
          overflow: "hidden",
        },
        contactRow: {
          minHeight: theme.scaleSpace(72),
          paddingHorizontal: theme.scaleSpace(spacing.md),
          paddingVertical: theme.scaleSpace(spacing.md),
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
        },
        rowBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        contactIconWrap: {
          width: theme.scaleSpace(38),
          height: theme.scaleSpace(38),
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.accent,
        },
        contactTextWrap: {
          flex: 1,
        },
        contactTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(15),
          fontFamily: "InterBold",
          marginBottom: 2,
        },
        contactValue: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterMedium",
        },
        infoWrap: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: theme.scaleSpace(8),
        },
        infoText: {
          flex: 1,
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(17),
          fontFamily: "InterMedium",
        },
      }),
    [theme],
  );

  return (
    <FormSheetModal
      visible={visible}
      title="Help & FAQ"
      onClose={onClose}
      presentation="bottom-sheet"
      contentContainerStyle={styles.content}
    >
      <Card style={styles.faqCard}>
        {items.map((item) => (
          <View key={item.id} style={styles.faqRow}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
            {item.href && item.actionLabel ? (
              <Pressable
                style={styles.faqAction}
                onPress={() => {
                  void openLink(item.href!);
                }}
                accessibilityRole="button"
              >
                <Text style={styles.faqActionLabel}>{item.actionLabel}</Text>
                <ArrowUpRight size={14} color={theme.colors.primary} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </Card>

      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Card style={styles.listCard}>
          {supportContacts.map((item, index) => {
            const isLast = index === supportContacts.length - 1;

            return (
              <Pressable
                key={item.id}
                style={[styles.contactRow, !isLast ? styles.rowBorder : null]}
                accessibilityRole={item.href ? "button" : "text"}
                onPress={
                  item.href
                    ? () => {
                        void openLink(item.href!);
                      }
                    : undefined
                }
              >
                <View style={styles.contactIconWrap}>
                  <Mail size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={styles.contactTitle}>{item.title}</Text>
                  <Text style={styles.contactValue}>{item.value}</Text>
                </View>
                {item.href ? (
                  <ArrowUpRight size={16} color={theme.colors.mutedForeground} />
                ) : null}
              </Pressable>
            );
          })}
        </Card>
      </View>

      <View style={styles.infoWrap}>
        <CircleHelp size={16} color={theme.colors.mutedForeground} />
        <Text style={styles.infoText}>
          Use the in-app bug report for reproducible issues and email support for
          account, privacy, or policy questions.
        </Text>
      </View>
    </FormSheetModal>
  );
}
