"use client";

/**
 * Hero Section — Full-screen landing hero for Cedars Sport Academy.
 * Features: animated headline, CTA buttons, background video/image overlay,
 * Lebanon flag color accents, and scroll indicator.
 */

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
          alt="Cedars Sport Academy"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/60 to-dark-900/90" />
        {/* Lebanon flag color accent — left stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lebanon-red via-transparent to-lebanon-green opacity-60" />
        {/* Lebanon flag color accent — right stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lebanon-green via-transparent to-lebanon-red opacity-60" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center pt-32 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-lebanon-green/10 border border-lebanon-green/30 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-lebanon-green animate-pulse" />
          <span className="text-lebanon-green text-sm font-medium">
            {t("Qatar's #1 Sports Academy", "أكاديمية قطر الرياضية الأولى")}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
          {t("Shape Your", "اصنع")}
          <br />
          <span className="bg-gradient-to-r from-lebanon-green via-cedar-400 to-lebanon-green bg-clip-text text-transparent">
            {t("Champion", "بطلك")}
          </span>
          <br />
          {t("Story Here", "هنا")}
        </h1>

        {/* Subheadline */}
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
          {t(
            "Professional coaching in 4 sports disciplines. 3 locations across Qatar. 1,200+ athletes trained. Join the academy that builds champions.",
            "تدريب احترافي في 4 تخصصات رياضية. 3 مواقع في قطر. أكثر من 1200 رياضي مدرب. انضم إلى الأكاديمية التي تصنع الأبطال."
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-900/40 hover:-translate-y-1 active:scale-95"
          >
            <span>🎯</span>
            {t("Book Free Trial", "احجز تجربة مجانية")}
          </Link>
          <Link
            href="/programs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:-translate-y-1"
          >
            <span>⚡</span>
            {t("Explore Programs", "استكشف البرامج")}
          </Link>
        </div>

        {/* Quick Sport Icons */}
        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          {[
            { icon: "⚽", label: "Football",     labelAr: "كرة القدم" },
            { icon: "🏀", label: "Basketball",   labelAr: "كرة السلة" },
            { icon: "🏊", label: "Swimming",     labelAr: "السباحة" },
          
            { icon: "🤸", label: "Gymnastics",   labelAr: "الجمباز" },
          ].map((sport) => (
            <Link
              key={sport.label}
              href={`/programs#${sport.label.toLowerCase().replace(" ", "-")}`}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-lebanon-green/40 group-hover:bg-lebanon-green/10 flex items-center justify-center text-2xl transition-all duration-200 group-hover:-translate-y-1">
                {sport.icon}
              </div>
              <span className="text-white/50 group-hover:text-lebanon-green text-xs font-medium transition-colors">
                {t(sport.label, sport.labelAr)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/30 text-xs">{t("Scroll", "مرر")}</span>
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-lebanon-green animate-bounce" />
        </div>
      </div>
    </section>
  );
}
