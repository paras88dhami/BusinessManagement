import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

type RouterHref = Parameters<ReturnType<typeof useRouter>["replace"]>[0];
type NormalizableHref = RouterHref | string;

const stripRouteGroups = (path: string): string => {
  const withoutGroups = path.replace(/\/\([^/]+\)/g, "");
  return withoutGroups.length > 0 ? withoutGroups : "/";
};

const normalizePath = (href: NormalizableHref): string => {
  if (typeof href === "string") {
    return stripRouteGroups(href.split("?")[0].split("#")[0]);
  }

  if (href && typeof href === "object" && "pathname" in href) {
    const pathname = href.pathname;

    if (typeof pathname === "string") {
      return stripRouteGroups(pathname.split("?")[0].split("#")[0]);
    }
  }

  return "";
};

export const useSmoothNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pendingPathRef = useRef<string | null>(null);

  useEffect(() => {
    const normalizedPathname = normalizePath(pathname);

    if (pendingPathRef.current === normalizedPathname) {
      pendingPathRef.current = null;
    }
  }, [pathname]);

  const navigate = useCallback(
    (
      action: (targetPath: RouterHref) => void,
      targetPath: NormalizableHref,
    ): void => {
      const normalizedCurrentPath = normalizePath(pathname);
      const normalizedTargetPath = normalizePath(targetPath);

      if (
        !normalizedTargetPath ||
        normalizedCurrentPath === normalizedTargetPath
      ) {
        return;
      }

      if (pendingPathRef.current === normalizedTargetPath) {
        return;
      }

      pendingPathRef.current = normalizedTargetPath;

      try {
        action(targetPath as RouterHref);
      } catch (error) {
        if (pendingPathRef.current === normalizedTargetPath) {
          pendingPathRef.current = null;
        }

        throw error;
      }
    },
    [pathname],
  );

  const replace = useCallback(
    (targetPath: NormalizableHref): void => {
      navigate(router.replace, targetPath);
    },
    [navigate, router.replace],
  );

  const push = useCallback(
    (targetPath: NormalizableHref): void => {
      navigate(router.push, targetPath);
    },
    [navigate, router.push],
  );

  const prefetch = useCallback(
    (targetPath: NormalizableHref): void => {
      try {
        void router.prefetch(targetPath as RouterHref);
      } catch (error) {
        console.error("Failed to prefetch route.", error);
      }
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
