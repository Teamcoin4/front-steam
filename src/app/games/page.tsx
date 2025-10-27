"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Me = {
  id: number;
  steamId: string;
  personaName: string | null;
  avatar: string | null;
  createdAt: string;
};

type OwnedGame = {
  appId: number;
  name: string;
  playtimeForever: number;
  playtime2Weeks?: number | null;
  lastPlayedAt?: string | null;
  headerImage?: string | null;
};

// ====== [여기부터: 백엔드 실제 응답 스키마를 위한 타입/가드/매핑 추가] ======
type OwnedGameApi = {
  appId: number;
  name: string;
  icon?: string | null;
  headerImage?: string | null;
  you?: {
    playtimeForever?: number;
    playtime2Weeks?: number | null;
    lastPlayedAt?: string | null;
  } | null;
};

type AccessTokenTop = { accessToken: string };

type AccessTokenNested = { data: { accessToken: string } };

function hasAccessTokenTop(x: unknown): x is AccessTokenTop {
  return (
    isObject(x) &&
    typeof (x as Record<string, unknown>).accessToken === "string"
  );
}
function hasAccessTokenNested(x: unknown): x is AccessTokenNested {
  if (!isObject(x)) return false;
  const d = (x as Record<string, unknown>).data;
  return (
    isObject(d) &&
    typeof (d as Record<string, unknown>).accessToken === "string"
  );
}
function extractAccessToken(j: unknown): string | null {
  if (hasAccessTokenTop(j)) return j.accessToken;
  if (hasAccessTokenNested(j)) return j.data.accessToken;
  return null;
}

type DataWithItems<T> = { data: { items: T[]; total?: number } };
function hasDataWithItemsOwnedGameApi(
  x: unknown
): x is DataWithItems<OwnedGameApi> {
  if (!isObject(x)) return false;
  const d = (x as Record<string, unknown>).data;
  if (!isObject(d)) return false;
  return Array.isArray((d as Record<string, unknown>).items);
}

type MeEnvelope = { data: Partial<Me> | null | undefined };
function hasMeEnvelope(x: unknown): x is MeEnvelope {
  return isObject(x) && "data" in (x as Record<string, unknown>);
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isTopLevelPagedApi(
  x: unknown
): x is { items: OwnedGameApi[]; total: number; page: number; size: number } {
  if (!isObject(x)) return false;
  const r = x as Record<string, unknown>;
  return Array.isArray(r.items) && typeof r.total === "number";
}

function toOwnedGameVM(g: OwnedGameApi): OwnedGame {
  return {
    appId: g.appId,
    name: g.name,
    playtimeForever: g.you?.playtimeForever ?? 0,
    playtime2Weeks: g.you?.playtime2Weeks ?? null,
    lastPlayedAt: g.you?.lastPlayedAt ?? null,
    headerImage: g.headerImage ?? null,
  };
}

interface Paged<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}
interface Envelope<T> {
  data: T | null | undefined;
  error: null | { code: string; message: string };
}
type GamesEnvelope = Envelope<Paged<OwnedGame>>;

function isPagedOwnedGames(x: unknown): x is Paged<OwnedGame> {
  if (!isObject(x)) return false;
  return (
    Array.isArray((x as Record<string, unknown>).items) &&
    typeof (x as Record<string, unknown>).page === "number" &&
    typeof (x as Record<string, unknown>).size === "number" &&
    typeof (x as Record<string, unknown>).total === "number"
  );
}

function isGamesEnvelopeStrict(x: unknown): x is GamesEnvelope {
  if (!isObject(x)) return false;
  const r = x as Record<string, unknown>;
  const hasError =
    r.error === null ||
    (isObject(r.error) &&
      typeof (r.error as Record<string, unknown>).message === "string");
  if (!hasError) return false;
  if (r.data == null) return true;
  return isPagedOwnedGames(r.data);
}

