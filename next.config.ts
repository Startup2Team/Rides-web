import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained server bundle for a small Docker runtime image.
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "192.168.*.*" },
      { protocol: "https", hostname: "**" },
    ],
  },

  // Two lockfiles (yarn.lock + package-lock.json) live here, which can make
  // Turbopack infer the wrong workspace root. Pin it for deterministic builds.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
