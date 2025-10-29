"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useChatStore, roomOf } from "@/store/useChatStore";

interface WsMessage {
  id: number;
  senderId: number;
  recipientId: number;
  text: string;
  createdAt: string | number | Date;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isDateLike(v: unknown): v is string | number | Date {
  return typeof v === "string" || typeof v === "number" || v instanceof Date;
}
function isWsMessage(x: unknown): x is WsMessage {
  return (
    isRecord(x) &&
    typeof x.id === "number" &&
    typeof x.senderId === "number" &&
    typeof x.recipientId === "number" &&
    typeof (x as Record<string, unknown>).text === "string" &&
    isDateLike((x as Record<string, unknown>).createdAt)
  );
}
function isWsMessageArray(x: unknown): x is WsMessage[] {
  return Array.isArray(x) && x.every(isWsMessage);
}

export default function ChatSocketBridge({
  token,
  meId,
}: {
  token?: string;
  meId: number;
}) {
  const pushMessage = useChatStore((s) => s.pushMessage);

  useEffect(() => {
    const s = getSocket(token);
    const toEpoch = (v: string | number | Date): number =>
      typeof v === "number" ? v : new Date(v).getTime();

    const onReceive = (payload: unknown) => {
      if (!isWsMessage(payload)) return;
      const peerId =
        payload.senderId === meId ? payload.recipientId : payload.senderId;
      const rid = roomOf(peerId);
      pushMessage(rid, {
        id: String(payload.id),
        roomId: rid,
        fromId: payload.senderId,
        toId: payload.recipientId,
        body: payload.text,
        ts: toEpoch(payload.createdAt),
      });
    };

    const onHistoryResult = (list: unknown) => {
      if (!isWsMessageArray(list)) return;
      for (const m of list) {
        const peerId = m.senderId === meId ? m.recipientId : m.senderId;
        const rid = roomOf(peerId);
        pushMessage(rid, {
          id: String(m.id),
          roomId: rid,
          fromId: m.senderId,
          toId: m.recipientId,
          body: m.text,
          ts: toEpoch(m.createdAt),
        });
      }
    };

    s.on("message.receive", onReceive);
    s.on("message.sent", onReceive);
    s.on("message.history.result", onHistoryResult);

    return () => {
      s.off("message.receive", onReceive);
      s.off("message.sent", onReceive);
      s.off("message.history.result", onHistoryResult);
    };
  }, [meId, pushMessage, token]);

  return null;
}
