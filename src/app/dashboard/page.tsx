"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/auth/token", { method: "POST" });
        const j = await r.json();
        if (j?.accessToken) setToken(j.accessToken);
        else console.warn("no access token");
      } catch (e) {
        console.error("token fetch failed", e);
      }
    })();
  }, []);

  async function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`/api/${path}`, { ...init, headers });
  }

  if (!token) return <div>로딩중...</div>;

  return (
    <main>
      <h1>Dashboard</h1>
      <button
        onClick={async () => {
          const res = await api("/v1/profile", { method: "GET" });
          console.log("profile", await res.json());
        }}
      >
        내 프로필 불러오기
      </button>
    </main>
  );
}
