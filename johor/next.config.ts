import type { NextConfig } from "next";

const contentApiUrl =
  process.env.CONTENT_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://johor-back.euphoria-motiva.com";
const contentApiHost = new URL(contentApiUrl).hostname;

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: contentApiHost,
        pathname: "/**",
        protocol: "https",
      },
      {
        hostname: contentApiHost,
        pathname: "/**",
        protocol: "http",
      },
      {
        hostname: "gohor.octoserv-comp.com",
        pathname: "/**",
        protocol: "https",
      },
      {
        hostname: "johor-back.euphoria-motiva.com",
        pathname: "/**",
        protocol: "https",
      },
      {
        hostname: "187.127.69.150",
        pathname: "/**",
        protocol: "http",
      },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
