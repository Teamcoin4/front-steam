'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

/** 🎯 개별 게임 데이터 구조 */
export interface OwnedGame {
  appId: number;
  name: string;
  playtimeForever: number;
  playtime2Weeks: number;
  lastPlayedAt: string | null;
  headerImage?: string | null;
  icon?: string | null;
}

/** 백엔드 기본 응답 형태 */
interface BasicResponse {
  items?: unknown[];
  total?: number;
  page?: number;
  size?: number;
}

/** Envelope 응답 형태 */
interface EnvelopeResponse {
  data?: BasicResponse;
  error?: unknown;
}

/** ✅ 응답 정규화 함수 */
function normalizeResponse(json: unknown): {
  items: unknown[];
  total: number;
  page: number;
  size: number;
} {
  if (!json || typeof json !== 'object') {
    return { items: [], total: 0, page: 1, size: 0 };
  }

  const root = json as Record<string, unknown>;

  if (Array.isArray(root.items) && typeof root.total === 'number') {
    return {
      items: root.items,
      total: root.total,
      page: (root.page as number) ?? 1,
      size: (root.size as number) ?? root.items.length,
    };
  }

  const data = root.data as Record<string, unknown> | undefined;
  if (data && Array.isArray(data.items) && typeof data.total === 'number') {
    return {
      items: data.items,
      total: data.total,
      page: (data.page as number) ?? 1,
      size: (data.size as number) ?? data.items.length,
    };
  }

  return { items: [], total: 0, page: 1, size: 0 };
}

/** ✅ 안전한 아이템 변환기 */
function mapToOwnedGame(raw: unknown): OwnedGame | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const you = (r['you'] as Record<string, unknown> | undefined) ?? {};

  const appId = Number(r['appId'] ?? r['gameId']);
  if (!Number.isFinite(appId)) return null;

  const name = typeof r['name'] === 'string' ? r['name'] : '';
  const playtimeForever = Number(
    you['playtimeForever'] ?? r['playtimeForever'] ?? 0,
  );
  const playtime2Weeks = Number(
    you['playtime2Weeks'] ?? r['playtime2Weeks'] ?? 0,
  );

  const lastPlayedAtRaw = you['lastPlayedAt'] ?? r['lastPlayedAt'];
  const lastPlayedAt =
    typeof lastPlayedAtRaw === 'string'
      ? lastPlayedAtRaw
      : lastPlayedAtRaw instanceof Date
      ? lastPlayedAtRaw.toISOString()
      : null;

  const headerVal = r['headerImage'];
  const iconVal = r['icon'];

  const headerImage = typeof headerVal === 'string' ? headerVal : null;
  const icon = typeof iconVal === 'string' ? iconVal : null;

  return {
    appId,
    name,
    playtimeForever,
    playtime2Weeks,
    lastPlayedAt,
    headerImage,
    icon,
  };
}

/** ✅ 메인 훅 */
export function useUserGames() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

  /** 🧠 토큰 초기화: localStorage + refresh fallback */
  useEffect(() => {
    const initToken = async () => {
      // 1️⃣ 로컬스토리지에서 access_token 가져오기
      const token = localStorage.getItem('access_token');
      if (token) {
        setAccessToken(token);
        return;
      }

      // 2️⃣ 없으면 refresh_token으로 재발급 시도
      try {
        const res = await fetch(`${API}/auth/steam/token`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.accessToken) {
            localStorage.setItem('access_token', json.accessToken);
            setAccessToken(json.accessToken);
          }
        } else {
          console.warn('⚠️ refresh_token으로 토큰 재발급 실패:', res.status);
        }
      } catch (err) {
        console.error('❌ 토큰 초기화 중 오류:', err);
      }
    };

    initToken();
  }, [API]);

  // accessToken이 없으면 SWR 요청 생략
  const url = accessToken
    ? `${API}/me/games?force=true`
    : null;

  /** Fetcher 함수 */
  const fetcher = async (endpoint: string): Promise<EnvelopeResponse> => {
    // accessToken이 아직 준비 안됐을 때 대기
    if (!accessToken) {
      await new Promise((r) => setTimeout(r, 200));
    }

    const res = await fetch(endpoint, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      credentials: 'include',
      cache: 'no-store',
    });

    // ✅ 401 자동 복구 로직
    if (res.status === 401) {
      try {
        const refresh = await fetch(`${API}/auth/steam/token`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refresh.ok) {
          const json = await refresh.json();
          if (json?.accessToken) {
            localStorage.setItem('access_token', json.accessToken);
            setAccessToken(json.accessToken);
            console.log('🔄 새 access_token 발급됨, 재시도');
            return fetcher(endpoint); // 재시도
          }
        }
      } catch (e) {
        console.error('❌ 401 복구 실패:', e);
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    const json = (await res.json()) as EnvelopeResponse;
    console.log('[useUserGames] raw =', json);
    return json;
  };

  /** SWR 훅 */
  const { data, error, isLoading } = useSWR<EnvelopeResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  /** 응답 정규화 및 변환 */
  const norm = normalizeResponse(data);
  const games: OwnedGame[] = norm.items
    .map(mapToOwnedGame)
    .filter((g): g is OwnedGame => g !== null);

  const total = typeof norm.total === 'number' ? norm.total : games.length;

  if (typeof window !== 'undefined') {
    console.log('[useUserGames] total:', total, 'mapped:', games.length);
  }

  return {
    games,
    total,
    page: norm.page,
    size: norm.size,
    isLoading,
    isError: !!error,
    error,
  };
}
