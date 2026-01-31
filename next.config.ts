import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-9cc7b6749a6c4595a89b393d376b6418.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn-us.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
