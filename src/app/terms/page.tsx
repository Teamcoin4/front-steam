"use client";

import Image from "next/image";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold">이용약관</h1>
      </header>

      <section className="space-y-6">
        <p>
          본 약관은 <strong>양오블 잠브(이하 “회사”)</strong>가 제공하는 온라인
          서비스(이하 “서비스”) 이용과 관련하여, 회사와 회원 간의 권리, 의무 및
          책임사항을 규정함을 목적으로 합니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">제1조 (목적)</h2>
        <p>
          서비스 이용과 관련된 회사와 회원의 관계를 명확히 하며, 공정한 운영
          기준을 제시합니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">제2조 (이용계약의 성립)</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>회원가입은 약관 동의 및 필수 정보 제출로 성립합니다.</li>
          <li>필요 시 회사는 가입 승인 전 추가 확인을 요청할 수 있습니다.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">제3조 (회원의 의무)</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            타인의 계정 도용, 불법 프로그램 사용, 서버 공격 행위를 하지
            않습니다.
          </li>
          <li>
            음란물, 타인 비방, 광고성 게시물 등 부적절한 콘텐츠를 게시하지
            않습니다.
          </li>
          <li>약관 및 운영정책을 준수합니다.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">제4조 (회사의 의무)</h2>
        <p>
          회사는 관련 법령을 준수하며 안정적 서비스 제공을 위해 최선을 다합니다.
          점검 또는 불가피한 사유가 있을 경우 사전 공지 후 일시 중단할 수
          있습니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">제5조 (게시물의 관리)</h2>
        <p>
          회원의 게시물 저작권은 회원에게 있으나, 회사는 서비스 운영 및 홍보
          목적 범위 내에서 이를 사용할 수 있습니다. 불법·부적절한 게시물은
          삭제될 수 있습니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">제6조 (책임의 한계)</h2>
        <p>
          천재지변, 통신 장애 등 불가항력 또는 회원 귀책으로 인한 손해에 대해
          회사는 책임지지 않습니다.
        </p>

        <h2 className="text-xl font-semibold mt-8">제7조 (분쟁 해결)</h2>
        <p>
          본 약관과 관련한 분쟁은 대한민국 법률을 따르며, 회사 본사 소재지 관할
          법원을 제1심 관할로 합니다.
        </p>
      </section>
    </main>
  );
}
