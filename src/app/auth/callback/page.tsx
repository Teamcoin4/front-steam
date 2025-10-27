'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 🔥 디버깅: 전체 URL 로깅
    console.log('🔍 현재 URL:', window.location.href);
    console.log('🔍 모든 파라미터:', Object.fromEntries(searchParams.entries()));
    
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('🔍 토큰:', token);
    console.log('🔍 에러:', error);

    if (error) {
      console.error('Steam 로그인 실패:', error);
      alert('로그인에 실패했습니다: ' + error);
      router.push('/login');
      return;
    }

    if (token) {
      console.log('✅ 토큰 발견! 저장 중...');
      localStorage.setItem('access_token', token);
      console.log('✅ 저장 완료! 확인:', localStorage.getItem('access_token'));
      
      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        console.log('🏠 홈으로 이동...');
        router.push('/');
      }, 100);
    } else {
      console.error('❌ 토큰을 받지 못했습니다.');
      console.error('❌ URL 파라미터:', Object.fromEntries(searchParams.entries()));
      alert('로그인 처리 중 문제가 발생했습니다.');
      router.push('/login');
    }
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