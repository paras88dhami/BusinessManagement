import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import appDatabase from "@/app/database/database";
import {
  clearActiveUserSession,
  hasActiveUserSession,
} from "@/feature/appSettings/data/appSettings.store";
import {
  AccountType,
  SelectedAccountContext,
} from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";
import { GetAccountSelectionScreenFactory } from "@/feature/setting/accounts/accountSelection/factory/getAccountSelectionScreen.factory";

export default function SelectAccountRoute() {
  const router = useRouter();
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const handleBackToLogin = useCallback(async () => {
    try {
      await clearActiveUserSession(appDatabase);
      router.replace("/(auth)/login");
    } catch {
      // Keep user on this screen if session clear fails.
    }
  }, [router]);

  const handleAccountSelected = useCallback(
    async ({ accountType }: SelectedAccountContext) => {
      if (accountType === AccountType.Business) {
        router.replace("/(dashboard)/business");
        return;
      }

      router.replace("/(dashboard)/personal");
    },
    [router],
  );

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const activeSession = await hasActiveUserSession(appDatabase);

        if (!isMounted) {
          return;
        }

        setHasSession(activeSession);
      } finally {
        if (isMounted) {
          setIsSessionLoading(false);
        }
      }
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSessionLoading && !hasSession) {
      router.replace("/(auth)/login");
    }
  }, [hasSession, isSessionLoading, router]);

  if (isSessionLoading || !hasSession) {
    return null;
  }

  return (
    <GetAccountSelectionScreenFactory
      database={appDatabase}
      onBackToLogin={handleBackToLogin}
      onAccountSelected={handleAccountSelected}
    />
  );
}

