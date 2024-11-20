import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["scriptbox.s3.amazonaws.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
