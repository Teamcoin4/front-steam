"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { id: number; personaName?: string | null };

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

type MeResponse = { data: Me };

function isMeResponse(x: unknown): x is MeResponse {
  if (!isObj(x)) return false;
  const d = (x as Record<string, unknown>).data;
  return isObj(d) && typeof (d as Record<string, unknown>).id === "number";
}

export default function AuthButton() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean>(false);
  const [me, setMe] = useState<Me | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) return;
        const j: unknown = await r.json();

        let t: string | null = null;
        if (hasAccessTokenTop(j)) t = j.accessToken;
        else if (hasAccessTokenNested(j)) t = j.data.accessToken;

        if (!t) return;

        setToken(t);
        setAuthed(true);

        const meResp = await fetch("/api/v1/me", {
          headers: { Authorization: `Bearer ${t}` },
          cache: "no-store",
        });
        if (!meResp.ok) return;
        const mj: unknown = await meResp.json();
        if (isMeResponse(mj)) setMe(mj.data);
      } catch {}
    })();
  }, []);

  // 로그아웃
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

    setAuthed(false);
    setToken(null);
    setMe(null);
    router.replace("/");
    window.location.assign("/");
  };

  if (!authed) {
    return (
      <a
        href="/api/v1/auth/steam"
        className="px-3 py-1.5 rounded border border-white/40 text-white hover:bg-white/10 transition
                   [text-shadow:0_1px_1px_rgba(0,0,0,.6)]"
      >
        Steam 로그인
      </a>
    );
  }

  return (
    <button
      onClick={onLogout}
      className="px-3 py-1.5 rounded border border-white/40 text-white hover:bg-white/10 transition
                 [text-shadow:0_1px_1px_rgba(0,0,0,.6)]"
      title={me?.personaName ? `${me.personaName} 로그아웃` : "로그아웃"}
      aria-label="로그아웃"
    >
      로그아웃
    </button>
  );
}
