import React, { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { createLocalLoginRepositoryWithDatabase } from "@/feature/auth/login/factory/local.login.repository.factory";
import { useLoginFeature } from "@/feature/auth/login/hooks/useLoginFeature";
import { LoginScreen } from "@/feature/auth/login/ui/LoginScreen";
import { useDatabase } from "@/shared/database/DatabaseProvider";
import { Status } from "@/shared/types/status.types";

export default function LoginRoute() {
  const router = useRouter();
  const { database } = useDatabase();

  const handleOnSuccess = useCallback(() => {
    router.replace("/(account-setup)/select-account");
  }, [router]);

  const repository = useMemo(() => {
    if (!database) {
      throw new Error("Database is not ready");
    }

    return createLocalLoginRepositoryWithDatabase(database);
  }, [database]);

  const { viewModel } = useLoginFeature({
    repository,
    onSuccess: handleOnSuccess,
  });

  const submitError =
    viewModel.state.status === Status.Failure ? viewModel.state.error : undefined;

  return (
    <LoginScreen
      onSubmit={viewModel.submit}
      email={viewModel.email}
      password={viewModel.password}
      onEmailChange={viewModel.changeEmail}
      onPasswordChange={viewModel.changePassword}
      isSubmitting={viewModel.state.status === Status.Loading}
      submitError={submitError}
    />
  );
}
