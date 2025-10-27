// src/utils/friendStatus.ts
import type { Friend } from "@/types/friend";

export const ONLINE_STATES = [
  "online",
  "in_game",
  "busy",
  "away",
  "snooze",
  "looking_to_play",
  "looking_to_trade",
] as const;

export function isOnline(state: Friend["state"]): boolean {
  return state !== "offline";
}

export function isInGame(state: Friend["state"]): boolean {
  return state === "in_game";
}

export function statusLabel(friend: Friend): string {
  if (isInGame(friend.state)) {
    return friend.game_name ? `🎮 ${friend.game_name}` : "🎮 게임 중";
  }
  switch (friend.state) {
    case "online":
      return "🟢 온라인";
    case "busy":
      return "⛔ 바쁨";
    case "away":
      return "🕓 자리비움";
    case "snooze":
      return "💤 잠수";
    case "looking_to_play":
      return "🎲 같이 할 사람 구함";
    case "looking_to_trade":
      return "💱 거래 희망";
    default:
      return "⚫ 오프라인";
  }
}

export function formatLastSeen(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // 간단한 상대 시간 포맷 (필요시 dayjs 등으로 대체)
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
