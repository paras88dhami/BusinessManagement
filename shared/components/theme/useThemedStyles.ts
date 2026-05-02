import React from "react";
import { AppThemeContextValue, useAppTheme } from "./AppThemeProvider";

export function useThemedStyles<T extends Record<string, unknown>>(
  createStyles: (theme: AppThemeContextValue) => T,
): T {
  const theme = useAppTheme();

  return React.useMemo(() => createStyles(theme), [createStyles, theme]);
}
