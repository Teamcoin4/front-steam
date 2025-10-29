"use client";
import { create } from "zustand";

export type ChatFriend = {
  id: string;
  personaName: string;
  avatar?: string | null;
  online?: boolean;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  fromId: number;
  toId: number;
  body: string;
  ts: number;
};

type ChatState = {
  openChats: Record<string, ChatFriend>;
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
};

type ChatActions = {
  openChat: (roomId: string, friend: ChatFriend) => void;
  setActive: (roomId: string) => void;
  closeChat: (roomId: string) => void;
  pushMessage: (roomId: string, msg: ChatMessage) => void;
  clearRoom: (roomId: string) => void;
};

export const roomOf = (userId: number) => `user:${userId}`;

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  openChats: {},
  activeRoomId: null,
  messages: {},

  openChat: (roomId, friend) =>
    set((s) =>
      s.openChats[roomId]
        ? { activeRoomId: roomId } // ✅ 중복 클릭 시 활성화만
        : {
            openChats: { ...s.openChats, [roomId]: friend },
            activeRoomId: roomId,
          }
    ),

  setActive: (roomId) => set({ activeRoomId: roomId }),

  closeChat: (roomId) =>
    set((s) => {
      const nextOpen = { ...s.openChats };
      delete nextOpen[roomId];
      const nextActive = s.activeRoomId === roomId ? null : s.activeRoomId;
      return {
        openChats: nextOpen,
        activeRoomId: nextActive,
      };
    }),

  pushMessage: (roomId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: [...(s.messages[roomId] ?? []), msg],
      },
    })),

  clearRoom: (roomId) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: [] } })),
}));
