'use client';
import { useEffect, useState } from 'react';
import { useUserGames } from '@/hooks/useUserGames';
import type { OwnedGame } from '@/hooks/useUserGames';
import { motion, AnimatePresence } from 'framer-motion';

/** 🎯 업적 DTO */
interface AchievementDto {
  id: number;
  name: string;
  description?: string;
  achieved: boolean;
  unlockedAt?: string | null; // ✅ ISO 문자열
  icon?: string;
}

/** 🎯 API 응답 타입 */
interface GameDetailResponse {
  achievements: AchievementDto[];
}

/** 🧮 분 → 시:분 포맷 변환기 */
function formatPlaytime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '0분';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
}

/** 🧮 퍼센트 포맷 (소수점 1자리) */
function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** 🗓️ 업적 달성일 포맷 */
function formatUnlockedAt(unlockedAt?: string | null): string {
  if (!unlockedAt) return '미달성';
  const date = new Date(unlockedAt);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GameDetailClient({ appId }: { appId: number }) {
  const { games } = useUserGames();
  const [data, setData] = useState<GameDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AchievementDto | null>(null);

  const game = games.find((g: OwnedGame) => g.appId === appId);
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

  /** 🎯 게임 상세 정보 Fetch */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/me/games/${appId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as GameDetailResponse;
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, appId]);

  if (loading)
    return <div className="p-6 text-gray-400 text-center">불러오는 중...</div>;
  if (error)
    return (
      <div className="p-6 text-red-400 text-center">
        ⚠️ 데이터를 불러오지 못했습니다: {error}
      </div>
    );

  const achievements = data?.achievements ?? [];
  const achievedCount = achievements.filter((a) => a.achieved).length;
  const totalCount = achievements.length;
  const rate = totalCount > 0 ? (achievedCount / totalCount) * 100 : 0;

  return (
    <div className="p-6 text-white flex flex-col gap-6">
      {/* 🎮 게임 헤더 */}
      <div
        className="relative h-64 rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url(${
            game?.headerImage ??
            `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-3xl font-bold">{game?.name ?? '알 수 없는 게임'}</h1>
          <p className="text-gray-300 mt-3">
            총 플레이타임:{' '}
            <span className="font-semibold text-white">
              {formatPlaytime(game?.playtimeForever)}
            </span>
          </p>
          {game?.playtime2Weeks ? (
            <p className="text-sm text-gray-400 mt-1">
              최근 2주 플레이: {formatPlaytime(game.playtime2Weeks)}
            </p>
          ) : null}
        </div>
      </div>

      {/* 🏆 업적 요약 */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          🏆 업적 통계
        </h2>

        <p className="text-gray-300 mb-3">
          전체 {totalCount}개 중{' '}
          <span className="font-semibold text-green-400">{achievedCount}</span>개
          달성 (
          <span className="text-green-400 font-semibold">
            {formatRate(rate)}
          </span>
          )
        </p>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4 transition-all duration-700"
            style={{ width: `${rate}%` }}
          />
        </div>

        {/* 업적 상세 목록 */}
        {achievements.length > 0 && (
          <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((a) => (
              <li
                key={a.id}
                onClick={() => setSelected(a)}
                className={`cursor-pointer p-3 rounded-lg border text-sm flex flex-col items-center justify-center hover:scale-[1.03] transition ${
                  a.achieved
                    ? 'bg-green-600/30 border-green-500 text-green-300'
                    : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <img
                  src={a.icon ?? '/images/placeholder-gray.png'}
                  alt={a.name}
                  className={`w-12 h-12 mb-2 rounded-md ${
                    a.achieved ? '' : 'opacity-50 grayscale'
                  }`}
                />
                <span className="text-center font-medium">{a.name}</span>
                <p className="text-xs text-gray-400 mt-1">
                  {a.achieved
                    ? `달성일: ${
                        a.unlockedAt
                          ? new Date(a.unlockedAt).toLocaleDateString('ko-KR')
                          : '알 수 없음'
                      }`
                    : '달성일: 미달성'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🎉 업적 상세 모달 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-2xl shadow-lg max-w-md w-full relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex flex-col items-center">
                <img
                  src={selected.icon ?? '/images/placeholder-gray.png'}
                  alt={selected.name}
                  className={`w-20 h-20 mb-3 rounded-md ${
                    selected.achieved ? '' : 'opacity-50 grayscale'
                  }`}
                />
                <h3 className="text-2xl font-bold mb-2">{selected.name}</h3>
                <p className="text-gray-300 text-sm mb-4 text-center whitespace-pre-line">
                  {selected.description || '설명이 없습니다.'}
                </p>
                <p
                  className={`font-semibold ${
                    selected.achieved ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  {selected.achieved
                    ? `달성일: ${formatUnlockedAt(selected.unlockedAt)}`
                    : '아직 달성하지 못했습니다.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
