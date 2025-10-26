"use client";
import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type Me = {
  id: number;
  steamId: string;
  personaName: string | null;
  avatar: string | null;
  createdAt: string; // 서버 가입일
};

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ access 토큰 발급
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/auth/steam/refresh`, {
          method: "POST",
          credentials: "include", // 쿠키 포함
        });
        if (!r.ok) throw new Error("token issue failed");
        const j = await r.json();
        if (j?.accessToken) setToken(j.accessToken);
      } catch (e) {
        console.error("[refresh error]", e);
      }
    })();
  }, []);

  // 2️⃣ 내 프로필 조회
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        console.log("[me fetch] token:", token);
        const res = await fetch(`${API_BASE}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include", // 헤더 인증과 함께 쿠키 유지
        });
        console.log("[me fetch] status:", res.status);
        if (!res.ok) throw new Error("me fetch failed");
        const j = await res.json();
        setMe(j.data ?? j);
      } catch (e) {
        console.error("[me fetch error]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <main className="px-6 pt-20 pb-8">
      <section className="relative z-10 max-w-5xl mx-auto px-5">
        <div
          className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-md
          shadow-[0_10px_40px_rgba(0,0,0,.35)] px-8 py-6 sm:px-10 sm:py-8"
        >
          {loading ? (
            // 로딩 스켈레톤
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-64 bg-white/10 rounded-md animate-pulse" />
                <div className="h-4 w-72 bg-white/10 rounded-md animate-pulse" />
                <div className="h-3 w-56 bg-white/10 rounded-md animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {/* 아바타 */}
              <img
                src={me?.avatar ?? "/placeholder-avatar.png"}
                alt="avatar"
                className="w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28
                rounded-xl object-cover ring-1 ring-white/15"
                referrerPolicy="no-referrer"
              />

              {/* 프로필 텍스트 */}
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white
                drop-shadow-[0_1px_1px_rgba(0,0,0,.4)] truncate">
                  {me?.personaName || "(이름 없음)"}
                </h2>

                <div className="mt-2 space-y-1">
                  <p className="text-base sm:text-lg text-white/85">
                    <span className="opacity-80">SteamID:</span>{" "}
                    <span className="font-medium">{me?.steamId ?? "-"}</span>
                  </p>
                  <p className="text-sm text-white/60">
                    가입일:{" "}
                    {me?.createdAt
                      ? new Date(me.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>

              {/* 새로고침 버튼 */}
              <button
                onClick={async () => {
                  if (!token) return;
                  const r = await fetch(`${API_BASE}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                    cache: "no-store",
                  });
                  if (r.ok) {
                    const j = await r.json();
                    setMe(j.data ?? j);
                  }
                }}
                className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium
                bg-white/12 hover:bg-white/18 active:bg-white/22
                border border-white/15 transition"
              >
                새로고침
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
