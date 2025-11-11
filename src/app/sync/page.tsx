'use client';
import { useState } from 'react';

export default function SyncPage() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setStatus('⏳ 동기화 중...');
    const token = localStorage.getItem('access_token');

    if (!token) {
      setStatus('❌ 로그인 상태를 확인할 수 없습니다.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/v1/steam/sync/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`서버 오류 (${res.status}): ${text}`);
      }

      const data = await res.json();
      setStatus(`✅ 동기화 완료 (${data.games ?? 0}개의 게임)`);
    } catch (err) {
      console.error(err);
      setStatus('❌ 동기화 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="p-8 text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Steam 동기화</h1>
      <p className="mb-6 text-gray-300">
        아래 버튼을 눌러 Steam 데이터(보유 게임, 업적, 친구, 요약)를 최신 상태로 갱신합니다.
      </p>
      <button
        onClick={handleSync}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition"
      >
        🚀 동기화 시작
      </button>
      {status && <p className="mt-4 text-gray-300">{status}</p>}
    </main>
  );
}