function fmtMinutes(min: number | null | undefined) {
  if (!min) return "-";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
function buildHeaderImage(game: OwnedGame) {
  if (game.headerImage) return game.headerImage;
  return `https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`;
}
function useDebounced<T>(value: T, delayMs: number): T {
  const [v, setV] = useState<T>(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return v;
}

export default function OwnedGamesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  const [sort, setSort] = useState<"playtimeForever" | "name" | "lastPlayedAt">(
    "playtimeForever"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(30);
  const [keyword, setKeyword] = useState<string>("");
  const debouncedKeyword = useDebounced(keyword, 300);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<OwnedGame[]>([]);
  const [total, setTotal] = useState<number>(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / size)),
    [total, size]
  );

  // 1) 토큰 발급 + 내 정보 로딩
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/auth/steam/token", {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) throw new Error("토큰 발급 실패");
        const j: unknown = await r.json();
        const accessToken = extractAccessToken(j);
        if (!accessToken) throw new Error("accessToken 없음");

        setToken(accessToken);

        // 내 정보는 실패해도 치명적이지 않으니 optional
        void fetch("/api/v1/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        })
          .then((r2) => (r2.ok ? r2.json() : null))
          .then((m: unknown) => {
            if (
              m &&
              hasMeEnvelope(m) &&
              m.data &&
              typeof m.data.id === "number"
            ) {
              setMe(m.data as Me);
            }
          })
          .catch(() => void 0);
      } catch (e) {
        console.error(e);
        setError("로그인이 필요합니다. Steam으로 먼저 로그인해 주세요.");
      }
    })();
  }, []);

  // 2) 게임 목록 로딩
  useEffect(() => {
    if (!token) return;
    let aborted = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sort,
      order,
      page: String(page),
      size: String(size),
    });
    if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());

    fetch(`/api/v1/me/games?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const raw: unknown = await r.json();
        if (aborted) return;

        // ✅ (1) 최상위 페이징(JSON 최상단이 {items,total,...}) – 네가 보낸 응답 형태
        if (isTopLevelPagedApi(raw)) {
          const arr = raw.items.map(toOwnedGameVM);
          setItems(arr);
          setTotal(raw.total);
          return;
        }

        // ✅ (2) Envelope 엄격 모드
        if (isGamesEnvelopeStrict(raw)) {
          const env = raw as GamesEnvelope;
          if (env.error) throw new Error(env.error.message ?? "오류");
          if (env.data && isPagedOwnedGames(env.data)) {
            setItems(env.data.items);
            setTotal(env.data.total);
          } else {
            setItems([]);
            setTotal(0);
          }
          return;
        }

        // ✅ (3) 느슨한 data.items 모드 (백엔드가 data로 한 번 감싸서 줄 때)
        if (hasDataWithItemsOwnedGameApi(raw)) {
          const arr = raw.data.items.map(toOwnedGameVM);
          setItems(arr);
          setTotal(
            typeof raw.data.total === "number" ? raw.data.total : arr.length
          );
          return;
        }

        // 파싱 실패 시 빈 목록
        setItems([]);
        setTotal(0);
      })
      .catch((e) => {
        if (aborted) return;
        console.error(e);
        setError("보유 게임 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => {
      aborted = true;
    };
  }, [token, sort, order, page, size, debouncedKeyword]);

  const onChangeSort: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value as typeof sort;
    setSort(v);
  };
  const onChangeOrder: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value as typeof order;
    setOrder(v);
  };
  const onChangeSize: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const n = Number(e.target.value);
    setSize(n);
    setPage(1);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {me?.avatar ? (
            <Image
              src={me.avatar}
              alt="avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/10 object-cover"
              unoptimized
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-700" />
          )}
          <div>
            <h1 className="text-xl font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.8)]">
              보유 게임
            </h1>
            <p className="text-sm text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,.6)]">
              {me?.personaName
                ? `${me.personaName}님의 라이브러리`
                : "내 라이브러리"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="게임 검색 (이름)"
            className="w-56 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={sort}
            onChange={onChangeSort}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="playtimeForever">플레이타임</option>
            <option value="lastPlayedAt">최근 실행</option>
            <option value="name">이름</option>
          </select>

          <select
            value={order}
            onChange={onChangeOrder}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>

          <select
            value={size}
            onChange={onChangeSize}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value={15}>15개</option>
            <option value={30}>30개</option>
            <option value={60}>60개</option>
            <option value={100}>100개</option>
          </select>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur-sm ring-1 ring-white/10">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">
            불러오는 중…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            보유한 게임이 없거나 검색 결과가 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((g) => (
              <li key={g.appId} className="flex items-center gap-4 p-4">
                <div className="h-16 w-28 flex-none overflow-hidden rounded-lg bg-gray-800">
                  <Image
                    src={buildHeaderImage(g)}
                    alt={g.name}
                    fill
                    className="object-cover"
                    sizes="112px" // (w-28 = 112px 정도)
                    unoptimized
                    onError={() => {
                      /* 필요 시 상태로 대체 이미지 처리 */
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate pr-2 text-base font-semibold text-slate-100">
                      {g.name}
                    </h3>
                    <span className="text-sm text-slate-300/90">
                      appid: {g.appId}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
                    <span>
                      총 플레이: <b>{fmtMinutes(g.playtimeForever)}</b>
                    </span>
                    <span>
                      최근 2주: <b>{fmtMinutes(g.playtime2Weeks ?? null)}</b>
                    </span>
                    <span>
                      최근 실행:{" "}
                      <b>
                        {g.lastPlayedAt
                          ? new Date(g.lastPlayedAt).toLocaleString()
                          : "-"}
                      </b>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          총 <b>{total.toLocaleString()}</b>개 · 페이지 {page} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl px-3 py-2 text-sm
                 text-white disabled:text-white  
                 bg-white/15 hover:bg-white/25
                 ring-1 ring-white/10
                 disabled:cursor-not-allowed disabled:bg-white/10"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            이전
          </button>
          <button
            className="rounded-xl px-3 py-2 text-sm
                 text-white disabled:text-white   
                 bg-white/15 hover:bg-white/25
                 ring-1 ring-white/10
                 disabled:cursor-not-allowed disabled:bg-white/10"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            다음
          </button>
        </div>
      </div>
    </main>
  );
}
