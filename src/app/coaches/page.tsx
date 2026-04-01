/**
 * Coaches Page — All coaches at Cedars Sport Academy.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCoaches } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Our Coaches",
  description:
    "Meet the world-class certified coaches at Cedars Sport Academy. UEFA, FIBA, FINA, and internationally certified professionals.",
};

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
  const coaches = await getCoaches();

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Header ── */}
      <section className="py-16 text-center">
        <div className="container-custom">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            The Team
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            Our Expert <span className="gradient-text">Coaches</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Internationally certified coaches with decades of combined experience. They don&apos;t
            just train athletes — they build champions.
          </p>
        </div>
      </section>

      {/* ── Coaches Grid ── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coaches.length === 0 && (
              <div className="glass-card p-8 text-center text-white/60 col-span-full">
                No coaches available right now. Please check back soon.
              </div>
            )}
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="glass-card overflow-hidden group card-hover"
              >
                {/* Photo */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={coach.user?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"}
                    alt={`${coach.user?.firstName || ""} ${coach.user?.lastName || ""}`.trim() || "Coach"}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                  {coach.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      ⭐ Featured
                    </div>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-lebanon-green/90 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Coach
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-0.5 group-hover:text-lebanon-green transition-colors">
                    {`${coach.user?.firstName || ""} ${coach.user?.lastName || ""}`.trim() || "Coach"}
                  </h3>
                  <p className="text-lebanon-green text-sm font-medium mb-3">Certified Coach</p>
                  <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">
                    {coach.bio || "Professional coach committed to athlete development and performance."}
                  </p>

                  {/* Experience */}
                  <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
                    <span>⭐</span>
                    <span>{coach.experience ?? 0} years experience</span>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(coach.certifications || []).slice(0, 2).map((cert) => (
                      <span
                        key={cert}
                        className="bg-white/5 border border-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                    {(coach.certifications || []).length > 2 && (
                      <span className="text-white/30 text-xs self-center">
                        +{(coach.certifications || []).length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Social */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    {coach.instagram && (
                      <a
                        href={coach.instagram}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-lebanon-green/20 border border-white/10 flex items-center justify-center text-white/40 hover:text-lebanon-green transition-all text-xs"
                      >
                        IG
                      </a>
                    )}
                    {coach.twitter && (
                      <a
                        href={coach.twitter}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/10 flex items-center justify-center text-white/40 hover:text-sky-400 transition-all text-xs"
                      >
                        X
                      </a>
                    )}
                    {coach.linkedin && (
                      <a
                        href={coach.linkedin}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-600/20 border border-white/10 flex items-center justify-center text-white/40 hover:text-blue-400 transition-all text-xs"
                      >
                        in
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join Team CTA ── */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Are You a <span className="gradient-text">Certified Coach?</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            We&apos;re always looking for passionate, certified coaches to join our team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200"
          >
            📩 Apply to Join Our Team
          </Link>
        </div>
      </section>
    </div>
  );
}
