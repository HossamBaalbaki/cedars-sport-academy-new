"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const API    = process.env.NEXT_PUBLIC_API_URL;
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

/**
 * Returns a `log(label, options?)` function.
 * Fire-and-forget — never throws, never blocks.
 */
export function useActivityLog() {
  const { token } = useAuth();

  const log = useCallback(
    (label: string, options?: { action?: string; path?: string; entityId?: string }) => {
      if (!token || !API) return;
      fetch(`${API}/activity-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
        },
        body: JSON.stringify({
          action: options?.action ?? "USER_ACTION",
          label,
          path: options?.path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
          entityId: options?.entityId,
        }),
      }).catch(() => {}); // silent — logging must never break the UI
    },
    [token],
  );

  return log;
}

/**
 * Logs a page visit automatically when the component mounts.
 */
export function usePageLog(label: string) {
  const log = useActivityLog();
  useEffect(() => {
    log(label, { action: "PAGE_VIEW" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
