"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { getSocket } from "@/lib/socket";

export default function ChatDock({
  meId,
  token,
}: {
  meId: number;
  token?: string;
}) {
  const {
    openChats,
    activeRoomId,
    setActive,
    closeChat,
    messages,
    pushMessage,
  } = useChatStore();

  const [input, setInput] = useState("");
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  // 방별 최초 히스토리 요청 여부
  const requestedHistoryRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    socketRef.current = getSocket(token);
  }, [token]);

  const tabs = useMemo(
    () =>
      Object.entries(openChats) as [
        string,
        { id: string; personaName: string },
      ][],
    [openChats]
  );
  const activeMsgs = activeRoomId ? (messages[activeRoomId] ?? []) : [];

  // 열린 방들에 대해 최초 1회 히스토리 요청
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    for (const [roomId, friend] of tabs) {
      if (requestedHistoryRef.current.has(roomId)) continue;
      requestedHistoryRef.current.add(roomId);
      s.emit("message.history", { withUserId: Number(friend.id), limit: 50 });
    }
  }, [tabs]);

  const send = () => {
    if (!activeRoomId || input.trim().length === 0) return;
    const s = socketRef.current;
    if (!s) return;

    // 룸 규칙: "user:<peerId>" 라고 주석에 있었는데,
    // 실제 네 스토어 roomId 규칙을 따른다고 가정. 만약 "room:<me-peer>"라면 여기 파싱만 바꿔.
    const peerId = Number(activeRoomId.split(":")[1]);

    // ✅ 서버 스펙 준수: { toUserId, text }
    const val = input.trim();
    s.emit("message.send", { toUserId: peerId, text: val });

    // 낙관적 반영(원치 않으면 제거)
    pushMessage(activeRoomId, {
      id: crypto.randomUUID(),
      roomId: activeRoomId,
      fromId: meId,
      toId: peerId,
      body: val,
      ts: Date.now(),
    });
    setInput("");
  };

  // 활성 탭 변경 시 추가 히스토리 페이지 요청(옵션)
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !activeRoomId) return;
    const peerId = Number(activeRoomId.split(":")[1]);
    s.emit("message.history", { withUserId: peerId, limit: 50 });
  }, [activeRoomId]);

  if (tabs.length === 0) return null;

  return (
    <section className="fixed left-0 top-16 bottom-0 w-[28rem] bg-black/30 backdrop-blur-md border-r border-white/10 flex flex-col z-40 text-white">
      {/* 탭바 */}
      <div className="h-10 flex items-center gap-1 px-2 border-b border-white/10 overflow-x-auto text-white">
        {tabs.map(([roomId, friend]) => (
          <button
            key={roomId}
            onClick={() => setActive(roomId)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
              activeRoomId === roomId
                ? "bg-white/20"
                : "bg-white/10 hover:bg-white/15"
            }`}
            title={friend.personaName}
          >
            {friend.personaName}
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeChat(roomId);
              }}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </span>
          </button>
        ))}
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeMsgs.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] px-3 py-2 rounded ${
              m.fromId === meId
                ? "ml-auto bg-white/10 text-white"
                : "mr-auto bg-white/10 text-white"
            }`}
            title={new Date(m.ts).toLocaleString()}
          >
            <div className="text-sm whitespace-pre-wrap break-words">
              {m.body}
            </div>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="h-14 border-t border-white/10 flex items-center gap-2 px-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-white/10 rounded px-3 py-2 outline-none text-white placeholder-white/60"
        />
        <button
          onClick={send}
          className="px-3 py-2 rounded bg-white/20 hover:bg-white/30 "
        >
          보내기
        </button>
      </div>
    </section>
  );
}
