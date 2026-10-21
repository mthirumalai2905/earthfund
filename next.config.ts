import path from "node:path";
import type { NextConfig } from "next";

const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // This app lives inside another Next.js repo; pin the root so the parent lockfile is ignored.
  outputFileTracingRoot: root,
  turbopack: { root },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1200, 1600, 1920, 2560],
  },
};

export default nextConfig;
