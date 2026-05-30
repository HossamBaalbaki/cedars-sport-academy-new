"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";
import { useTenant } from "@/context/TenantContext";

function fireConfetti(e: React.MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  confetti({
    particleCount: 100,
    spread: 80,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    colors: ["#00A651", "#EE161F", "#FFFFFF", "#FFD700", "#4ADE80"],
    scalar: 1,
  });
}

export default function CTABanner() {
  const { t } = useLanguage();
  const { tenant } = useTenant();

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/20 via-dark-900 to-lebanon-red/10" />
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-lebanon-green/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-lebanon-red/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="container-custom relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl mb-6"
        >
          🌲
        </motion.div>

        <motion.h2
          className="text-3xl md:text-5xl font-black text-white mb-4"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {t("Ready to Become a", "هل أنت مستعد لتصبح")}
          <br />
          <span className="gradient-text">{t("Champion?", "بطلاً؟")}</span>
        </motion.h2>

        <motion.p
          className="text-white/60 text-lg max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {t(
            "Join 1,200+ athletes training at Cedars Sport Academy. Book your free trial session today — no commitment required.",
            "انضم إلى أكثر من 1200 رياضي يتدربون في أكاديمية سيدرز الرياضية. احجز جلسة تجريبية مجانية اليوم — بدون أي التزام."
          )}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              onClick={fireConfetti}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-colors duration-200 hover:shadow-2xl hover:shadow-green-900/40"
            >
              🎯 {t("Book Free Trial", "احجز تجربة مجانية")}
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-colors duration-200"
            >
              💬 {t("WhatsApp Us", "واتساب")}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {[
            t("Free first session", "الجلسة الأولى مجانية"),
            t("No long-term contract", "بدون عقد طويل الأمد"),
            t("All ages & levels", "جميع الأعمار والمستويات"),
            t("Certified coaches", "مدربون معتمدون"),
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-lebanon-green">✓</span> {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
