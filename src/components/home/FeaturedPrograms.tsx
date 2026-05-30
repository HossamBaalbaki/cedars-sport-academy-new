"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import TiltCard from "@/components/ui/TiltCard";
import type { PublicProgram } from "@/lib/public-api";

interface Props {
  programs: PublicProgram[];
}

const headerVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};

export default function FeaturedPrograms({ programs }: Props) {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
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
        </motion.div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length === 0 && (
            <div className="glass-card p-8 text-center text-white/50 col-span-full">
              Programs loading…
            </div>
          )}
          {programs.slice(0, 6).map((program, i) => {
            const enrolled   = program._count?.enrollments ?? 0;
            const maxStudents = program.maxStudents ?? 30;
            const fillPct    = maxStudents > 0 ? Math.min((enrolled / maxStudents) * 100, 100) : 0;

            return (
              <motion.div
                key={program.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
              >
                <TiltCard className="h-full">
                  <Link
                    href={`/programs#${program.slug || program.id}`}
                    className="group glass-card overflow-hidden h-full flex flex-col"
                  >
                    {/* Program Image */}
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <Image
                        src={program.image || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"}
                        alt={program.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent" />
                      {program.icon && (
                        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-xl border border-white/10">
                          {program.icon}
                        </div>
                      )}
                      {program.level && (
                        <div className="absolute top-4 right-4 bg-lebanon-green/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          {program.level}
                        </div>
                      )}
                    </div>

                    {/* Program Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-white font-bold text-xl mb-2 group-hover:text-lebanon-green transition-colors">
                        {t(program.name, program.nameAr ?? program.name)}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                        {program.description || "Professional training program at Cedars Sport Academy."}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                        {program.ageGroup?.name && (
                          <span className="flex items-center gap-1">
                            <span>👥</span> {program.ageGroup.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {program.price != null ? (
                            <>
                              <span className="text-lebanon-green font-bold text-lg">{program.price} QAR</span>
                              <span className="text-white/40 text-xs"> / {t("month", "شهر")}</span>
                            </>
                          ) : (
                            <span className="text-white/40 text-xs">{t("Contact for pricing", "تواصل للسعر")}</span>
                          )}
                        </div>
                        <span className="text-lebanon-green text-sm font-medium flex items-center gap-1">
                          {t("Learn More", "اعرف أكثر")} →
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/30 mb-1">
                          <span>{t("Enrollment", "التسجيل")}</span>
                          <span>{enrolled}/{maxStudents}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-lebanon-green to-cedar-400 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${fillPct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 + 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/programs" className="btn-outline inline-flex items-center gap-2">
            {t("View All Programs", "عرض جميع البرامج")} →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
