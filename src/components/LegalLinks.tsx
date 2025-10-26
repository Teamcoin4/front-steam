export default function LegalLinks() {
  return (
    <div className="py-10 text-xs text-white/85">
      <div className="mx-6 md:mx-8 mb-4 h-px bg-white/15" />
      <div className="ml-6 md:ml-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <a href="/terms" className="hover:underline">
          이용약관
        </a>
        <a href="/privacy" className="hover:underline">
          개인정보 처리방침
        </a>
      </div>
    </div>
  );
}
