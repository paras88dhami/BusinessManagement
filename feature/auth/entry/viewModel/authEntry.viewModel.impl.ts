import { Database } from "@nozbe/watermelondb";
import { useCallback, useMemo } from "react";
import { LoginWithEmailUseCase } from "@/feature/auth/login/useCase/loginWithEmail.useCase";
import { SignUpWithEmailUseCase } from "@/feature/auth/signUp/useCase/signUpWithEmail.useCase";
import { useAuthEntryLanguageViewModel } from "./authEntry.language.viewModel.impl";
import { useAuthEntryLoginViewModel } from "./authEntry.login.viewModel.impl";
import { useAuthEntryModeViewModel } from "./authEntry.mode.viewModel.impl";
import { useAuthEntrySignUpViewModel } from "./authEntry.signUp.viewModel.impl";
import { AuthEntryViewModel } from "./authEntry.viewModel";
import { SignUpSessionRecoveryInput } from "@/feature/auth/signUp/viewModel/signUp.viewModel";

type UseAuthEntryViewModelParams = {
  database: Database;
  loginWithEmailUseCase: LoginWithEmailUseCase;
  signUpWithEmailUseCase: SignUpWithEmailUseCase;
  onLoginSuccess: () => void;
  onSignUpSuccess: () => void;
  onForgotPasswordPress: () => void;
  isForgotPasswordEnabled: boolean;
};

export const useAuthEntryViewModel = (
  params: UseAuthEntryViewModelParams,
): AuthEntryViewModel => {
  const {
    database,
    loginWithEmailUseCase,
    signUpWithEmailUseCase,
    onLoginSuccess,
    onSignUpSuccess,
    onForgotPasswordPress,
    isForgotPasswordEnabled,
  } = params;

  const language = useAuthEntryLanguageViewModel({ database });
  const mode = useAuthEntryModeViewModel();

  const login = useAuthEntryLoginViewModel({
    loginWithEmailUseCase,
    onSuccess: onLoginSuccess,
  });

  const handleSignUpSuccess = useCallback(() => {
    mode.switchToLogin();
    onSignUpSuccess();
  }, [mode, onSignUpSuccess]);

  const handleSignUpSessionActivationFailed = useCallback(
    (recovery: SignUpSessionRecoveryInput) => {
      mode.switchToLogin();
      login.applySignUpRecovery({
        phoneCountryCode: recovery.phoneCountryCode,
        phoneNumber: recovery.phoneNumber,
        message: recovery.message,
      });
    },
    [login, mode],
  );

  const signUp = useAuthEntrySignUpViewModel({
    signUpWithEmailUseCase,
    onSuccess: handleSignUpSuccess,
    onSessionActivationFailed: handleSignUpSessionActivationFailed,
  });

  return useMemo<AuthEntryViewModel>(
    () => ({
      language,
      mode,
      login,
      signUp,
      onForgotPasswordPress,
      isForgotPasswordEnabled,
    }),
    [isForgotPasswordEnabled, language, login, mode, onForgotPasswordPress, signUp],
  );
};
