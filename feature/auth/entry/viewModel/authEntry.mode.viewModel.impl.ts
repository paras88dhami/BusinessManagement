import { useCallback, useMemo, useState } from "react";
import {
  AuthEntryMode,
  AuthEntryModeViewModel,
} from "./authEntry.mode.viewModel";

export const useAuthEntryModeViewModel = (): AuthEntryModeViewModel => {
  const [mode, setMode] = useState<AuthEntryMode>("login");

  const switchToLogin = useCallback(() => {
    setMode("login");
  }, []);

  const switchToSignUp = useCallback(() => {
    setMode("signup");
  }, []);

  const toggleMode = useCallback(() => {
    setMode((previousMode) => (previousMode === "login" ? "signup" : "login"));
  }, []);

  const isLoginMode = mode === "login";

  return useMemo<AuthEntryModeViewModel>(
    () => ({
      mode,
      isLoginMode,
      switchToLogin,
      switchToSignUp,
      toggleMode,
    }),
    [isLoginMode, mode, switchToLogin, switchToSignUp, toggleMode],
  );
};
