"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ 부모에서 내려줄 Props 정의
type User = {
  id: number;
  personaName?: string | null;
};

type TokenResponse =
  | { accessToken: string }
  | { data: { accessToken: string } }
  | object;

type MeResponse = {
  data?: {
    id: number;
    personaName?: string | null;
  };
};

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

  // ✅ 로그인 상태 복구
  useEffect(() => {
    if (isLoggedIn) return;

    (async () => {
      try {
        const response = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) return;

        const tokenData: TokenResponse = await response.json();

        const token =
          ("accessToken" in tokenData && tokenData.accessToken) ||
          ("data" in tokenData &&
            tokenData.data &&
            "accessToken" in tokenData.data &&
            tokenData.data.accessToken) ||
          null;

        if (!token) return;

        setAccessToken(token);
        setIsLoggedIn(true);

        // ✅ 사용자 정보 요청
        const meRes = await fetch("/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!meRes.ok) return;

        const meData: MeResponse = await meRes.json();

        if (meData.data?.id) {
          setUser({
            id: meData.data.id,
            personaName: meData.data.personaName ?? null,
          });
        }
      } catch {
        // 실패 시 무시 (비로그인 상태 유지)
      }
    })();
  }, [isLoggedIn, setAccessToken, setIsLoggedIn, setUser]);

  // ✅ 로그아웃 핸들러
  const onLogout = async () => {
    const tryPost = async (url: string): Promise<boolean> => {
      try {
        const r = await fetch(url, { method: "POST", credentials: "include" });
        return r.ok;
      } catch {
        return false;
      }
    };

    await tryPost("/api/v1/auth/logout");
    await tryPost("/api/v1/auth/steam/logout");

    setIsLoggedIn(false);
    setAccessToken(null);
    setUser(null);

    router.replace("/");
    window.location.assign("/");
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
      onClick={onLogout}
      className="px-3 py-1.5 rounded border border-white/40 text-white hover:bg-white/10 transition"
      title={user?.personaName ? `${user.personaName} 로그아웃` : "로그아웃"}
      aria-label="로그아웃"
    >
      로그아웃
    </button>
  );
}
