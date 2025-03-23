import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack(config) {
    config.externals.push({ 'thread-stream': 'commonjs thread-stream', pino: 'commonjs pino' });
    return config;
  },
};

export default nextConfig;
