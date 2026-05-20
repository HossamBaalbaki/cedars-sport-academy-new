"use client";

import { useEffect, useState } from "react";

const API    = process.env.NEXT_PUBLIC_API_URL   || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface Sponsor {
  id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl: string;
}

export default function SponsorsStrip() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    fetch(`${API}/sponsors`, { headers: { "X-Tenant-ID": TENANT } })
      .then((r) => r.ok ? r.json() : null)
      .then((body) => {
        const list: Sponsor[] = body?.data ?? [];
        setSponsors(list);
      })
      .catch(() => {});
  }, []);

  if (sponsors.length === 0) return null;

  function ensureProtocol(url: string) {
    if (!url) return "#";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  // Duplicate the list so the loop is seamless
  const items = [...sponsors, ...sponsors];

  return (
    <section className="py-10 border-t border-white/5 bg-dark-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">Our Partners & Sponsors</p>
      </div>

      {/* Ticker track */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-dark-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-dark-900 to-transparent pointer-events-none" />

        <div className="flex sponsors-ticker">
          {items.map((sponsor, idx) => (
            <a
              key={`${sponsor.id}-${idx}`}
              href={ensureProtocol(sponsor.websiteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              title={sponsor.name}
              className="flex-shrink-0 mx-8 flex flex-col items-center gap-2"
            >
              {/* White pill background so any logo colour reads clearly */}
              <div className="h-20 px-8 rounded-xl bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="max-h-14 max-w-[160px] object-contain"
                  loading="lazy"
                />
              </div>
              {(sponsor.description || sponsor.name) && (
                <span className="text-white/50 text-xs font-medium text-center max-w-[160px] truncate">
                  {sponsor.description || sponsor.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .sponsors-ticker {
          animation: ticker-scroll 30s linear infinite;
          width: max-content;
        }
        .sponsors-ticker:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
