"use client";

import Image from "next/image";
import { Friend } from "@/types/friend";
import {
  statusLabel,
  isOnline,
  formatLastSeen,
} from "@/utils/friendStatus";

interface FriendCardProps {
  friend: Friend;
  variant?: "full" | "compact"; // ✅ full(기본) or compact 모드
}

export default function FriendCard({ friend, variant = "full" }: FriendCardProps) {
  const label = statusLabel(friend);
  const lastSeen =
    variant === "full" && !isOnline(friend.state)
      ? formatLastSeen(friend.last_logoff)
      : null;

  // ✅ compact 모드는 리스트 느낌으로 더욱 간결하게
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 p-1 rounded-md hover:bg-white/10 transition-colors">
        {/* ✅ 더 작은 아바타 */}
        <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-700">
          <Image
            src={friend.avatar || "/default-avatar.png"}
            alt={friend.persona_name}
            width={24}
            height={24}
          />
        </div>

        <div className="flex flex-col leading-tight">
          {/* ✅ 더 작은 닉네임 */}
          <p className="text-white text-xs font-medium">
            {friend.persona_name}
          </p>

          {/* ✅ 상태 라벨: 작고 은은하게 */}
          <p className="text-[10px] opacity-80">
            {label}
          </p>
        </div>
      </div>
    );
  }

  // ✅ full 모드 (기존 카드형 UI 유지)
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
        <Image
          src={friend.avatar || "/default-avatar.png"}
          alt={friend.persona_name}
          width={40}
          height={40}
        />
      </div>

      <div className="flex flex-col leading-tight">
        <p className="text-white text-sm font-semibold">
          {friend.persona_name}
        </p>
        <p className="text-xs">{label}</p>
        {lastSeen && (
          <p className="text-[10px] text-gray-500">
            마지막 접속: {lastSeen}
          </p>
        )}
      </div>
    </div>
  );
}
