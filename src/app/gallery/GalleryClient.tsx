"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicGalleryItem } from "@/lib/public-api";

type AlbumMap = Record<string, PublicGalleryItem[]>;

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  TRAINING: { label: "Training", emoji: "🏃" },
  MATCHES: { label: "Matches", emoji: "⚽" },
  EVENTS: { label: "Events", emoji: "🎉" },
  ACHIEVEMENTS: { label: "Achievements", emoji: "🏆" },
  GENERAL: { label: "General", emoji: "📸" },
};

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function isVideo(item: PublicGalleryItem) {
  return !!item.videoUrl;
}

function getThumbnail(item: PublicGalleryItem): string | null {
  if (item.imageUrl) return item.imageUrl;
  if (item.videoUrl) {
    try {
      const u = new URL(item.videoUrl);
      let videoId: string | null = null;
      if (u.hostname.includes("youtube.com")) {
        videoId = u.searchParams.get("v");
      } else if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.replace("/", "");
      }
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch {}
  }
  return null;
}

interface GalleryClientProps {
  items: PublicGalleryItem[];
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const albums = useMemo<AlbumMap>(() => {
    return items.reduce((acc: AlbumMap, item) => {
      const key = item.category || "GENERAL";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  const categoryItems = selectedCategory ? albums[selectedCategory] || [] : [];

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevItem = useCallback(() => {
    setActiveIndex((i) => (i - 1 + categoryItems.length) % categoryItems.length);
  }, [categoryItems.length]);
  const nextItem = useCallback(() => {
    setActiveIndex((i) => (i + 1) % categoryItems.length);
  }, [categoryItems.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevItem();
      if (e.key === "ArrowRight") nextItem();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, prevItem, nextItem]);

  const active = categoryItems[activeIndex];

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      <section className="py-16 text-center">
        <div className="container-custom">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">Our Moments</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            Gallery <span className="gradient-text">Albums</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Browse by category, then open photos and videos in a full lightbox viewer.
          </p>
        </div>
      </section>

      {!selectedCategory ? (
        <section className="section-padding pt-0">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(albums).map(([category, arr]) => {
                if (!arr.length) return null;
                const sorted = [...arr].sort((a, b) => (new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()));
                const cover = sorted.find((i) => getThumbnail(i)) || sorted[0];
                const coverThumb = getThumbnail(cover);
                const meta = CATEGORY_META[category] || { label: category, emoji: "📁" };
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="group text-left glass-card overflow-hidden rounded-2xl border border-white/10 hover:border-lebanon-green/40 transition-all"
                  >
                    <div className="relative aspect-[4/3]">
                      {coverThumb ? (
                        <Image
                          src={coverThumb}
                          alt={meta.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-800 flex items-center justify-center text-4xl">
                          {meta.emoji}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <div className="text-white font-bold text-lg">{meta.emoji} {meta.label}</div>
                          <div className="text-white/70 text-xs">{arr.length} item{arr.length !== 1 ? "s" : ""}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-dark-900/70 border border-white/10 text-white/70">
                          Open Album
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="section-padding pt-0">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-sm"
              >
                ← Back to Albums
              </button>
              <div className="text-white/60 text-sm">
                {CATEGORY_META[selectedCategory]?.emoji} {CATEGORY_META[selectedCategory]?.label || selectedCategory}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryItems.map((item, idx) => {
                const thumb = getThumbnail(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => openLightbox(idx)}
                    className="group relative rounded-xl overflow-hidden aspect-square border border-white/10 hover:border-lebanon-green/40"
                  >
                    {thumb ? (
                      <Image src={thumb} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-dark-800 flex items-center justify-center text-3xl">
                        🎬
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
                    {isVideo(item) && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs border border-white/20">
                        ▶ Video
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {lightboxOpen && active && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl">✕</button>
          <button onClick={prevItem} className="absolute left-4 md:left-8 text-white/80 hover:text-white text-3xl">‹</button>
          <button onClick={nextItem} className="absolute right-4 md:right-8 text-white/80 hover:text-white text-3xl">›</button>

          <div className="w-full max-w-5xl">
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
              {active.videoUrl ? (
                toYoutubeEmbed(active.videoUrl) ? (
                  <iframe
                    src={toYoutubeEmbed(active.videoUrl)!}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={active.title}
                  />
                ) : (
                  <video src={active.videoUrl} controls className="w-full h-full object-contain" />
                )
              ) : active.imageUrl ? (
                <Image src={active.imageUrl} alt={active.title} fill className="object-contain" />
              ) : (
                <div className="w-full h-full bg-dark-900 flex items-center justify-center text-white/40 text-lg">
                  No preview available
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <div className="text-white font-semibold">{active.title}</div>
              {active.description && <div className="text-white/60 text-sm mt-1">{active.description}</div>}
            </div>
          </div>
        </div>
      )}

      <section className="section-padding bg-dark-800/50 mt-10">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Want to Be in Our <span className="gradient-text">Gallery?</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">Join Cedars Sport Academy and become part of our story.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200">
            🎯 Join Now
          </Link>
        </div>
      </section>
    </div>
  );
}
