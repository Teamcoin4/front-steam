import axios from "axios";
import { FriendsResponse } from "@/types/friend";

// 🔥 3001로 수정!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const friendsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 기반 인증도 지원
});

// JWT 토큰 자동 추가
friendsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 에러 핸들링 추가
friendsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
  }
);

// 친구 목록 조회
export async function getFriendsList(): Promise<FriendsResponse> {
  const response = await friendsApi.get<FriendsResponse>("/api/v1/friends", {
    params: { include: "stats" },
  });
  return response.data;
}
