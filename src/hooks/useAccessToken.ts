"use client";

import { useEffect, useState } from "react";

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // ← refresh 쿠키 기준으로 access 발급
        const r = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include", // 안전하게 유지
        });
        if (!r.ok) {
          setReady(true);
          return;
        }
        const j = await r.json();
        if (j?.accessToken) setToken(j.accessToken);
      } catch (e) {
        console.error("token fetch failed:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return { token, ready };
}
