import type { ImageLoaderProps } from "next/image";

// Passthrough loader — Cloudinary already optimises images (q_auto/f_auto).
// We append ?w= so Next.js knows width is handled (required by the loader
// contract), but CDNs that already encode size in the path will ignore it.
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}`;
}
