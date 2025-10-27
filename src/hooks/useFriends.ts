"use client";

import { useEffect, useState, useCallback } from "react";
import { Friend } from "@/types/friend";

interface RawFriendResponse {
  steamid: string;
  persona_name: string;
  avatar?: string;
  state: string;
  in_game?: boolean;
  game_name?: string;
  last_logoff?: string | null;
}

interface FriendsApiResponse {
  items: RawFriendResponse[];
}

interface UseFriendsResult {
  loading: boolean;
  error: string | null;
  inGameFriends: Friend[];
  onlineFriends: Friend[];
  busyFriends: Friend[];
  awayFriends: Friend[];
  snoozeFriends: Friend[];
  offlineFriends: Friend[];
  refresh: () => void;
}

export function useFriends(accessToken: string | null): UseFriendsResult {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ fetchFriends를 useCallback으로 감싸서
   * dependency 문제 및 무한 반복 문제 방지
   */
  const fetchFriends = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/friends", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }

      const json: FriendsApiResponse = await response.json();

      const mappedFriends: Friend[] = json.items.map((friend) => ({
        steamid: friend.steamid,
        persona_name: friend.persona_name,
        avatar: friend.avatar ?? "/default-avatar.png",
        state: friend.state,
        in_game: friend.in_game ?? false,
        game_name: friend.game_name ?? null,
        last_logoff: friend.last_logoff ?? null,
      }));

      setFriends(mappedFriends);
    } catch {
      setError("친구 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * ✅ fetchFriends를 의존성으로 사용
   */
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // ✅ 상태별 그룹핑 (한 번의 순회로 최적화)
  const groups = {
    inGameFriends: [] as Friend[],
    onlineFriends: [] as Friend[],
    busyFriends: [] as Friend[],
    awayFriends: [] as Friend[],
    snoozeFriends: [] as Friend[],
    offlineFriends: [] as Friend[],
  };

  friends.forEach((friend) => {
    switch (friend.state) {
      case "in_game":
        groups.inGameFriends.push(friend);
        break;
      case "online":
        groups.onlineFriends.push(friend);
        break;
      case "busy":
        groups.busyFriends.push(friend);
        break;
      case "away":
        groups.awayFriends.push(friend);
        break;
      case "snooze":
        groups.snoozeFriends.push(friend);
        break;
      default:
        groups.offlineFriends.push(friend);
    }
  });

  return {
    loading,
    error,
    ...groups,
    refresh: fetchFriends, // ✅ 그대로 사용할 수 있음
  };
}
