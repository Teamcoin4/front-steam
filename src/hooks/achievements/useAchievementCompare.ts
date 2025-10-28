// ✅ src/hooks/achievements/useAchievementCompare.ts

import { useFetch } from "@/hooks/useFetch";
import type {
  AchievementCompareData,
  ComparedAchievementDetail,
  AchievementCompareSummary, // { total, youUnlocked, friendUnlocked }
} from "@/types/achievementCompare.types";

interface UseAchievementCompareParams {
  friendSteamId: string;
  gameId: number;
  page?: number;
  size?: number;
  sort?: string;        // 서버 DTO에서 'short'로 전달됨
  filter?: string;      // 'you_missing' | 'friend_missing' | 'both_unlocked' | 'both_missing'
  includeGlobal?: boolean;
  lang?: string;        // 'korean' 등
}

/** -------- 서버 응답 전용 타입 (스네이크케이스) -------- */
interface AchievementCompareApiResponse {
  game: {
    app_id: number;
    name: string;
    icon: string;
  };
  summary: {
    you_unlocked: number;
    friend_unlocked: number;
    both_unlocked: number;
    only_you: number;
    only_friend: number;
    you_completion_rate: number;
    friend_completion_rate: number;
    total: number;
  };
  achievements: ComparedAchievementDetail[];
  // friend, paging, links, trace_id 등은 현재 UI에서 사용하지 않으므로 생략
}

export function useAchievementCompare(params?: UseAchievementCompareParams) {
  // ✅ URL을 조건적으로 생성 (params 없으면 fetch 안 함)
  const url = params
    ? `/api/v1/friends/${params.friendSteamId}/games/${params.gameId}/achievements/compare?` +
      new URLSearchParams({
        page: String(params.page ?? 1),
        size: String(params.size ?? 100),
        short: params.sort ?? "status",              // ⚠️ 서버는 'short' 키 사용
        ...(params.filter ? { filter: params.filter } : {}),
        ...(params.includeGlobal ? { includeGlobal: "true" } : {}),
        lang: params.lang ?? "korean",
      }).toString()
    : null;

  const { data, loading, error } = useFetch<AchievementCompareApiResponse>(url);

  // ✅ 서버 응답(summary: snake_case) → 프론트 타입(summary: camelCase)으로 변환
  const transformedData: AchievementCompareData | null = data
    ? {
        game: {
          app_id: data.game.app_id,
          name: data.game.name,
        },
        summary: {
          total: data.summary.total,
          youUnlocked: data.summary.you_unlocked,
          friendUnlocked: data.summary.friend_unlocked,
        } as AchievementCompareSummary,
        achievements: data.achievements,
      }
    : null;

  return { data: transformedData, loading, error };
}
