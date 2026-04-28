"use client";

/**
 * Featured Programs Section — Showcases sports programs with cards.
 * Receives live API data as props from the server page.
 */

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { PublicProgram } from "@/lib/public-api";

interface Props {
  programs: PublicProgram[];
}

export default function FeaturedPrograms({ programs }: Props) {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            {t("What We Offer", "ما نقدمه")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-4">
            {t("Our Sports", "برامجنا")}
            <span className="gradient-text"> {t("Programs", "الرياضية")}</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            {t(
              "Professional training programs for all ages and skill levels, led by certified coaches.",
              "برامج تدريبية احترافية لجميع الأعمار ومستويات المهارة، يقودها مدربون معتمدون."
            )}
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length === 0 && (
            <div className="glass-card p-8 text-center text-white/50 col-span-full">
              Programs loading…
            </div>
          )}
          {programs.slice(0, 6).map((program) => {
            const enrolled = program._count?.enrollments ?? 0;
            const maxStudents = program.maxStudents ?? 30;
            const fillPct = maxStudents > 0 ? Math.min((enrolled / maxStudents) * 100, 100) : 0;

            return (
              <Link
                key={program.id}
                href={`/programs#${program.slug || program.id}`}
                className="group glass-card overflow-hidden card-hover"
              >
                {/* Program Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={program.image || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"}
                    alt={program.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent" />
                  {/* Sport Icon */}
                  {program.icon && (
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-xl border border-white/10">
                      {program.icon}
                    </div>
                  )}
                  {/* Level Badge */}
                  {program.level && (
                    <div className="absolute top-4 right-4 bg-lebanon-green/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {program.level}
                    </div>
                  )}
                </div>

                {/* Program Info */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-lebanon-green transition-colors">
                    {t(program.name, program.nameAr ?? program.name)}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
                    {program.description || "Professional training program at Cedars Sport Academy."}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                    {program.ageGroup?.name && (
                      <span className="flex items-center gap-1">
                        <span>👥</span> {program.ageGroup.name}
                      </span>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      {program.price != null ? (
                        <>
                          <span className="text-lebanon-green font-bold text-lg">
                            {program.price} QAR
                          </span>
                          <span className="text-white/40 text-xs"> / {t("month", "شهر")}</span>
                        </>
                      ) : (
                        <span className="text-white/40 text-xs">{t("Contact for pricing", "تواصل للسعر")}</span>
                      )}
                    </div>
                    <span className="text-lebanon-green text-sm font-medium flex items-center gap-1 transition-all">
                      {t("Learn More", "اعرف أكثر")} →
                    </span>
                  </div>

                  {/* Enrollment bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/30 mb-1">
                      <span>{t("Enrollment", "التسجيل")}</span>
                      <span>{enrolled}/{maxStudents}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lebanon-green to-cedar-400 rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link href="/programs" className="btn-outline inline-flex items-center gap-2">
            {t("View All Programs", "عرض جميع البرامج")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
