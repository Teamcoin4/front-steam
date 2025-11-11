'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleLogin = async () => {
      const params = Object.fromEntries(searchParams.entries());
      const error = params['error'];

      console.log('🔍 Steam 로그인 콜백 도착:', params);

      if (error) {
        alert('Steam 로그인 실패: ' + error);
        router.push('/login');
        return;
      }

      try {
        // ✅ 1. refresh_token 기반으로 access_token 쿠키 발급 요청
        console.log('🚀 /auth/steam/refresh 호출 중...');
        const res = await fetch('http://localhost:3000/api/v1/auth/steam/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`refresh 실패: ${res.status}`);
        }

        console.log('✅ access_token 쿠키 갱신 완료');
        // 2. 홈으로 이동
        router.push('/');
      } catch (err) {
        console.error('❌ 로그인 처리 중 오류:', err);
        alert('로그인 중 문제가 발생했습니다.');
        router.push('/login');
      }
    };

    handleLogin();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">Steam 로그인 처리 중...</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
