import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow any HTTPS hostname — images are stored on cloud (Cloudinary, S3, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
