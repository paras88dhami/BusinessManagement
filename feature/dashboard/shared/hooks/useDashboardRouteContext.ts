import {
  DashboardRouteContext,
  useAppRouteSession,
} from "@/feature/session/ui/AppRouteSessionProvider";

export const useDashboardRouteContext = (): DashboardRouteContext => {
  return useAppRouteSession();
};
