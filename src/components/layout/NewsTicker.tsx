"use client";

/**
 * NewsTicker — Scrolling news/announcement bar at the top of every page.
 * Fetches live news from the API; falls back to static items if unavailable.
 */

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { tickerItems, type TickerItem } from "@/data/news";

// Color map for different ticker item types
const typeColors: Record<string, string> = {
  achievement: "text-yellow-400",
  announcement: "text-lebanon-green",
  news: "text-blue-400",
  event: "text-orange-400",
};

// Map API news category → ticker type
function categoryToType(category?: string): TickerItem["type"] {
  const c = (category ?? "").toLowerCase();
  if (c.includes("achiev") || c.includes("award") || c.includes("champion")) return "achievement";
  if (c.includes("event") || c.includes("camp") || c.includes("tryout")) return "event";
  if (c.includes("announc") || c.includes("update") || c.includes("facility")) return "announcement";
  return "news";
}

// Emoji prefix per type
const typeEmoji: Record<string, string> = {
  achievement: "🏆",
  announcement: "📢",
  event: "📅",
  news: "📰",
};

export default function NewsTicker() {
  const { language } = useLanguage();
  const [items, setItems] = useState<TickerItem[]>(tickerItems);

  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
    const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? "921a4273-78be-4b91-a99b-b013e9830456";

    fetch(`${BASE_URL}/news?limit=8`, {
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": TENANT_ID,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        const data: Array<{ id: string; title: string; category?: string; slug?: string }> =
          Array.isArray(json?.data) ? json.data : [];
        if (data.length === 0) return; // keep static fallback
        const mapped: TickerItem[] = data.map((n) => {
          const type = categoryToType(n.category);
          const emoji = typeEmoji[type] ?? "📰";
          return {
            id: n.id,
            text: `${emoji} ${n.title}`,
            textAr: `${emoji} ${n.title}`,
            type,
            link: n.slug ? `/news/${n.slug}` : "/news",
          };
        });
        setItems(mapped);
      })
      .catch(() => {
        // silently keep static fallback
      });
  }, []);

  // Duplicate items for seamless infinite scroll
  const doubled = [...items, ...items];

  return (
    <div className="bg-dark-800 border-b border-white/10 py-2 overflow-hidden relative z-50">
      {/* Gradient fade on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-800 to-transparent z-10 pointer-events-none" />
      {/* Gradient fade on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-800 to-transparent z-10 pointer-events-none" />

      {/* Scrolling content */}
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "ticker 40s linear infinite" }}
      >
        {doubled.map((item, index) => (
          <span
            key={`${item.id}-${index}`}
            className={`inline-flex items-center gap-2 mx-8 text-sm font-medium ${typeColors[item.type] || "text-white"}`}
          >
            {language === "ar" ? item.textAr : item.text}
            <span className="text-white/30 mx-4">|</span>
          </span>
        ))}
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
