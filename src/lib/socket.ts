"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (socket) return socket;
  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000", {
    path: "/socket.io",
    transports: ["websocket"],
    withCredentials: true,
    auth: token ? { token } : {},
  });
  return socket;
}
