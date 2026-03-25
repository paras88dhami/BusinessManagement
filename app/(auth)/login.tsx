import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, Pin, PinIcon, User } from "lucide-react-native";
import { TextField } from "@/shared/components/reusable/Form/TextField";
import { colors } from "@/shared/components/theme/colors";
import { radius } from "@/shared/components/theme/spacing";
import { Dropdown } from "@/shared/components/reusable/DropDown/Dropdown";

const languages = [
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
  { value: "hi", label: "हिन्दी" },
];

interface AuthScreenProps {
  onSubmit?: () => void;
}

export function AuthScreen({ onSubmit }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerDropdownContainer}>
            <Dropdown
              value={selectedLang}
              options={languages}
              onChange={setSelectedLang}
            />
          </View>
        </View>

        <View style={styles.logoBox}>
          <Text style={styles.logoText}>eL</Text>
        </View>

        <Text style={styles.brand}>eLekha</Text>
        <Text style={styles.brandSub}>Your Business & Finance Companion</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <View style={styles.tabSwitcher}>
          <Pressable
            style={[styles.tabButton, isLogin && styles.tabButtonActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
              Login
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          {!isLogin ? (
            <>
              <TextField
                placeholder="Full Name"
                leftIcon={<User size={18} color={colors.mutedForeground} />}
              />

              <TextField
                placeholder="Phone Number"
                leftIcon={<Phone size={18} color={colors.mutedForeground} />}
              />
               <TextField
                placeholder="MPIN"
                leftIcon={<PinIcon size={18} color={colors.mutedForeground} />}
              />
            </>
          ) : null}

          <TextField
            placeholder="Email Address"
            leftIcon={<Mail size={18} color={colors.mutedForeground} />}
          />

          <TextField
            placeholder="Password"
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={18} color={colors.mutedForeground} />}
            rightIcon={
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                {showPassword ? (
                  <EyeOff size={18} color={colors.mutedForeground} />
                ) : (
                  <Eye size={18} color={colors.mutedForeground} />
                )}
              </Pressable>
            }
          />

          {isLogin ? <Text style={styles.forgot}>Forgot Password?</Text> : null}

          <Pressable style={styles.primaryButton} onPress={onSubmit}>
            <Text style={styles.primaryButtonText}>
              {isLogin ? "Login" : "Create Account"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.socialRow}>
          <View style={styles.line} />
          <Text style={styles.socialLabel}>or continue with</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.footerText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Text
            style={styles.footerLink}
            onPress={() => setIsLogin((prev) => !prev)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.header,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 10,
  },
  headerTopRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  headerDropdownContainer: {
    width: 110,
    paddingTop: 30,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: {
    color: colors.headerForeground,
    fontSize: 28,
    fontWeight: "900",
  },
  brand: {
    color: colors.headerForeground,
    fontSize: 28,
    fontWeight: "800",
  },
  brandSub: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    fontSize: 13,
  },
  divider: {
    height: 4,
    backgroundColor: colors.destructive,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },
  tabSwitcher: {
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    padding: 4,
    flexDirection: "row",
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: radius.md,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: "700",
  },
  tabTextActive: {
    color: colors.primaryForeground,
  },
  form: {
    gap: 12,
  },
  forgot: {
    color: colors.primary,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontWeight: "800",
    fontSize: 15,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  socialLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  socialText: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "700",
  },
  footerText: {
    textAlign: "center",
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 22,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "800",
  },
});
