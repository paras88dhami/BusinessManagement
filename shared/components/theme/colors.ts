export const lightColors = {
  background: "#F5F5F2",
  foreground: "#28352E",
  card: "#FFFFFF",
  cardForeground: "#28352E",
  primary: "#1F6340",
  primaryForeground: "#FFFFFF",
  secondary: "#EEF1EE",
  muted: "#E8ECE8",
  mutedForeground: "#6C7A71",
  accent: "#E7F2EC",
  accentForeground: "#1F6340",
  destructive: "#E44747",
  destructiveForeground: "#FFFFFF",
  success: "#2E8B57",
  successForeground: "#FFFFFF",
  warning: "#F2A81D",
  warningForeground: "#FFFFFF",
  border: "#DEE5DF",
  header: "#1F6340",
  headerForeground: "#FFFFFF",
  nav: "#FFFFFF",
  navForeground: "#6C7A71",
  navActive: "#1F6340",
  overlay: "rgba(17, 24, 39, 0.22)",
};

export const darkColors: AppColorPalette = {
  background: "#0F1115",
  foreground: "#F5F7FA",
  card: "#161A20",
  cardForeground: "#F5F7FA",
  primary: "#2F8F5B",
  primaryForeground: "#FFFFFF",
  secondary: "#1B2028",
  muted: "#171B22",
  mutedForeground: "#9AA3AF",
  accent: "#20262F",
  accentForeground: "#E3E9F0",
  destructive: "#FF6B6B",
  destructiveForeground: "#FFFFFF",
  success: "#63D394",
  successForeground: "#08140E",
  warning: "#F4C15D",
  warningForeground: "#2B1F00",
  border: "#2A303B",
  header: "#0B0D11",
  headerForeground: "#F5F7FA",
  nav: "#0B0D11",
  navForeground: "#8B95A3",
  navActive: "#F5F7FA",
  overlay: "rgba(0, 0, 0, 0.62)",
};

export type AppColorPalette = typeof lightColors;

export const colors: AppColorPalette = { ...lightColors };

export const setRuntimeColors = (palette: AppColorPalette): void => {
  for (const [tokenName, tokenValue] of Object.entries(palette) as [
    keyof AppColorPalette,
    string,
  ][]) {
    colors[tokenName] = tokenValue;
  }
};
