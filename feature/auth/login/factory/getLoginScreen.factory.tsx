import React from "react";
import { Database } from "@nozbe/watermelondb";
import { createLoginWithEmailUseCase } from "../useCase/loginWithEmail.useCase.impl";
import { LoginScreenContainer } from "../ui/LoginScreenContainer";
import { createLocalLoginRepositoryWithDatabase } from "./local.login.repository.factory";
import { createSignUpWithEmailUseCase } from "@/feature/auth/signUp/useCase/signUpWithEmail.useCase.impl";
import { createLocalSignUpRepositoryWithDatabase } from "@/feature/auth/signUp/factory/local.signUp.repository.factory";

type GetLoginScreenFactoryProps = {
  database: Database;
  onSuccess?: () => void;
  onForgotPasswordPress?: () => void;
};

export function GetLoginScreenFactory({
  database,
  onSuccess,
  onForgotPasswordPress,
}: GetLoginScreenFactoryProps) {
  const loginRepository = createLocalLoginRepositoryWithDatabase(database);
  const signUpRepository = createLocalSignUpRepositoryWithDatabase(database);

  const loginWithEmailUseCase = createLoginWithEmailUseCase(loginRepository);
  const signUpWithEmailUseCase = createSignUpWithEmailUseCase(signUpRepository);

  return (
    <LoginScreenContainer
      loginWithEmailUseCase={loginWithEmailUseCase}
      signUpWithEmailUseCase={signUpWithEmailUseCase}
      onSuccess={onSuccess}
      onForgotPasswordPress={onForgotPasswordPress}
    />
  );
}
