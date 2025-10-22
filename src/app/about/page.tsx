"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 leading-relaxed text-white/90">
      <header className="mb-8 flex items-center gap-3">
        <Image
          src="/logo.png" // public/logo.png 사용
          alt="양오블 잠브"
          width={120}
          height={32}
          priority // 초기 LCP 개선
          className="h-8 w-auto"
        />
        <h1 className="text-3xl font-bold">서비스 소개</h1>
      </header>

      <section className="space-y-6">
        <p>
          <strong>양오블 잠브</strong>는 게이머를 위한 데이터 기반 플랫폼입니다.
          스팀 계정을 연동해 나의 게임 플레이 데이터를 시각화하고, 친구와 통계를
          비교하며, 커뮤니티에서 정보를 공유할 수 있습니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">주요 기능</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>스팀 계정 연동 · 게임 데이터 자동 수집</li>
          <li>게임별 플레이 타임/업적/최근 활동 시각화</li>
          <li>커뮤니티 리뷰/토론 · 즐겨찾기 게임 알림</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">이용 방법</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>회원가입 및 로그인</li>
          <li>Steam 계정 연동</li>
          <li>대시보드에서 나의 데이터 확인 및 비교</li>
          <li>커뮤니티에서 경험 공유</li>
        </ol>

        <h2 className="text-xl font-semibold mt-8">요금 정책</h2>
        <p>
          기본 기능은 무료이며, 고급 분석 기능은 추후 유료로 제공될 수 있습니다.
        </p>
      </section>
    </main>
  );
}
