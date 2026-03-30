import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

const NAVIGATION_LOCK_MS = 180;

type SmoothHref = Parameters<ReturnType<typeof useRouter>["replace"]>[0];
type NormalizableHref = SmoothHref | string;

const normalizePath = (href: NormalizableHref): string => {
  if (typeof href === "string") {
    return href.split("?")[0].split("#")[0];
  }

  if (href && typeof href === "object" && "pathname" in href) {
    const pathname = href.pathname;

    if (typeof pathname === "string") {
      return pathname.split("?")[0].split("#")[0];
    }
  }

  return "";
};

export const useSmoothNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    isTransitioningRef.current = false;
  }, [pathname]);

  const withNavigationLock = useCallback((action: () => void): void => {
    if (isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    action();

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, NAVIGATION_LOCK_MS);
  }, []);

  const replace = useCallback(
    (targetPath: SmoothHref): void => {
      const normalizedTargetPath = normalizePath(targetPath);

      if (normalizePath(pathname) === normalizedTargetPath) {
        return;
      }

      withNavigationLock(() => {
        router.replace(targetPath);
      });
    },
    [pathname, router, withNavigationLock],
  );

  const push = useCallback(
    (targetPath: SmoothHref): void => {
      const normalizedTargetPath = normalizePath(targetPath);

      if (normalizePath(pathname) === normalizedTargetPath) {
        return;
      }

      withNavigationLock(() => {
        router.push(targetPath);
      });
    },
    [pathname, router, withNavigationLock],
  );

  const prefetch = useCallback(
    (targetPath: SmoothHref): void => {
      void router.prefetch(targetPath);
    },
    [router],
  );

  return useMemo(
    () => ({
      pathname,
      replace,
      push,
      prefetch,
    }),
    [pathname, prefetch, push, replace],
  );
};
