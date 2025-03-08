import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  output: 'standalone',
  reactStrictMode: true
};

export default nextConfig;
