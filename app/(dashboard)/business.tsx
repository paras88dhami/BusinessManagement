import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import appDatabase from "@/app/database/database";
import {
  clearActiveUserSession,
  getAppSessionState,
} from "@/feature/appSettings/data/appSettings.store";
import { GetBusinessDashboardScreenFactory } from "@/feature/dashboard/business/factory/getBusinessDashboardScreen.factory";

export default function BusinessDashboardRoute() {
  const router = useRouter();
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [hasActiveAccount, setHasActiveAccount] = useState(false);

  const handleSwitchAccount = useCallback(() => {
    router.replace("/(account-setup)/select-account");
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await clearActiveUserSession(appDatabase);
      router.replace("/(auth)/login");
    } catch {
      // Keep user on dashboard if logout fails.
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const resolveContext = async () => {
      try {
        const sessionState = await getAppSessionState(appDatabase);

        if (!isMounted) {
          return;
        }

        setHasActiveSession(Boolean(sessionState.activeUserRemoteId));
        setHasActiveAccount(Boolean(sessionState.activeAccountRemoteId));
      } finally {
        if (isMounted) {
          setIsContextLoading(false);
        }
      }
    };

    void resolveContext();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isContextLoading) {
      return;
    }

    if (!hasActiveSession) {
      router.replace("/(auth)/login");
      return;
    }

    if (!hasActiveAccount) {
      router.replace("/(account-setup)/select-account");
    }
  }, [hasActiveAccount, hasActiveSession, isContextLoading, router]);

  if (isContextLoading || !hasActiveSession || !hasActiveAccount) {
    return null;
  }

  return (
    <GetBusinessDashboardScreenFactory
      onSwitchAccount={handleSwitchAccount}
      onLogout={handleLogout}
    />
  );
}
