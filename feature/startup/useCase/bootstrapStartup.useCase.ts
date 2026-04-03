import { StartupBootstrapResult } from "@/feature/startup/types/startup.types";

export interface BootstrapStartupUseCase {
  execute(): Promise<StartupBootstrapResult>;
}
