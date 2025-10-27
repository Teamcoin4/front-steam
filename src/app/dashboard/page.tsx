"use client";
import { useEffect, useState } from "react";

type Me = {
  id: number;
  steamId: string;
  personaName: string | null;
  avatar: string | null;
  createdAt: string;
};

type Summary = {
  total_games: number;
  total_playtime_minutes: number;
  recent_playtime_2weeks_minutes: number;
  most_played_game: {
    title: string;
    playtime_forever: number;
    icon?: string | null;
  } | null;
  last_played_at: string;
};

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // 1) access 토큰 발급
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) throw new Error("token issue failed");
        const j = await r.json();
        if (j?.accessToken) setToken(j.accessToken);
      } catch (e) {
        console.error(e);
        setToken(null);
      }
    })();
  }, []);

  // 2) 내 프로필 조회
  useEffect(() => {
    if (!token) {
      setMe(null);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("me fetch failed");
        const j = await res.json();
        setMe(j.data ?? j);
      } catch (e) {
        console.error(e);
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // 3) 요약 데이터 조회 (로그인 상태일 때만)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("/api/v1/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("dashboard fetch failed");
        const j = await res.json();
        setSummary(j.data?.summary ?? j.summary ?? j);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSummary(false);
      }
    })();
  }, [token]);

  const isLoggedIn = !!me && !!token;

  return (
    <main className="px-6 pt-20 pb-8">
      {/* 프로필 카드 */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 space-y-8">
        <div
          className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-md
               shadow-[0_10px_40px_rgba(0,0,0,.35)] px-8 py-6 sm:px-10 sm:py-8"
        >
          {loading ? (
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-64 bg-white/10 rounded-md animate-pulse" />
                <div className="h-4 w-72 bg-white/10 rounded-md animate-pulse" />
                <div className="h-3 w-56 bg-white/10 rounded-md animate-pulse" />
              </div>
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-6">
              {/* 아바타 */}
              <img
                src={me?.avatar ?? "/placeholder-avatar.png"}
                alt="avatar"
                className="w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28
                     rounded-xl object-cover ring-1 ring-white/15"
                referrerPolicy="no-referrer"
              />
              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white truncate">
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
            </div>
          ) : (
            // 🚫 비로그인 상태
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xl text-white font-semibold mb-1">
                  로그인이 되어있지 않습니다.
                </p>
                <p className="text-white/70 text-sm">
                  Steam 계정으로 로그인 후 대시보드를 확인하세요.
                </p>
              </div>
              <button
                onClick={() => {
                  window.location.href = "/api/v1/auth/steam"; // Steam 로그인 라우트로 이동
                }}
                className="px-5 py-2 rounded-xl text-sm font-medium
                     bg-white/15 hover:bg-white/25 active:bg-white/30
                     border border-white/20 text-white transition"
              >
                Steam으로 로그인
              </button>
            </div>
          )}
        </div>

        {/* ✅ 내 게임 요약 (로그인 상태일 때만 표시) */}
        {isLoggedIn && (
          <div
            className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-md
               shadow-[0_10px_40px_rgba(0,0,0,.35)] px-8 py-6 sm:px-10 sm:py-8"
          >
            {loadingSummary ? (
              <div className="grid grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-white/10 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : summary ? (
              <div className="text-white">
                <h3 className="text-2xl font-semibold mb-5">🎮 내 게임 요약</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* 총 게임 수 */}
                  <div className="flex flex-col justify-center items-center rounded-xl bg-white/10 hover:bg-white/15 transition p-6 text-center">
                    <p className="text-sm text-white/70 mb-2">총 게임 수</p>
                    <p className="text-3xl font-bold text-white">
                      {summary.total_games}
                    </p>
                    <p className="text-xs text-white/60 mt-1">개</p>
                  </div>

                  {/* 총 플레이타임 */}
                  <div className="flex flex-col justify-center items-center rounded-xl bg-white/10 hover:bg-white/15 transition p-6 text-center">
                    <p className="text-sm text-white/70 mb-2">총 플레이타임</p>
                    <p className="text-3xl font-bold text-white">
                      {(summary.total_playtime_minutes / 60).toFixed(1)}
                    </p>
                    <p className="text-xs text-white/60 mt-1">시간</p>
                  </div>

                  {/* 가장 많이 플레이한 게임 */}
                  <div className="flex flex-col justify-center items-center rounded-xl bg-white/10 hover:bg-white/15 transition p-6 text-center">
                    <p className="text-sm text-white/70 mb-2">가장 많이 한 게임</p>
                    {summary.most_played_game ? (
                      <>
                        <p className="text-lg font-semibold text-white truncate max-w-[150px]">
                          {summary.most_played_game.title}
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          {(summary.most_played_game.playtime_forever / 60).toFixed(1)}{" "}
                          시간
                        </p>
                      </>
                    ) : (
                      <p className="text-white/60 text-sm mt-2">기록 없음</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white/60">요약 데이터를 불러오지 못했습니다.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
