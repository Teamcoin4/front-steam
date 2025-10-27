"use client";

import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import FriendCard from "./FriendCard";
import type { Friend } from "@/types/friend";
import { useChatStore, roomOf } from "@/store/useChatStore";
import type { ChatFriend } from "@/store/useChatStore";
import { resolveInternalUserId } from "@/lib/resolveUser";

interface FriendsListProps {
  accessToken: string | null;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getSteamId(f: Friend): string | null {
  if (!isObject(f)) return null;
  const val = (f as Record<string, unknown>).steamid;
  return typeof val === "string" && val.length > 0 ? val : null;
}

function getDisplayName(f: Friend): string {
  if (!isObject(f)) return "친구";
  const n1 = (f as Record<string, unknown>).personaname;
  const n2 = (f as Record<string, unknown>).personaName;
  if (typeof n1 === "string" && n1.trim()) return n1;
  if (typeof n2 === "string" && n2.trim()) return n2;
  return "친구";
}

function getAvatarUrl(f: Friend): string | null {
  if (!isObject(f)) return null;
  const a1 = (f as Record<string, unknown>).avatarfull;
  const a2 = (f as Record<string, unknown>).avatar;
  if (typeof a1 === "string" && a1) return a1;
  if (typeof a2 === "string" && a2) return a2;
  return null;
}

const toChatFriend = (fr: Friend, internalUserId: number): ChatFriend => ({
  id: String(internalUserId),
  personaName: getDisplayName(fr),
  avatar: getAvatarUrl(fr),
  online: true,
});

export default function FriendsList({ accessToken }: FriendsListProps) {
  const openChat = useChatStore((s) => s.openChat);

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

  const sections: Array<{ title: string; friends: Friend[]; color: string }> = [
    { title: "게임 중", friends: inGameFriends, color: "text-orange-400" },
    { title: "온라인", friends: onlineFriends, color: "text-green-400" },
    { title: "바쁨", friends: busyFriends, color: "text-yellow-400" },
    { title: "자리비움", friends: awayFriends, color: "text-yellow-300" },
    { title: "잠수 중", friends: snoozeFriends, color: "text-purple-400" },
    { title: "오프라인", friends: offlineFriends, color: "text-gray-400" },
  ];

  const renderSection = (
    title: string,
    friends: Friend[],
    titleColor: string
  ) => (
    <div className="mb-3" key={title}>
      <p className={`${titleColor} text-xs font-bold mb-1`}>{title}</p>
      {friends.map((friend, idx) => {
        const steamid = getSteamId(friend);
        const key = steamid ?? `friend-${title}-${idx}`;

        return (
          <button
            key={getSteamId(friend) ?? `f-${idx}`}
            type="button"
            onClick={async () => {
              const steamid = getSteamId(friend);
              if (!steamid) return;
              const userId = await resolveInternalUserId(steamid, accessToken);
              if (userId === null) {
                console.error("[FriendsList] 내부 userId resolve 실패");
                return;
              }
              openChat(roomOf(userId), toChatFriend(friend, userId));
            }}
            className="block w-full text-left"
          >
            <FriendCard friend={friend} />
          </button>
        );
      })}
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

          {sections.map(({ title, friends, color }) =>
            friends.length > 0 ? renderSection(title, friends, color) : null
          )}
        </div>
      )}
    </div>
  );
}
