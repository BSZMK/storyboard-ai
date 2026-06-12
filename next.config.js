/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⚠️ 临时:构建时跳过 ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ 临时:构建时跳过类型检查
    ignoreBuildErrors: true,
  },
  images: {
    // 允许任意域名加载图片(AI 生成的图通常是阿里云 CDN)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
