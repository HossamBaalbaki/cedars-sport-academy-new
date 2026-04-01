/**
 * News & Blog Page — Latest news from Cedars Sport Academy.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getNews } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Latest news, events, and updates from Cedars Sport Academy — championships, new programs, and academy announcements.",
};

const categories = ["All", "Championship", "Academy News", "Events", "Programs", "Coaching"];

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const newsItems = await getNews();
  const featured = newsItems.find((n) => n.isFeatured);
  const rest = newsItems.filter((n) => !n.isFeatured);

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Header ── */}
      <section className="py-16 text-center">
        <div className="container-custom">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            Stay Updated
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            News & <span className="gradient-text">Updates</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Championships, new programs, events, and everything happening at Cedars Sport Academy.
          </p>
        </div>
      </section>

      {/* ── Featured Article ── */}
      {featured && (
        <section className="pb-12">
          <div className="container-custom">
            <Link href={`/news/${featured.slug}`} className="relative rounded-3xl overflow-hidden h-80 md:h-[480px] group cursor-pointer block">
              <Image
                src={featured.image || "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80"}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-lebanon-green text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                  <span className="bg-white/10 backdrop-blur-sm text-white/70 text-xs px-3 py-1 rounded-full">
                    {featured.category}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3 max-w-3xl">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-2xl mb-4">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-white/40 text-xs">
                  <span>By {featured.author || "Cedars Academy"}</span>
                  <span>•</span>
                  <span>{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString() : "Recently"}</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Category Filter ── */}
      <section className="pb-8">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  cat === "All"
                    ? "bg-lebanon-green text-white"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Articles Grid ── */}
      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.length === 0 && (
              <div className="glass-card p-8 text-center text-white/60 col-span-full">
                No news available right now. Please check back soon.
              </div>
            )}
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="glass-card overflow-hidden group card-hover cursor-pointer block"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                  <div className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur-sm text-white/70 text-xs px-2 py-0.5 rounded-full border border-white/10">
                    {article.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-base mb-2 group-hover:text-lebanon-green transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/30 pt-3 border-t border-white/10">
                    <span>{article.author || "Cedars Academy"}</span>
                    <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recently"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-10">
            <button className="border-2 border-white/10 hover:border-white/30 text-white/60 hover:text-white font-medium px-8 py-3 rounded-xl transition-all duration-200">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom">
          <div className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-2xl font-black text-white mb-3">
              Never Miss an <span className="gradient-text">Update</span>
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Subscribe to our newsletter and get the latest news, events, and offers
              delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors"
              />
              <button className="bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap">
                Subscribe →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
