import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "anmretrveiauuskmmaqj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  eslint: {
    // Don't fail build on ESLint warnings (only fail on TypeScript errors)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
