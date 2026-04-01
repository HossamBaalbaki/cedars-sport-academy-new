"use client";

/**
 * Stats Section — Animated counter stats for Cedars Sport Academy.
 * Shows key numbers: athletes, championships, coaches, years, etc.
 */

import { useEffect, useRef, useState } from "react";
import { stats } from "@/data/achievements";
import { useLanguage } from "@/context/LanguageContext";

/** Animated counter hook */
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

interface StatCardProps {
  stat: (typeof stats)[0];
  animate: boolean;
}

function StatCard({ stat, animate }: StatCardProps) {
  const { t } = useLanguage();
  const count = useCountUp(stat.value, 2000, animate);

  return (
    <div className="glass-card p-6 md:p-8 text-center group hover:border-lebanon-green/30 transition-all duration-300 hover:-translate-y-1">
      <div className="text-4xl mb-3">{stat.icon}</div>
      <div className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>
        {animate ? count : 0}
        {stat.suffix}
      </div>
      <div className="text-white/60 text-sm font-medium">
        {t(stat.label, stat.labelAr)}
      </div>
    </div>
  );
}

export default function Stats() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  // Trigger animation when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-dark-800/50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            {t("By The Numbers", "بالأرقام")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            {t("Our Impact in", "تأثيرنا في")}
            <span className="gradient-text"> {t("Numbers", "الأرقام")}</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} animate={animate} />
          ))}
        </div>

        {/* Lebanon pride strip */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-lebanon-red/40" />
          <span className="text-white/40 text-sm px-4">
            🇱🇧 {t("Proudly Lebanese", "بفخر لبناني")}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-lebanon-green/40" />
        </div>
      </div>
    </section>
  );
}
