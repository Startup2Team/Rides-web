import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained server bundle for a small Docker runtime image.
  output: "standalone",

  // Two lockfiles (yarn.lock + package-lock.json) live here, which can make
  // Turbopack infer the wrong workspace root. Pin it for deterministic builds.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
