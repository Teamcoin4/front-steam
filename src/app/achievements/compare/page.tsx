"use client";

import { useEffect, useMemo, useState } from "react";

// 실제 프로젝트 타입
import type { Friend } from "@/types/friend";
import type {
  CommonGame,
  AchievementCompareData,
} from "@/types/achievementCompare.types";

// 실제 프로젝트 훅
import { useFriends } from "@/hooks/useFriends";
import { useCommonGames } from "@/hooks/achievements/useCommonGames";
import { useAchievementCompare } from "@/hooks/achievements/useAchievementCompare";

// 아이콘(최소)
import { Loader2, ChevronDown } from "lucide-react";

/** ----------------------------------------------------------------
 *  Page
 * ---------------------------------------------------------------- */
export default function AchievementComparePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<CommonGame | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    setAccessToken(token);
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col gap-4 p-4 xl:mr-[320px]">
      {/* 상단: 친구 선택 */}
      <FriendSelector
        accessToken={accessToken}
        selectedFriendId={selectedFriendId}
        onChangeFriend={(fid) => {
          setSelectedFriendId(fid);
          setSelectedGame(null); // 친구 바뀌면 게임 초기화
        }}
      />

      {/* 본문: 공통 게임 + 비교 영역 */}
      <MainCompareContent
        selectedFriendId={selectedFriendId}
        selectedGame={selectedGame}
        onSelectGame={setSelectedGame}
      />
    </div>
  );
}

/** ----------------------------------------------------------------
 *  FriendSelector (드롭다운)
 * ---------------------------------------------------------------- */
