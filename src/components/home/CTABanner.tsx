"use client";

/**
 * CTA Banner — Final call-to-action section before the footer.
 */

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTenant } from "@/context/TenantContext";

export default function CTABanner() {
  const { t } = useLanguage();
  const { tenant } = useTenant();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/20 via-dark-900 to-lebanon-red/10" />
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-lebanon-green/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-lebanon-red/10 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10 text-center">
        {/* Cedar icon */}
        <div className="text-6xl mb-6">🌲</div>

        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          {t("Ready to Become a", "هل أنت مستعد لتصبح")}
          <br />
          <span className="gradient-text">{t("Champion?", "بطلاً؟")}</span>
        </h2>

        <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
          {t(
            "Join 1,200+ athletes training at Cedars Sport Academy. Book your free trial session today — no commitment required.",
            "انضم إلى أكثر من 1200 رياضي يتدربون في أكاديمية سيدرز الرياضية. احجز جلسة تجريبية مجانية اليوم — بدون أي التزام."
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-900/40 hover:-translate-y-1"
          >
            🎯 {t("Book Free Trial", "احجز تجربة مجانية")}
          </Link>
          <a
            href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1"
          >
            💬 {t("WhatsApp Us", "واتساب")}
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="text-lebanon-green">✓</span>
            {t("Free first session", "الجلسة الأولى مجانية")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lebanon-green">✓</span>
            {t("No long-term contract", "بدون عقد طويل الأمد")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lebanon-green">✓</span>
            {t("All ages & levels", "جميع الأعمار والمستويات")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lebanon-green">✓</span>
            {t("Certified coaches", "مدربون معتمدون")}
          </span>
        </div>
      </div>
    </section>
  );
}
