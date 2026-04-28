/**
 * Achievements Page — All championships and achievements.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getAchievements } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Cedars Sport Academy's championship titles, awards, and milestones since 2018.",
};

const categories = ["All", "Football", "Basketball", "Swimming",  "Gymnastics", "Academy"];

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Header ── */}
      <section className="py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-lebanon-green/5 pointer-events-none" />
        <div className="container-custom relative z-10">
          <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
            Trophy Cabinet
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            Our <span className="text-yellow-400">Achievements</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Over a decade of excellence. 47+ championships, countless medals, and a legacy
            of champions representing Qatar.
          </p>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="py-8 bg-dark-800/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "11+", label: "Championships", icon: "🏆" },
              { value: "120+", label: "Medals Won", icon: "🥇" },
              { value: "8", label: "Years of Excellence", icon: "⭐" },
              { value: "4", label: "Sports Disciplines", icon: "🎯" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-yellow-400">{stat.value}</div>
                <div className="text-white/50 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="py-8">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  cat === "All"
                    ? "bg-yellow-400 text-dark-900"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Achievements Grid ── */}
      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.length === 0 && (
              <div className="glass-card p-8 text-center text-white/60 col-span-full">
                No achievements available right now. Please check back soon.
              </div>
            )}
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass-card p-6 flex items-start gap-4 group hover:border-yellow-400/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-yellow-400/20 transition-colors">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">
                      {achievement.year}
                    </span>
                    <span className="text-white/30 text-xs">{achievement.category}</span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1.5 group-hover:text-yellow-400 transition-colors">
                    {achievement.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Write Your Own <span className="text-yellow-400">Champion Story</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Join the academy that has produced Qatar&apos;s finest athletes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200"
          >
            🎯 Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
}
