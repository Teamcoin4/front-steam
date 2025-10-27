"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 부모에서 내려줄 Props
type User = {
  id: number;
  personaName?: string | null;
};

// 안전한 타입가드들
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
type AccessTokenTop = { accessToken: string };
type AccessTokenNested = { data: { accessToken: string } };

function hasAccessTokenTop(x: unknown): x is AccessTokenTop {
  return (
    isObj(x) && typeof (x as Record<string, unknown>).accessToken === "string"
  );
}
function hasAccessTokenNested(x: unknown): x is AccessTokenNested {
  if (!isObj(x)) return false;
  const d = (x as Record<string, unknown>).data;
  return (
    isObj(d) && typeof (d as Record<string, unknown>).accessToken === "string"
  );
}
function extractAccessToken(j: unknown): string | null {
  if (hasAccessTokenTop(j)) return j.accessToken;
  if (hasAccessTokenNested(j)) return j.data.accessToken;
  return null;
}

type MeEnvelope = { data?: { id: number; personaName?: string | null } };

function hasMeEnvelope(x: unknown): x is MeEnvelope {
  return isObj(x) && "data" in x;
}

type AuthButtonProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export default function AuthButton({
  isLoggedIn,
  setIsLoggedIn,
  accessToken,
  setAccessToken,
  user,
  setUser,
}: AuthButtonProps) {
  const router = useRouter();

  // 로그인 상태 복구 (isLoggedIn === false && accessToken 없음일 때만 시도)
  useEffect(() => {
    if (isLoggedIn || accessToken) return;

    (async () => {
      try {
        const r = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) return;

        const j: unknown = await r.json();
        const token = extractAccessToken(j);
        if (!token) return;

        setAccessToken(token);
        setIsLoggedIn(true);

        // 사용자 정보 요청
        const meRes = await fetch("/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!meRes.ok) return;

        const mj: unknown = await meRes.json();
        if (hasMeEnvelope(mj) && mj.data && typeof mj.data.id === "number") {
          setUser({ id: mj.data.id, personaName: mj.data.personaName ?? null });
        }
      } catch {
        // 비로그인 유지
      }
    })();
  }, [isLoggedIn, accessToken, setAccessToken, setIsLoggedIn, setUser]);

  // 로그아웃
  const onLogout = async () => {
    try {
      const res = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
      await res.text();

      setAccessToken(null);
      setUser(null);
      setIsLoggedIn(false);

      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <a
        href="/api/v1/auth/steam"
        className="px-3 py-1.5 rounded border border-white/40 text-white hover:bg-white/10 transition"
      >
        Steam 로그인
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      className="px-3 py-1.5 rounded border border-white/40 text-white hover:bg-white/10 transition"
      title={user?.personaName ? `${user.personaName} 로그아웃` : "로그아웃"}
      aria-label="로그아웃"
    >
      로그아웃
    </button>
  );
}
