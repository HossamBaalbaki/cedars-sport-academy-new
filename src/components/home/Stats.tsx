"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { stats } from "@/data/achievements";
import { useLanguage } from "@/context/LanguageContext";

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ stat, animate, index }: { stat: typeof stats[0]; animate: boolean; index: number }) {
  const { t } = useLanguage();
  const count = useCountUp(stat.value, 2000, animate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -25, scale: 0.9 }}
      animate={animate ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      style={{ perspective: 600 }}
      className="glass-card p-6 md:p-8 text-center group hover:border-lebanon-green/30 transition-colors duration-300"
    >
      <motion.div
        className="text-4xl mb-3"
        animate={animate ? { rotateY: [0, 360] } : {}}
        transition={{ duration: 0.7, delay: index * 0.08 + 0.3, ease: "easeInOut" }}
      >
        {stat.icon}
      </motion.div>
      <div className={`text-3xl md:text-5xl font-black mb-2 tabular-nums ${stat.color}`}>
        {animate ? count : 0}{stat.suffix}
      </div>
      <div className="text-white/60 text-sm font-medium">
        {t(stat.label, stat.labelAr)}
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-dark-800/50">
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            {t("By The Numbers", "بالأرقام")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            {t("Our Impact in", "تأثيرنا في")}
            <span className="gradient-text"> {t("Numbers", "الأرقام")}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} animate={animate} index={i} />
          ))}
        </div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-lebanon-red/40" />
          <span className="text-white/40 text-sm px-4">
            🇱🇧 {t("Proudly Lebanese", "بفخر لبناني")}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-lebanon-green/40" />
        </motion.div>
      </div>
    </section>
  );
}
