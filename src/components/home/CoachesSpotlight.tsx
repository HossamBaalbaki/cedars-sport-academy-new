"use client";

/**
 * Coaches Spotlight — Featured coaches section on the home page.
 * Receives live API data as props from the server page.
 */

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { PublicCoach } from "@/lib/public-api";

interface Props {
  coaches: PublicCoach[];
}

export default function CoachesSpotlight({ coaches }: Props) {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-dark-800/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            {t("Meet The Team", "تعرف على الفريق")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-4">
            {t("Our Expert", "مدربونا")}
            <span className="gradient-text"> {t("Coaches", "الخبراء")}</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            {t(
              "World-class certified coaches dedicated to unlocking your full athletic potential.",
              "مدربون معتمدون عالمياً مكرسون لإطلاق إمكاناتك الرياضية الكاملة."
            )}
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coaches.length === 0 && (
            <div className="glass-card p-8 text-center text-white/50 col-span-full">
              Coaches loading…
            </div>
          )}
          {coaches.slice(0, 4).map((coach) => {
            const fullName = `${coach.user?.firstName ?? ""} ${coach.user?.lastName ?? ""}`.trim() || "Coach";
            const avatar = coach.user?.avatar || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80";

            return (
              <div
                key={coach.id}
                className="glass-card overflow-hidden group card-hover text-center"
              >
                {/* Coach Photo */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={avatar}
                    alt={fullName}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                  {/* Experience badge */}
                  {coach.experience && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-lebanon-green/90 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {coach.experience} yrs exp
                    </div>
                  )}
                </div>

                {/* Coach Info */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-0.5 group-hover:text-lebanon-green transition-colors">
                    {fullName}
                  </h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">
                    {coach.bio || t("Certified professional coach at Cedars Sport Academy.", "مدرب محترف معتمد في أكاديمية الأرز.")}
                  </p>

                  {/* Certifications */}
                  {coach.certifications && coach.certifications.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {coach.certifications.slice(0, 2).map((cert, i) => (
                        <span key={i} className="text-xs bg-lebanon-green/10 text-lebanon-green px-2 py-0.5 rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-2">
                    {coach.instagram && (
                      <a
                        href={coach.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-lebanon-green/20 border border-white/10 flex items-center justify-center text-white/40 hover:text-lebanon-green transition-all text-xs"
                      >
                        IG
                      </a>
                    )}
                    {coach.twitter && (
                      <a
                        href={coach.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/10 flex items-center justify-center text-white/40 hover:text-sky-400 transition-all text-xs"
                      >
                        X
                      </a>
                    )}
                    {coach.linkedin && (
                      <a
                        href={coach.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-600/20 border border-white/10 flex items-center justify-center text-white/40 hover:text-blue-400 transition-all text-xs"
                      >
                        in
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link href="/coaches" className="btn-outline inline-flex items-center gap-2">
            {t("Meet All Coaches", "تعرف على جميع المدربين")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
