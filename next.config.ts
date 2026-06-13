import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "haveibeenpwned.com",
        pathname: "/Content/Images/PwnedLogos/**",
      },
    ],
  },
};

export default nextConfig;
