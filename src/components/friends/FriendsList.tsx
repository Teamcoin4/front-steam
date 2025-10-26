"use client";

import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import FriendCard from "./FriendCard";
import type { Friend } from "@/types/friend";

interface FriendsListProps {
  accessToken: string | null;
}

export default function FriendsList({ accessToken }: FriendsListProps) {
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

  const [isOpen, setIsOpen] = useState(true);

  if (!accessToken) return null;

  // ✅ 상태별 정보를 배열로 정리 → 반복 제거
  const sections = [
    { title: "게임 중", friends: inGameFriends, color: "text-orange-400" },
    { title: "온라인", friends: onlineFriends, color: "text-green-400" },
    { title: "바쁨", friends: busyFriends, color: "text-yellow-400" },
    { title: "자리비움", friends: awayFriends, color: "text-yellow-300" },
    { title: "잠수 중", friends: snoozeFriends, color: "text-purple-400" },
    { title: "오프라인", friends: offlineFriends, color: "text-gray-400" },
  ];

  // ✅ 공통 섹션 렌더 함수
  const renderSection = (title: string, friends: Friend[], titleColor: string) => (
    <div className="mb-3">
      <p className={`${titleColor} text-xs font-bold mb-1`}>{title}</p>
      {friends.map((friend) => (
        <FriendCard key={friend.steamid} friend={friend} />
      ))}
    </div>
  );

  return (
    <div className="fixed right-4 top-20 w-64 bg-black/50 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50">
      <div
        className="flex justify-between items-center px-4 py-2 bg-white/10 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="font-bold text-sm">친구 목록</span>
        <span>{isOpen ? "▼" : "▲"}</span>
      </div>

      {isOpen && (
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && <p className="text-gray-400 text-sm">불러오는 중...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* ✅ 상태 배열 기반 반복 렌더링 */}
          {sections.map(
            ({ title, friends, color }) =>
              friends.length > 0 && renderSection(title, friends, color)
          )}
        </div>
      )}
    </div>
  );
}
