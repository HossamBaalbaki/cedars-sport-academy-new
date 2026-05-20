import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All images are served from Cloudinary which handles its own optimization
    // (q_auto/f_auto). Disabling Next.js image processing avoids 400/500 errors
    // caused by double-processing pre-transformed Cloudinary URLs.
    unoptimized: true,
  },
};

export default nextConfig;
