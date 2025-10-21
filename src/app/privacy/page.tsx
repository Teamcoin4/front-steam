"use client";

import Image from "next/image";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 leading-relaxed text-white/90">
      <header className="mb-8 flex items-center gap-3">
        <Image
          src="/logo.png" // public/logo.png (또는 /logo.svg)
          alt="양오블 잠브"
          width={120}
          height={32}
          priority
          className="h-8 w-auto"
        />
        <h1 className="text-3xl font-bold">개인정보 처리방침</h1>
      </header>

      <section className="space-y-6">
        <p>
          양오블 잠브(이하 “회사”)는 이용자의 개인정보를 중요하게 생각하며,
          「개인정보 보호법」 등 관련 법령을 준수합니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">
          1. 수집하는 개인정보 항목
        </h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>회원가입: 이메일, 닉네임, 비밀번호(암호화 저장)</li>
          <li>외부 연동: 스팀 ID, 아바타 이미지, 플레이 데이터</li>
          <li>자동 수집: IP, 브라우저 정보, 이용 기록(쿠키 등)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">2. 이용 목적</h2>
        <p>
          회원 인증, 서비스 제공, 고객 응대, 서비스 품질 개선 및 통계 분석의
          범위 내에서 이용합니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">3. 보유 및 이용기간</h2>
        <p>
          회원 탈퇴 시 즉시 파기하며, 법령상 보관 의무가 있는 경우 해당 기간
          동안 안전하게 보관합니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">
          4. 제3자 제공 및 처리위탁
        </h2>
        <p>
          원칙적으로 제3자 제공을 하지 않으며, 클라우드 운영·백업·이메일 발송 등
          일부 업무는 위탁할 수 있습니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">5. 이용자 권리</h2>
        <p>
          이용자는 개인정보의 열람·정정·삭제를 요청할 수 있으며, 회사는 지체
          없이 처리합니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">6. 개인정보 보호 책임자</h2>
        <p>이름: 홍길동 / 이메일: privacy@yango-bl.com / 연락처: 02-123-4567</p>

        <h2 className="text-xl font-semibold mt-8">7. 고지의 의무</h2>
        <p>
          본 방침은 2025-10-21부터 적용됩니다. 변경 시 공지사항을 통해
          안내합니다.
        </p>
      </section>
    </main>
  );
}
