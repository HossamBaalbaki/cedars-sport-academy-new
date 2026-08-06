'use client';

import type { ImageLoaderProps } from "next/image";

const UNSIZED_EXTS = /\.(heic|heif|gif|svg|webp|mov|mp4)$/i;

export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (src.includes("r2.dev") || src.includes("r2.cloudflarestorage.com")) {
    if (UNSIZED_EXTS.test(src)) return src;
    const base = src.replace(/\.[^.]+$/, "");
    const size = width <= 480 ? 400 : width <= 900 ? 800 : 1200;
    return `${base}_${size}.webp`;
  }
  if (src.includes("res.cloudinary.com")) {
    return src.replace("/upload/", `/upload/f_auto,q_80,w_${width}/`);
  }
  return src;
}
