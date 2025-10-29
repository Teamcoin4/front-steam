// ✅ src/hooks/achievements/useCommonGames.ts

import { useFetch } from "@/hooks/useFetch";
import type { CommonGame } from "@/types/achievementCompare.types";

// ✅ 필요 타입을 이 파일 내부에 직접 선언 (import 에러 제거)
export interface UseCommonGamesParams {
  friendSteamId: string;
  page?: number;
  limit?: number;
}

export function useCommonGames(params?: UseCommonGamesParams) {
  // ✅ URL을 조건부로 생성 (친구 아이디 없으면 요청 X)
  const url = params
    ? `/api/v1/friends/${params.friendSteamId}/common-games?page=${
        params.page ?? 1
      }&limit=${params.limit ?? 100}`
    : null;

  // ✅ fetch 결과
  const { data, loading, error } = useFetch<{ items: CommonGame[] }>(url);

  return {
    data: data?.items ?? [],
    loading,
    error,
  };
}
