import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 아래 images 설정을 추가합니다.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.steamstatic.com', // 스팀 아바타 도메인을 허용 목록에 추가
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 기존의 다른 설정 옵션이 있다면 여기에 유지됩니다.
};

export default nextConfig;