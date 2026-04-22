import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const inFlightBootstrapRef = useRef<Promise<void> | null>(null);

  const runBootstrap = useCallback(async () => {
    if (inFlightBootstrapRef.current) {
      return inFlightBootstrapRef.current;
    }

    const execution = (async () => {
      setState({
        status: StartupBootstrapStatus.Loading,
        errorMessage: null,
        failedTaskKey: null,
        failureKind: null,
        reasonCode: null,
        technicalErrorMessage: null,
      });

      const result = await bootstrapStartupUseCase.execute();

      if (!result.success) {
        setState({
          status: StartupBootstrapStatus.Failed,
          errorMessage: result.error.message,
          failedTaskKey: result.error.failedTaskKey,
          failureKind: result.error.failureKind,
          reasonCode: result.error.reasonCode,
          technicalErrorMessage: result.error.technicalMessage,
        });
        return;
      }

      setState({
        status: StartupBootstrapStatus.Ready,
        errorMessage: null,
        failedTaskKey: null,
        failureKind: null,
        reasonCode: null,
        technicalErrorMessage: null,
      });
    })();

    inFlightBootstrapRef.current = execution.finally(() => {
      inFlightBootstrapRef.current = null;
    });

    return inFlightBootstrapRef.current;
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
