'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Background from '@/components/background';
import LegalLinks from '@/components/LegalLinks';
import AuthButton from '@/components/authButton';
import FriendsList from '@/components/friends/FriendsList';
import { useEffect, useState } from 'react';
import ChatSocketBridge from '@/components/ChatSocketBridge';
import ChatDock from '@/components/ChatDock';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; personaName?: string | null } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

  /** ✅ 로그인 상태 초기화 */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1️⃣ localStorage 우선 확인
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          setAccessToken(storedToken);
          setIsLoggedIn(true);
        }

        // 2️⃣ /auth/steam/token 으로 refresh 토큰 기반 갱신 시도
        const res = await fetch(`${API}/auth/steam/token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn('⚠️ refresh_token으로 세션 복원 실패');
          if (!storedToken) {
            setIsLoggedIn(false);
            setAccessToken(null);
            setUser(null);
          }
          return;
        }

        const json = await res.json();
        if (json?.accessToken) {
          localStorage.setItem('access_token', json.accessToken);
          setAccessToken(json.accessToken);
          setIsLoggedIn(true);

          // 3️⃣ 사용자 프로필 요청
          const profileRes = await fetch(`${API}/me`, {
            credentials: 'include',
            headers: { Authorization: `Bearer ${json.accessToken}` },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            setUser({
              id: profile.id,
              personaName: profile.personaName,
            });
          }
        }
      } catch (err) {
        console.error('❌ 로그인 복원 중 오류:', err);
        setIsLoggedIn(false);
        setAccessToken(null);
        setUser(null);
      }
    };

    restoreSession();

    /** ✅ storage 이벤트로 로그인/로그아웃 감지 */
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'access_token') {
        const newToken = localStorage.getItem('access_token');
        if (newToken) {
          setAccessToken(newToken);
          setIsLoggedIn(true);
        } else {
          setAccessToken(null);
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [API]);

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white`}
      >
        <Background />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,.35),transparent_60%)] before:content-[''] before:absolute before:inset-0 before:bg-black/30"></div>

        {/* ✅ 헤더 */}
        <header className="fixed top-0 left-0 w-full h-14 border-b border-white/10 bg-black/40 backdrop-blur-sm flex items-center px-5 justify-between z-50 text-white">
          <nav className="flex gap-4 text-sm" aria-label="주요 메뉴">
            <Link href="/dashboard" className="text-white/90 hover:text-white">대시보드</Link>
            <Link href="/me/games" className="text-white/90 hover:text-white">게임</Link>
            <Link href="/achievements" className="text-white/90 hover:text-white">업적</Link>
            <Link href="/ranking" className="text-white/90 hover:text-white">랭킹</Link>
            <Link href="/about" className="text-white/90 hover:text-white">소개</Link>
            <Link href="/sync" className="text-white/90 hover:text-white">동기화</Link>
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

        {/* ✅ 로그인된 경우만 실시간 컴포넌트 활성 */}
        {isLoggedIn && accessToken && user?.id && (
          <>
            <ChatSocketBridge token={accessToken} meId={user.id} />
            <ChatDock token={accessToken} meId={user.id} />
            <FriendsList accessToken={accessToken} />
          </>
        )}

        <main className="pt-20 p-0">{children}</main>
        <LegalLinks />
      </body>
    </html>
  );
}
