import React from "react";
import { createLocalLoginRepositoryWithDatabase } from "@/feature/auth/login/factory/local.login.repository.factory";
import { createLoginWithEmailUseCase } from "@/feature/auth/login/useCase/loginWithEmail.useCase.impl";
import { createLocalSignUpRepositoryWithDatabase } from "@/feature/auth/signUp/factory/local.signUp.repository.factory";
import { createSignUpWithEmailUseCase } from "@/feature/auth/signUp/useCase/signUpWithEmail.useCase.impl";
import { useAuthEntryViewModel } from "../viewModel/authEntry.viewModel.impl";
import { AuthEntryScreen } from "../ui/AuthEntryScreen";
import appDatabase from "@/shared/database/appDatabase";

type GetAuthEntryScreenFactoryProps = {
  onLoginSuccess: () => void;
  onSignUpSuccess: () => void;
  onForgotPasswordPress: () => void;
  isForgotPasswordEnabled: boolean;
};

export function GetAuthEntryScreenFactory({
  onLoginSuccess,
  onSignUpSuccess,
  onForgotPasswordPress,
  isForgotPasswordEnabled,
}: GetAuthEntryScreenFactoryProps) {
  const loginRepository = React.useMemo(
    () => createLocalLoginRepositoryWithDatabase(appDatabase),
    [],
  );

  const signUpRepository = React.useMemo(
    () => createLocalSignUpRepositoryWithDatabase(appDatabase),
    [],
  );

  const loginWithEmailUseCase = React.useMemo(
    () => createLoginWithEmailUseCase(loginRepository),
    [loginRepository],
  );

  const signUpWithEmailUseCase = React.useMemo(
    () => createSignUpWithEmailUseCase(signUpRepository),
    [signUpRepository],
  );

  const viewModel = useAuthEntryViewModel({
    database: appDatabase,
    loginWithEmailUseCase,
    signUpWithEmailUseCase,
    onLoginSuccess,
    onSignUpSuccess,
    onForgotPasswordPress,
    isForgotPasswordEnabled,
  });

  return <AuthEntryScreen viewModel={viewModel} />;
}