function FriendSelector({
  accessToken,
  selectedFriendId,
  onChangeFriend,
}: {
  accessToken: string | null;
  selectedFriendId: string | null;
  onChangeFriend: (id: string) => void;
}) {
  const {
    loading,
    error,
    inGameFriends,
    onlineFriends,
    busyFriends,
    awayFriends,
    snoozeFriends,
    offlineFriends,
  } = useFriends(accessToken);

  const allFriends: Friend[] = useMemo(() => {
    const groups = [
      inGameFriends,
      onlineFriends,
      busyFriends,
      awayFriends,
      snoozeFriends,
      offlineFriends,
    ];
    return groups.flat().filter(Boolean) as Friend[];
  }, [inGameFriends, onlineFriends, busyFriends, awayFriends, snoozeFriends, offlineFriends]);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">친구 선택</label>

      <div className="relative inline-flex items-center">
        <select
          value={selectedFriendId ?? ""}
          onChange={(e) => onChangeFriend(e.target.value)}
          disabled={loading || !accessToken}
          className="appearance-none pr-8 pl-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="" disabled>
            {!accessToken
              ? "로그인이 필요합니다"
              : loading
              ? "친구 불러오는 중..."
              : "친구를 선택하세요"}
          </option>
          {!loading &&
            accessToken &&
            allFriends.map((f) => (
              <option key={f.steamid} value={f.steamid}>
                {f.persona_name}
              </option>
            ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2 pointer-events-none text-gray-500" />
      </div>

      {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
      {error && <span className="text-xs text-red-500">친구 목록을 불러오지 못했습니다.</span>}
    </div>
  );
}

/** ----------------------------------------------------------------
 *  MainCompareContent (공통 게임 + 비교 패널)
 * ---------------------------------------------------------------- */
function MainCompareContent({
  selectedFriendId,
  selectedGame,
  onSelectGame,
}: {
  selectedFriendId: string | null;
  selectedGame: CommonGame | null;
  onSelectGame: (game: CommonGame) => void;
}) {
  // 🔹 훅은 무조건 호출되지만, friendSteamId가 없으면 훅 내부에서 안전히 빈값 반환됨
  const { data, loading, error } = useCommonGames(
    selectedFriendId
      ? { friendSteamId: selectedFriendId, page: 1, limit: 100 }
      : undefined
  );

  const commonGames: CommonGame[] = Array.isArray(data) ? data : [];

  // 🔹 친구 미선택 안내
  if (!selectedFriendId) {
    return (
      <div className="flex-1 grid place-items-center rounded-md border border-gray-200 dark:border-gray-700 p-8 text-sm text-gray-500">
        비교할 친구를 먼저 선택해주세요.
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* 왼쪽: 공통 게임 리스트 */}
      <div className="w-1/3 rounded-md border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-medium mb-2">공통 보유 게임</h2>

        {loading && (
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중...
          </div>
        )}
        {error && (
          <div className="text-sm text-red-500">공통 게임 로딩 실패</div>
        )}
        {!loading && !error && commonGames.length === 0 && (
          <div className="text-sm text-gray-500">공통 보유 게임이 없습니다.</div>
        )}

        <div className="mt-2 flex flex-col gap-3 max-h-[60vh] overflow-auto">
  {commonGames.map((g) => (
    <div
      key={g.app_id}
      onClick={() => onSelectGame(g)}
      className={`flex items-center gap-4 p-4 bg-[#1f2335] rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02] cursor-pointer ${
        selectedGame?.app_id === g.app_id
          ? "ring-2 ring-blue-500"
          : "hover:bg-[#262b41]"
      }`}
    >
      {/* 게임 이미지 */}
      <img
        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.app_id}/header.jpg`}
        alt={g.name}
        className="w-20 h-12 object-cover rounded-md"
      />

      {/* 게임 이름 */}
      <span className="text-white font-medium text-sm sm:text-base">
        {g.name}
      </span>
    </div>
  ))}
</div>
      </div>

      {/* 오른쪽: 업적 비교 */}
      <div className="w-2/3 rounded-md border border-gray-200 dark:border-gray-700 p-4">
        {!selectedGame ? (
          <div className="grid place-items-center h-full text-sm text-gray-500">
            공통 게임을 선택하면 업적 비교가 표시됩니다.
          </div>
        ) : (
          <AchievementComparePanel
            friendSteamId={selectedFriendId}
            game={selectedGame}
          />
        )}
      </div>
    </div>
  );
}

/** ----------------------------------------------------------------
 *  AchievementComparePanel (내 vs 친구)
 * ---------------------------------------------------------------- */
function AchievementComparePanel({
  friendSteamId,
  game,
}: {
  friendSteamId: string;
  game: CommonGame;
}) {
  const { data, loading, error } = useAchievementCompare({
    friendSteamId,
    gameId: game.app_id,
  });

  if (loading) {
    return (
      <div className="text-gray-500 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> 업적 불러오는 중...
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-sm text-red-500">업적 데이터를 불러오지 못했습니다.</div>;
  }

  const compare: AchievementCompareData = data;

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 요약 */}
      <div>
        <h3 className="text-lg font-semibold">{compare.game.name}</h3>
        <p className="text-sm text-gray-500">
          내 업적: {compare.summary.youUnlocked} / {compare.summary.total} &nbsp;|&nbsp; 친구 업적:{" "}
          {compare.summary.friendUnlocked} / {compare.summary.total}
        </p>
      </div>

      {/* 업적 테이블 */}
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left w-12">나</th>
              <th className="p-2 text-left w-12">친구</th>
              <th className="p-2 text-left">업적명</th>
              <th className="p-2 text-left">설명</th>
            </tr>
          </thead>
          <tbody>
            {compare.achievements.map((a) => (
              <tr key={a.api_name} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-2">
                  {a.you.unlocked ? (
                    <span className="text-green-500 font-bold">✅</span>
                  ) : (
                    <span className="text-gray-400">❌</span>
                  )}
                </td>
                <td className="p-2">
                  {a.friend.unlocked ? (
                    <span className="text-green-500 font-bold">✅</span>
                  ) : (
                    <span className="text-gray-400">❌</span>
                  )}
                </td>
                <td className="p-2 font-medium">{a.display_name}</td>
                <td className="p-2 text-gray-500">{a.description ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
