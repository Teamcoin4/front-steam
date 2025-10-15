export default function Background() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/bg-cyberpunk-hero.webp')",
      }}
    >
      {/* 어둡게 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
