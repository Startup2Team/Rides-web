"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { canAccessPath, firstAllowedPath } from "@/lib/admin-permissions";

/** Redirects to the first allowed route when the user lacks permission for the current page. */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { permissions, ready } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (canAccessPath(permissions, pathname, searchParams)) return;
    const fallback = firstAllowedPath(permissions);
    if (fallback.startsWith("/admin/login")) {
      router.replace("/admin/login");
      return;
    }
    router.replace(fallback);
  }, [ready, permissions, pathname, searchParams, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading permissions…</p>
      </div>
    );
  }

  if (!canAccessPath(permissions, pathname, searchParams)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting to your workspace…</p>
      </div>
    );
  }

  return <>{children}</>;
}
