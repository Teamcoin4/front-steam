"use client"; // ✅ 전역 상태 사용을 위한 클라이언트 컴포넌트

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Background from "@/components/background";
import LegalLinks from "@/components/LegalLinks";
import AuthButton from "@/components/authButton";
import FriendsList from "@/components/friends/FriendsList"; // ✅
import { useState } from "react";

// ✅ 폰트 설정
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: number;
    personaName?: string | null;
  } | null>(null);

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white`}
      >
        <Background />
        <div
          className="pointer-events-none fixed inset-0
                     bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,.35),transparent_60%)]
                     before:content-[''] before:absolute before:inset-0
                     before:bg-black/30"
        ></div>

        <header
          className="fixed top-0 left-0 w-full h-14 border-b border-white/10
                    bg-black/40 backdrop-blur-sm flex items-center px-5
                    justify-between z-50 text-white"
        >
          <nav className="flex gap-4 text-sm" aria-label="주요 메뉴">
            <Link href="/dashboard" className="text-white/90 hover:text-white">대시보드</Link>
            <Link href="/games" className="text-white/90 hover:text-white">게임</Link>
            <Link href="/achievements" className="text-white/90 hover:text-white">업적</Link>
            <Link href="/ranking" className="text-white/90 hover:text-white">랭킹</Link>
            <Link href="/about" className="text-white/90 hover:text-white">소개</Link>
          </nav>

          <div className="text-sm">
            <AuthButton
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              accessToken={accessToken}
              setAccessToken={setAccessToken}
              user={user}
              setUser={setUser}
            />
          </div>
        </header>

        {/* ✅ 로그인된 경우만 친구 목록 표시 */}
        {accessToken && <FriendsList accessToken={accessToken} />}

        <main className="pt-20 p-0">{children}</main>
        <LegalLinks />
      </body>
    </html>
  );
}
