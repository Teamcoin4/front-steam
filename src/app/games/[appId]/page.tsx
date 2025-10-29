"use client";
import { useEffect, useState } from "react";

interface GameDetail {
  gameId: number;
  title: string;
  icon: string | null;
  playtime_forever: number;
  playtime_2weeks: number;
  last_played_at: string | null;
  achievement_total: number;
  achievement_unlocked: number;
  achievement_rate: number;
}

interface AccessTokenTop {
  accessToken: string;
}
interface AccessTokenNested {
  data: { accessToken: string };
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function hasAccessTokenTop(x: unknown): x is AccessTokenTop {
  return isObject(x) && typeof (x as Record<string, unknown>).accessToken === "string";
}
function hasAccessTokenNested(x: unknown): x is AccessTokenNested {
  if (!isObject(x)) return false;
  const d = (x as Record<string, unknown>).data;
  return isObject(d) && typeof (d as Record<string, unknown>).accessToken === "string";
}
function extractAccessToken(j: unknown): string | null {
  if (hasAccessTokenTop(j)) return j.accessToken;
  if (hasAccessTokenNested(j)) return j.data.accessToken;
  return null;
}

export default function GameDetailPage({ params }: { params: { appId: string } }) {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<GameDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ 1) 토큰 자동 발급
  useEffect(() => {
    const getToken = async (): Promise<void> => {
      try {
        const r = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include", // 쿠키 인증 포함
        });
        if (!r.ok) throw new Error("토큰 발급 실패");
        const j: unknown = await r.json();
        const accessToken = extractAccessToken(j);
        if (!accessToken) throw new Error("accessToken 없음");
        setToken(accessToken);
      } catch (err) {
        console.error("[token fetch error]", err);
        setError("로그인이 필요합니다. Steam으로 먼저 로그인해주세요.");
      }
    };

    void getToken();
  }, []);

  // ✅ 2) 토큰이 생기면 게임 상세 정보 요청
  useEffect(() => {
    if (!token) return;

    const fetchGameDetail = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/v1/games/${params.appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json: GameDetail = await res.json();
        setData(json);
      } catch (fetchError) {
        console.error("fetchGameDetail error:", fetchError);
        setError("게임 정보를 불러오지 못했습니다.");
      }
    };

    void fetchGameDetail();
  }, [params.appId, token]);

  if (error) {
    return <main className="p-10 text-center text-red-400">{error}</main>;
  }

  if (!data) {
    return <main className="p-10 text-center text-gray-400">로딩 중...</main>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>

      {data.icon && (
        <img
          src={data.icon}
          alt={data.title}
          className="rounded-lg shadow-md mx-auto mb-6"
          width={400}
        />
      )}

      <section className="text-lg leading-relaxed space-y-2">
        <p>🕹️ 총 플레이타임: {Math.floor(data.playtime_forever / 60)}시간</p>
        <p>🗓️ 마지막 플레이: {data.last_played_at ? new Date(data.last_played_at).toLocaleString() : "기록 없음"}</p>
        <p>🏆 업적 달성률: {data.achievement_rate}%</p>
        <p>({data.achievement_unlocked} / {data.achievement_total} 개)</p>
      </section>
    </main>
  );
}
