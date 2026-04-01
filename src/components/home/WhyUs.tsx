"use client";

/**
 * Why Choose Us Section — Key differentiators of Cedars Sport Academy.
 */

import { useLanguage } from "@/context/LanguageContext";

const reasons = [
  {
    icon: "🏅",
    title: "Certified Coaches",
    titleAr: "مدربون معتمدون",
    desc: "All coaches hold international certifications (UEFA, FIBA, FINA, FIG, ITF, WKF) with proven track records.",
    descAr: "جميع المدربين يحملون شهادات دولية مع سجلات حافلة بالإنجازات.",
  },
  {
    icon: "🏟️",
    title: "World-Class Facilities",
    titleAr: "مرافق عالمية المستوى",
    desc: "Olympic-standard pool, FIFA-grade pitches, professional courts, and state-of-the-art equipment.",
    descAr: "مسبح بمعايير أولمبية وملاعب بمعايير FIFA ومعدات متطورة.",
  },
  {
    icon: "👶",
    title: "All Ages Welcome",
    titleAr: "جميع الأعمار مرحب بهم",
    desc: "Programs designed for ages 4 to 40+. From first steps to competitive elite training.",
    descAr: "برامج مصممة للأعمار من 4 إلى 40+. من الخطوات الأولى إلى التدريب التنافسي النخبوي.",
  },
  {
    icon: "📊",
    title: "Performance Tracking",
    titleAr: "تتبع الأداء",
    desc: "Regular assessments, video analysis, and personalized development plans for every athlete.",
    descAr: "تقييمات منتظمة وتحليل فيديو وخطط تطوير شخصية لكل رياضي.",
  },
  {
    icon: "🏆",
    title: "Championship Proven",
    titleAr: "مثبت بالبطولات",
    desc: "47+ championships won. Our athletes compete and win at national and international levels.",
    descAr: "أكثر من 47 بطولة فازت بها. رياضيونا يتنافسون ويفوزون على المستويين الوطني والدولي.",
  },
  {
    icon: "🌍",
    title: "Multi-Language Support",
    titleAr: "دعم متعدد اللغات",
    desc: "Fully bilingual academy — Arabic and English coaching, communication, and materials.",
    descAr: "أكاديمية ثنائية اللغة بالكامل — تدريب وتواصل ومواد باللغتين العربية والإنجليزية.",
  },
  {
    icon: "📍",
    title: "3 Locations",
    titleAr: "3 مواقع",
    desc: "Conveniently located in Jounieh, Beirut, and Zahle — serving all of Lebanon.",
    descAr: "مواقع مريحة في جونية وبيروت وزحلة — تخدم لبنان بأكمله.",
  },
  {
    icon: "❤️",
    title: "Community First",
    titleAr: "المجتمع أولاً",
    desc: "Free programs for underprivileged youth. Sport as a tool for social development.",
    descAr: "برامج مجانية للشباب المحروم. الرياضة كأداة للتنمية الاجتماعية.",
  },
];

export default function WhyUs() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-dark-800/50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
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
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="glass-card p-6 group hover:border-lebanon-green/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{reason.icon}</div>
              <h3 className="text-white font-bold text-base mb-2 group-hover:text-lebanon-green transition-colors">
                {t(reason.title, reason.titleAr)}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {t(reason.desc, reason.descAr)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
