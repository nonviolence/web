/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // 增加 Vercel 相关配置
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
}

// 为 Vercel 环境添加特殊配置
if (process.env.VERCEL) {
  Object.assign(nextConfig, {
    experimental: {
      ...nextConfig.experimental,
      serverActions: {
        ...nextConfig.experimental?.serverActions,
        timeout: 60000, // 设置为60秒
      },
    },
  });
}

module.exports = nextConfig 