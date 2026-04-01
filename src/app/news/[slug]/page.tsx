/**
 * News Article Detail Page — /news/[slug]
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/public-api";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt || undefined,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) notFound();

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Hero Image ── */}
      {article.image && (
        <div className="relative w-full h-64 md:h-[480px] overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />
        </div>
      )}

      {/* ── Article Content ── */}
      <div className="container-custom max-w-3xl py-12">
        {/* Back link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
        >
          ← Back to News
        </Link>

        {/* Category + Date */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {article.category && (
            <span className="bg-lebanon-green/20 text-lebanon-green text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {article.category}
            </span>
          )}
          {formattedDate && (
            <span className="text-white/40 text-sm">{formattedDate}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Author */}
        {article.author && (
          <p className="text-white/50 text-sm mb-8 border-b border-white/10 pb-6">
            By <span className="text-white/70 font-medium">{article.author}</span>
          </p>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-white/70 text-lg leading-relaxed mb-8 font-medium italic border-l-4 border-lebanon-green pl-4">
            {article.excerpt}
          </p>
        )}

        {/* Full Content */}
        {article.content ? (
          <div className="prose prose-invert prose-lg max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-white/40">
            <p>Full article content is not available.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-lebanon-green hover:text-white text-sm font-medium transition-colors"
          >
            ← All Articles
          </Link>
          <span className="text-white/30 text-xs">
            Cedars Sport Academy
          </span>
        </div>
      </div>
    </div>
  );
}
