import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AuthEntryMode,
  AuthEntryModeViewModel,
} from "./authEntry.mode.viewModel";

type UseAuthEntryModeViewModelParams = {
  hasSignUpSucceeded: boolean;
};

export const useAuthEntryModeViewModel = (
  params: UseAuthEntryModeViewModelParams,
): AuthEntryModeViewModel => {
  const { hasSignUpSucceeded } = params;
  const [mode, setMode] = useState<AuthEntryMode>("login");
  const hasHandledLatestSignUpSuccess = useRef(false);

  useEffect(() => {
    if (!hasSignUpSucceeded) {
      hasHandledLatestSignUpSuccess.current = false;
      return;
    }

    if (hasHandledLatestSignUpSuccess.current) {
      return;
    }

    hasHandledLatestSignUpSuccess.current = true;
    setMode("login");
  }, [hasSignUpSucceeded]);

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
