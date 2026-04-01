import type { Metadata } from "next";
import { getGallery } from "@/lib/public-api";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse photos and videos from Cedars Sport Academy by album categories.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryItems = await getGallery();
  return <GalleryClient items={galleryItems} />;
}
