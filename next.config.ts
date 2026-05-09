import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // public/library-raw 下 .md 静态资源需声明 charset，避免被误判 Latin1/GBK 而乱码
  async headers() {
    return [
      {
        source: "/library-raw/:path*",
        headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }]
      }
    ];
  }
};

initOpenNextCloudflareForDev();

export default nextConfig;
