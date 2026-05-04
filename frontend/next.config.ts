import type { NextConfig } from "next";

// Proxy /api/* and /up to the Rails backend so the browser can use relative
// paths regardless of where it runs (host browser, dev container, or
// Playwright inside the dev container).
const apiTarget = process.env.NEXT_INTERNAL_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: "/up",
        destination: `${apiTarget}/up`,
      },
    ];
  },
};

export default nextConfig;
