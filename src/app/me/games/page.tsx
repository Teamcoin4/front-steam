'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUserGames, OwnedGame } from '@/hooks/useUserGames';

function fmtMinutes(min: number | null | undefined): string {
  if (!min) return '-';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function OwnedGamesPage() {
  const { games, total, isLoading, isError } = useUserGames();

  // ✅ 디버그용 로그 (필요 시 삭제)
  if (typeof window !== 'undefined') {
    console.log('[OwnedGamesPage] games:', games.length, 'total:', total);
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-400">
        불러오는 중…
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-red-400">
        ❌ 게임 목록을 불러오지 못했습니다.
      </div>
    );

  if (!games || games.length === 0)
    return (
      <div className="p-8 text-center text-gray-400">
        아직 동기화된 게임이 없습니다.
      </div>
    );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-white">보유 게임</h1>

      <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur-sm">
        {games.map((g: OwnedGame) => (
          <li
            key={g.appId}
            className="flex items-center gap-4 p-4 hover:bg-white/5 transition rounded-lg"
          >
            <Link
              href={`/me/games/${g.appId}`}
              className="relative h-16 w-28 flex-none overflow-hidden rounded-lg bg-gray-800"
            >
              <Image
                src={
                  g.headerImage ??
                  `https://cdn.akamai.steamstatic.com/steam/apps/${g.appId}/header.jpg`
                }
                alt={g.name || `App ${g.appId}`}
                fill
                className="object-cover"
                sizes="112px"
                unoptimized
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <Link
                  href={`/me/games/${g.appId}`}
                  className="truncate pr-2 text-base font-semibold text-slate-100 hover:text-indigo-400 transition"
                >
                  {g.name || '(제목 없음)'}
                </Link>
                <span className="text-sm text-slate-300/90">
                  appId: {g.appId}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
                <span>
                  총 플레이: <b>{fmtMinutes(g.playtimeForever)}</b>
                </span>
                <span>
                  최근 2주: <b>{fmtMinutes(g.playtime2Weeks)}</b>
                </span>
                <span>
                  최근 실행:{' '}
                  <b>
                    {g.lastPlayedAt
                      ? new Date(g.lastPlayedAt).toLocaleString()
                      : '-'}
                  </b>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-gray-400 text-center">
        총 <b>{total.toLocaleString()}</b>개
      </p>
    </main>
  );
}
