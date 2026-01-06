import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-9cc7b6749a6c4595a89b393d376b6418.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
