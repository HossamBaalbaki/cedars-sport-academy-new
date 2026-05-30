"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const reasons = [
  { icon: "🏅", title: "Certified Coaches",        titleAr: "مدربون معتمدون",         desc: "All coaches hold international certifications (UEFA, FIBA, FINA, FIG, ITF, WKF) with proven track records.", descAr: "جميع المدربين يحملون شهادات دولية مع سجلات حافلة بالإنجازات." },
  { icon: "🏟️", title: "World-Class Facilities",   titleAr: "مرافق عالمية المستوى",   desc: "Olympic-standard pool, FIFA-grade pitches, professional courts, and state-of-the-art equipment.",            descAr: "مسبح بمعايير أولمبية وملاعب بمعايير FIFA ومعدات متطورة." },
  { icon: "👶", title: "All Ages Welcome",          titleAr: "جميع الأعمار مرحب بهم", desc: "Programs designed for ages 4 to 40+. From first steps to competitive elite training.",                       descAr: "برامج مصممة للأعمار من 4 إلى 40+. من الخطوات الأولى إلى التدريب التنافسي النخبوي." },
  { icon: "📊", title: "Performance Tracking",      titleAr: "تتبع الأداء",             desc: "Regular assessments, video analysis, and personalized development plans for every athlete.",                  descAr: "تقييمات منتظمة وتحليل فيديو وخطط تطوير شخصية لكل رياضي." },
  { icon: "🏆", title: "Championship Proven",       titleAr: "مثبت بالبطولات",         desc: "11+ championships won. Our athletes compete and win at national and international levels.",                    descAr: "أكثر من 11 بطولة فازت بها. رياضيونا يتنافسون ويفوزون على المستويين الوطني والدولي." },
  { icon: "🌍", title: "Multi-Language Support",    titleAr: "دعم متعدد اللغات",       desc: "Fully bilingual academy — Arabic and English coaching, communication, and materials.",                        descAr: "أكاديمية ثنائية اللغة بالكامل — تدريب وتواصل ومواد باللغتين العربية والإنجليزية." },
  { icon: "📍", title: "3 Locations",               titleAr: "3 مواقع",                desc: "Conveniently located in Al Rayyan, Um Slal, and AL Markheya — serving all of Qatar.",                         descAr: "مواقع مريحة في الريان وام صلال والمرخية — تخدم قطر بأكمله." },
  { icon: "❤️", title: "Community First",           titleAr: "المجتمع أولاً",           desc: "Free programs for underprivileged youth. Sport as a tool for social development.",                            descAr: "برامج مجانية للشباب المحروم. الرياضة كأداة للتنمية الاجتماعية." },
];

export default function WhyUs() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-dark-800/50">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            {t("Why Cedars", "لماذا سيدرز")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-4">
            {t("Why Choose", "لماذا تختار")}
            <span className="gradient-text"> {t("Cedars Academy?", "أكاديمية سيدرز؟")}</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            {t(
              "We don't just train athletes — we build champions, leaders, and confident individuals.",
              "نحن لا ندرب الرياضيين فحسب — بل نبني أبطالاً وقادة وأفراداً واثقين."
            )}
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="glass-card p-6 group hover:border-lebanon-green/30 transition-colors duration-300 cursor-default"
            >
              <motion.div
                className="text-3xl mb-4"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {reason.icon}
              </motion.div>
              <h3 className="text-white font-bold text-base mb-2 group-hover:text-lebanon-green transition-colors">
                {t(reason.title, reason.titleAr)}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {t(reason.desc, reason.descAr)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
