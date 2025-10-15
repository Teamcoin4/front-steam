"use client";

export default function Page() {
  return (
    <>
      <section className="relative text-white">
        {/* 콘텐츠 영역 */}
        <div className="relative">
          {/* 1) 히어로: 헤더(56px) 제외하고 한 화면 꽉 */}
          <div className="min-h-[calc(100dvh-56px)] flex flex-col items-center justify-center text-center px-6">
            <div className="w-full max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-[0_4px_24px_rgba(79,70,229,0.35)]">
                Game Insight Dashboard
              </h1>
              <p className="mt-4 text-gray-200">
                당신의 플레이 데이터를 한눈에 분석하고, 새로운 인사이트를
                발견해보세요.
              </p>

              <div className="mt-12 grid gap-5 sm:grid-cols-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xs text-blue-300 mb-2">
                    RECENTLY PLAYED
                  </h3>
                  <div className="h-16 w-full rounded-lg bg-[rgba(255,255,255,0.08)]" />
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xs text-blue-300 mb-2">TOTAL PLAYTIME</h3>
                  <p className="text-5xl font-semibold tracking-tight drop-shadow-[0_4px_24px_rgba(59,130,246,0.35)]">
                    + 400
                  </p>
                  <p className="text-sm text-gray-300">hours</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xs text-blue-300 mb-2">ACHIEVEMENTS</h3>
                  <p className="text-5xl font-semibold tracking-tight drop-shadow-[0_4px_24px_rgba(147,51,234,0.35)]">
                    150
                  </p>
                  <p className="text-sm text-gray-300">of 200</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xs text-blue-300 mb-2">
                    PLAYTIME BY GAME
                  </h3>
                  <div className="space-y-2">
                    {[70, 50, 30].map((v, i) => (
                      <div
                        key={i}
                        className="h-2 rounded bg-[rgba(255,255,255,0.08)]"
                      >
                        <div
                          className="h-2 rounded bg-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_20px_2px_rgba(99,102,241,0.45)]"
                          style={{ width: `${v}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
