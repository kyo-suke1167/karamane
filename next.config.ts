import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // YouTubeのサムネイル画像をNext/Imageで読み込めるように許可リストへ追加
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;