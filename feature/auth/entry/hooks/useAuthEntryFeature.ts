import { useMemo } from "react";
import { useLoginViewModel } from "@/feature/auth/login/viewModel/login.viewModel.impl";
import { LoginWithEmailUseCase } from "@/feature/auth/login/useCase/loginWithEmail.useCase";
import { useSignUpViewModel } from "@/feature/auth/signUp/viewModel/signUp.viewModel.impl";
import { SignUpWithEmailUseCase } from "@/feature/auth/signUp/useCase/signUpWithEmail.useCase";
import { Status } from "@/shared/types/status.types";
import { AuthEntryViewModel } from "../viewModel/authEntry.viewModel";

type UseAuthEntryFeatureParams = {
  loginWithEmailUseCase: LoginWithEmailUseCase;
  signUpWithEmailUseCase: SignUpWithEmailUseCase;
  onSuccess?: () => void;
  onForgotPasswordPress?: () => void;
};

export function useAuthEntryFeature(params: UseAuthEntryFeatureParams) {
  const {
    loginWithEmailUseCase,
    signUpWithEmailUseCase,
    onSuccess,
    onForgotPasswordPress,
  } = params;

  const loginViewModel = useLoginViewModel(loginWithEmailUseCase, {
    onSuccess,
  });

  const signUpViewModel = useSignUpViewModel(signUpWithEmailUseCase, {
    onSuccess,
  });

  const isLoginSubmitting = loginViewModel.state.status === Status.Loading;
  const loginSubmitError =
    loginViewModel.state.status === Status.Failure
      ? loginViewModel.state.error
      : undefined;

  const isSignUpSubmitting = signUpViewModel.state.status === Status.Loading;
  const signUpSubmitError =
    signUpViewModel.state.status === Status.Failure
      ? signUpViewModel.state.error
      : undefined;

  const viewModel = useMemo<AuthEntryViewModel>(
    () => ({
      login: {
        control: loginViewModel.control,
        clearSubmitError: loginViewModel.clearSubmitError,
        isPasswordVisible: loginViewModel.isPasswordVisible,
        togglePasswordVisibility: loginViewModel.togglePasswordVisibility,
        isSubmitting: isLoginSubmitting,
        submitError: loginSubmitError,
        submit: loginViewModel.submit,
      },
      signUp: {
        control: signUpViewModel.control,
        clearSubmitError: signUpViewModel.clearSubmitError,
        isPasswordVisible: signUpViewModel.isPasswordVisible,
        togglePasswordVisibility: signUpViewModel.togglePasswordVisibility,
        isSubmitting: isSignUpSubmitting,
        submitError: signUpSubmitError,
        submit: signUpViewModel.submit,
      },
      onForgotPasswordPress,
    }),
    [
      isLoginSubmitting,
      loginSubmitError,
      loginViewModel.clearSubmitError,
      loginViewModel.control,
      loginViewModel.isPasswordVisible,
      loginViewModel.submit,
      loginViewModel.togglePasswordVisibility,
      isSignUpSubmitting,
      signUpSubmitError,
      signUpViewModel.clearSubmitError,
      signUpViewModel.control,
      signUpViewModel.isPasswordVisible,
      signUpViewModel.submit,
      signUpViewModel.togglePasswordVisibility,
      onForgotPasswordPress,
    ],
  );

  return { viewModel };
}
