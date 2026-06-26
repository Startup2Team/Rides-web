import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the Docker
  // runtime image stays small and doesn't need the full node_modules tree.
  output: "standalone",

  // Pin the workspace root. Two lockfiles (yarn.lock + package-lock.json) live in
  // this folder, which made Turbopack infer the wrong root and panic with
  // "Next.js package not found". Pinning the root resolves it deterministically.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
