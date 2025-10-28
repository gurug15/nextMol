import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => config,
  reactStrictMode: false,
};

export default nextConfig;
