import {
  StartupBootstrapState,
  StartupBootstrapStatus,
} from "@/feature/startup/types/startup.types";

export interface StartupBootstrapViewModel extends StartupBootstrapState {
  retry: () => Promise<void>;
}

export const INITIAL_STARTUP_BOOTSTRAP_STATE: StartupBootstrapState = {
  status: StartupBootstrapStatus.Loading,
  errorMessage: null,
  failedTaskKey: null,
  failureKind: null,
  reasonCode: null,
  technicalErrorMessage: null,
};
