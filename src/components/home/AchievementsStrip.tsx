"use client";

/**
 * Achievements Strip — Trophy showcase and key achievements on the home page.
 * Data is fetched server-side in page.tsx and passed as a prop.
 */

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import type { PublicAchievement } from "@/lib/public-api";

interface AchievementsStripProps {
  achievements: PublicAchievement[];
}

export default function AchievementsStrip({ achievements }: AchievementsStripProps) {
  const { t } = useLanguage();

  // Show only first 6 featured achievements on home page
  const featured = achievements.slice(0, 6);

  // Empty state — no achievements in DB yet
  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/5 via-transparent to-lebanon-red/5 pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
            {t("Our Trophy Cabinet", "خزانة كؤوسنا")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            {t("Championships &", "البطولات و")}
            <span className="text-yellow-400"> {t("Achievements", "الإنجازات")}</span>
          </h2>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((achievement) => (
            <div
              key={achievement.id}
              className="glass-card p-6 flex items-start gap-4 group hover:border-yellow-400/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-yellow-400/20 transition-colors">
                {achievement.icon ?? "🏆"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {achievement.year && (
                    <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">
                      {achievement.year}
                    </span>
                  )}
                  {achievement.category && (
                    <span className="text-white/30 text-xs">{achievement.category}</span>
                  )}
                </div>
                <h3 className="text-white font-bold text-sm mb-1 group-hover:text-yellow-400 transition-colors">
                  {t(achievement.title, achievement.titleAr ?? achievement.title)}
                </h3>
                {achievement.description && (
                  <p className="text-white/50 text-xs leading-relaxed">
                    {t(
                      achievement.description,
                      achievement.descriptionAr ?? achievement.description
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-2 border-2 border-yellow-400/40 hover:border-yellow-400 text-yellow-400 font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:bg-yellow-400/10"
          >
            {t("View All Achievements", "عرض جميع الإنجازات")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
