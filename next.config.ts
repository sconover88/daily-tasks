import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep this personal app out of search engines, on every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
