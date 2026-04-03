import { useCallback, useEffect, useMemo, useState } from "react";
import { StartupBootstrapStatus } from "@/feature/startup/types/startup.types";
import { BootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase";
import {
  INITIAL_STARTUP_BOOTSTRAP_STATE,
  StartupBootstrapViewModel,
} from "@/feature/startup/viewModel/startupBootstrap.viewModel";

type UseStartupBootstrapViewModelParams = {
  bootstrapStartupUseCase: BootstrapStartupUseCase;
};

export const useStartupBootstrapViewModel = ({
  bootstrapStartupUseCase,
}: UseStartupBootstrapViewModelParams): StartupBootstrapViewModel => {
  const [state, setState] = useState(INITIAL_STARTUP_BOOTSTRAP_STATE);

  const runBootstrap = useCallback(async () => {
    setState({
      status: StartupBootstrapStatus.Loading,
      errorMessage: null,
      failedTaskKey: null,
    });

    const result = await bootstrapStartupUseCase.execute();

    if (!result.success) {
      setState({
        status: StartupBootstrapStatus.Failed,
        errorMessage: result.error.message,
        failedTaskKey: result.error.failedTaskKey,
      });
      return;
    }

    setState({
      status: StartupBootstrapStatus.Ready,
      errorMessage: null,
      failedTaskKey: null,
    });
  }, [bootstrapStartupUseCase]);

  useEffect(() => {
    void runBootstrap();
  }, [runBootstrap]);

  return useMemo(
    () => ({
      ...state,
      retry: runBootstrap,
    }),
    [runBootstrap, state],
  );
};
