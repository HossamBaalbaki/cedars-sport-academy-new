"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// STADIUM PHOTO: Stade Rennais (Roazhon Park) — night match, atmospheric mist,
// hanging light rigs clearly visible in the upper frame.
// Photo by Howard Bouchevereau on Unsplash (free license)
// ─────────────────────────────────────────────────────────────────────────────
const STADIUM_IMAGE = "https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=1920&q=90";

// ─────────────────────────────────────────────────────────────────────────────
// LIGHT POSITIONS — mapped pixel-precisely to the real fixtures visible in the
// photograph. Each (top/left) is a % of the image frame.
//
//   1. Top-left large hanging rig   (biggest cluster, far left ceiling)
//   2. Top-center hanging rig       (central ceiling cluster)
//   3. Top-right rig                (right ceiling area)
//   4. Far-right corner fixture     (right stand upper)
//   5. Far-stand roofline row       (distant back stand — wide spread)
//   6. Left upper-stand fixture     (left side stand lights)
// ─────────────────────────────────────────────────────────────────────────────
const LIGHTS = [
  { top: "5%",  left: "10%", scrollStart: 0.04, size: 440, beamAngle: 5  },
  { top: "3%",  left: "45%", scrollStart: 0.15, size: 400, beamAngle: 0  },
  { top: "6%",  left: "72%", scrollStart: 0.26, size: 370, beamAngle: -4 },
  { top: "8%",  left: "89%", scrollStart: 0.37, size: 340, beamAngle: -8 },
  { top: "26%", left: "45%", scrollStart: 0.48, size: 520, beamAngle: 0  },
  { top: "18%", left: "3%",  scrollStart: 0.58, size: 300, beamAngle: 6  },
] as const;

// ── Sport cycling ─────────────────────────────────────────────────────────────
const CYCLING_SPORTS = [
  { en: "Football",   ar: "كرة القدم" },
  { en: "Basketball", ar: "كرة السلة" },
  { en: "Swimming",   ar: "السباحة"   },
  { en: "Gymnastics", ar: "الجمباز"   },
];

// ── Flip cards ───────────────────────────────────────────────────────────────
const SPORT_ICONS = [
  { icon: "⚽", label: "Football",   labelAr: "كرة القدم", desc: "Ages 4–18 · All levels"      },
  { icon: "🏀", label: "Basketball", labelAr: "كرة السلة", desc: "Indoor courts · Pro coaching" },
  { icon: "🏊", label: "Swimming",   labelAr: "السباحة",   desc: "Olympic pool · Every age"     },
  { icon: "🤸", label: "Gymnastics", labelAr: "الجمباز",   desc: "Flexibility · Balance · Power"},
];

// ── Hero stats ────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: 1200, suffix: "+", label: "Athletes",  labelAr: "رياضي"  },
  { value: 4,    suffix: "",  label: "Sports",    labelAr: "رياضات" },
  { value: 3,    suffix: "",  label: "Locations", labelAr: "مواقع"  },
  { value: 2018, suffix: "",  label: "Founded",   labelAr: "تأسست"  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const slideUp = {
  hidden: { opacity: 0, y: 44 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const raf = requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

function MiniStat({ stat, lang, isLast }: { stat: typeof HERO_STATS[0]; lang: string; isLast: boolean }) {
  const count = useCountUp(stat.value, stat.value > 100 ? 2000 : 1200);
  return (
    <div className={`flex flex-col items-center flex-1 px-2 sm:px-4 py-2 sm:py-3 ${!isLast ? "border-r border-white/10" : ""}`}>
      <span className="text-base sm:text-2xl font-black text-white tabular-nums">{count.toLocaleString()}{stat.suffix}</span>
      <span className="text-white/40 text-[9px] sm:text-xs font-medium mt-0.5">{lang === "ar" ? stat.labelAr : stat.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOODLIGHT COMPONENT
// Simulates a real HID stadium light warming up:
//   off → initial flash → flicker dim → instability → gradual rise → settled
// Adds: glow blob, bright core, downward beam, lens flare streak
// ─────────────────────────────────────────────────────────────────────────────
function FloodLight({
  scrollYProgress,
  light,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  light: typeof LIGHTS[number];
}) {
  const s = light.scrollStart;

  // HID warm-up flicker — multi-keypoint curve simulates real lamp behavior
  const rawOpacity = useTransform(
    scrollYProgress,
    [s,    s+.008, s+.018, s+.028, s+.040, s+.055, s+.072, s+.095],
    [0,    1.3,    0.20,   0.95,   0.40,   0.90,   1.15,   1.00 ],
  );
  const opacity = useSpring(rawOpacity, { stiffness: 160, damping: 14 });

  // Lens flare: brief horizontal streak, appears only at turn-on moment
  const flareOpacity = useTransform(
    scrollYProgress,
    [s, s+.006, s+.022],
    [0, 1.0,    0      ],
  );

  const beamStyle: React.CSSProperties = {
    position:  "absolute",
    top:       "50%",
    left:      "50%",
    width:     "3px",
    height:    "88vh",
    transform: `translateX(-50%) rotate(${light.beamAngle}deg)`,
    transformOrigin: "top center",
    background: "linear-gradient(to bottom, rgba(255,248,200,0.28) 0%, rgba(255,230,120,0.06) 45%, transparent 100%)",
    filter:     "blur(5px)",
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: light.top, left: light.left, translateX: "-50%", translateY: "-50%", opacity }}
    >
      {/* Outer warm glow */}
      <div style={{
        width:      light.size,
        height:     light.size,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,252,210,0.92) 0%, rgba(255,230,90,0.50) 18%, rgba(255,190,40,0.22) 42%, rgba(255,160,20,0.08) 62%, transparent 76%)",
        filter:     "blur(12px)",
      }} />
      {/* Tight bright core */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 24, height: 24,
        translate: "-50% -50%",
        borderRadius: "50%",
        background: "radial-gradient(circle, #ffffff 0%, rgba(255,255,220,0.95) 45%, transparent 100%)",
        filter: "blur(3px)",
        boxShadow: "0 0 18px 6px rgba(255,255,200,0.7)",
      }} />
      {/* Downward beam */}
      <div style={beamStyle} />
      {/* Lens flare — horizontal streak at turn-on moment */}
      <motion.div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width:  "100vw",
        height: "3px",
        translate: "-50% -50%",
        background: "linear-gradient(to right, transparent 0%, rgba(255,255,230,0.0) 20%, rgba(255,255,230,0.75) 50%, rgba(255,255,230,0.0) 80%, transparent 100%)",
        filter:  "blur(2px)",
        opacity: flareOpacity,
        pointerEvents: "none",
      }} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [sportIdx, setSportIdx] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${mouseX}px ${mouseY}px, rgba(0,166,81,0.18), rgba(0,166,81,0.05) 55%, transparent 72%)`;

  // ── Scroll driver: section is 200vh tall, pinned content tracks through it ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ── Stadium lighting driven by scroll ─────────────────────────────────────
  // Image starts near-black + desaturated, rises to vivid as lights come on
  const imgBrightness = useTransform(scrollYProgress, [0, 0.05, 0.66], [0.07, 0.07, 1.18]);
  const imgSaturation = useTransform(scrollYProgress, [0, 0.05, 0.66], [0.0,  0.0,  1.4 ]);
  const imgContrast   = useTransform(scrollYProgress, [0, 0.66],        [1.15, 0.95      ]);
  const imageFilter   = useMotionTemplate`brightness(${imgBrightness}) saturate(${imgSaturation}) contrast(${imgContrast})`;

  // Deep night overlay fades as stadium lights up
  const nightOverlay = useTransform(scrollYProgress, [0, 0.66], [0.92, 0.12]);

  // Atmospheric mist above pitch — a signature of real stadium photography
  // (already present in the photo, revealed as image brightens)
  const mistOpacity = useTransform(scrollYProgress, [0.12, 0.66], [0, 0.55]);

  // Green pitch glow rising from centre of frame (pitch is centre of this photo)
  const pitchGlow = useTransform(scrollYProgress, [0.15, 0.66], [0, 0.50]);

  // Full-screen flash when ALL lights are on (~scroll 0.65–0.70) — like stadium
  // going from warm-up to full match lighting
  const finalFlash = useTransform(scrollYProgress, [0.64, 0.67, 0.73], [0, 0.35, 0]);

  // Content stays visible during lighting phase, fades as hero exits
  const contentOpacity = useTransform(scrollYProgress, [0, 0.68, 0.88], [1, 1, 0]);
  const contentY       = useTransform(scrollYProgress, [0.68, 0.88], ["0%", "-10%"]);
  const dotOpacity     = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Cycle sport name
  useEffect(() => {
    const id = setInterval(() => setSportIdx(i => (i + 1) % CYCLING_SPORTS.length), 2400);
    return () => clearInterval(id);
  }, []);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  function fireConfetti(e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 90, spread: 70,
      origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
      colors: ["#00A651", "#EE161F", "#FFFFFF", "#FFD700", "#4ADE80"],
    });
  }

  return (
    // ── Tall outer section provides scroll room ───────────────────────────────
    <section ref={sectionRef} style={{ height: "200vh" }} className="relative">

      {/* ── Pinned visual — stays fixed while you scroll ── */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center" onMouseMove={onMouseMove}>

        {/* Cursor green spotlight */}
        <motion.div className="absolute inset-0 z-[5] pointer-events-none" style={{ background: spotlight }} />

        {/* ── Stadium photograph — filter animated by scroll ── */}
        <div className="absolute inset-0 z-0">
          <motion.div className="absolute inset-0" style={{ filter: imageFilter }}>
            <Image
              src={STADIUM_IMAGE}
              alt="Cedars Sport Academy — Stadium"
              fill sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </motion.div>

          {/* Deep night overlay */}
          <motion.div className="absolute inset-0 bg-dark-900" style={{ opacity: nightOverlay }} />

          {/* Atmospheric mist — the iconic haze above the pitch from real floodlights */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: "20%", left: "8%", right: "8%", height: "32%",
              opacity: mistOpacity,
              background: "radial-gradient(ellipse at 50% 40%, rgba(200,220,255,0.22) 0%, rgba(180,210,255,0.10) 45%, transparent 80%)",
              filter: "blur(28px)",
            }}
          />

          {/* Pitch green glow (pitch is centre of this image) */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: "38%", left: "5%", right: "5%", height: "40%",
              opacity: pitchGlow,
              background: "radial-gradient(ellipse at 50% 50%, rgba(0,166,81,0.28) 0%, rgba(0,166,81,0.08) 55%, transparent 80%)",
              filter: "blur(20px)",
            }}
          />

          {/* Lebanon flag side accents */}
          <motion.div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lebanon-red via-transparent to-lebanon-green"
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8, duration: 1.2 }} />
          <motion.div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lebanon-green via-transparent to-lebanon-red"
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8, duration: 1.2 }} />
        </div>

        {/* ── Floodlights — glows sit exactly on real fixtures in the photo ── */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {LIGHTS.map((light, i) => (
            <FloodLight key={i} scrollYProgress={scrollYProgress} light={light} />
          ))}
        </div>

        {/* ── Full-stadium power-on flash (all lights at once, brief) ── */}
        <motion.div
          className="absolute inset-0 z-[6] pointer-events-none bg-white"
          style={{ opacity: finalFlash }}
        />

        {/* ── Hero content ── */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center pt-20 sm:pt-28 pb-6 sm:pb-16 w-full"
        >
          <motion.div variants={container} initial="hidden" animate="show">

            {/* Badge */}
            <motion.div variants={slideUp} className="inline-flex items-center gap-2 bg-lebanon-green/10 border border-lebanon-green/30 rounded-full px-4 py-1.5 mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-lebanon-green animate-pulse" />
              <span className="text-lebanon-green text-sm font-medium">
                {t("Qatar's #1 Sports Academy", "أكاديمية قطر الرياضية الأولى")}
              </span>
            </motion.div>

            {/* Headline — cycling sport name */}
            <motion.h1 variants={slideUp} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 sm:mb-6">
              {t("Shape Your", "اصنع قصة")}
              <br />
              <AnimatePresence mode="wait">
                <motion.span
                  key={sportIdx}
                  initial={{ y: 36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -36, opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block bg-gradient-to-r from-lebanon-green via-cedar-400 to-lebanon-green bg-clip-text text-transparent"
                >
                  {language === "ar" ? CYCLING_SPORTS[sportIdx].ar : CYCLING_SPORTS[sportIdx].en}
                </motion.span>
              </AnimatePresence>
              <br />
              {t("Story Here", "هنا")}
            </motion.h1>

            {/* Sub */}
            <motion.p variants={slideUp} className="text-white/70 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed hidden sm:block">
              {t(
                "Professional coaching in 4 sports disciplines. 3 locations across Qatar. 1,200+ athletes trained.",
                "تدريب احترافي في 4 تخصصات رياضية. 3 مواقع في قطر. أكثر من 1200 رياضي مدرب."
              )}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={slideUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10 w-full sm:w-auto">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link href="/register" onClick={fireConfetti}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-colors duration-200 hover:shadow-2xl hover:shadow-green-900/40">
                  🎯 {t("Book Free Trial", "احجز تجربة مجانية")}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link href="/programs"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-200 hover:bg-white/5">
                  ⚡ {t("Explore Programs", "استكشف البرامج")}
                </Link>
              </motion.div>
            </motion.div>

            {/* Mini stats */}
            <motion.div variants={slideUp} className="flex w-full sm:w-auto bg-white/5 border border-white/10 rounded-2xl mb-6 sm:mb-10 overflow-hidden">
              {HERO_STATS.map((stat, i) => (
                <MiniStat key={stat.label} stat={stat} lang={language} isLast={i === HERO_STATS.length - 1} />
              ))}
            </motion.div>

            {/* Sport flip cards */}
            <motion.div variants={container} className="flex items-center justify-center gap-4 sm:gap-6 md:gap-10 flex-wrap">
              {SPORT_ICONS.map(sport => (
                <motion.div key={sport.label} variants={slideUp}>
                  <Link href={`/programs#${sport.label.toLowerCase().replace(" ", "-")}`}
                    className="flex flex-col items-center gap-1.5 group" style={{ perspective: 800 }}>
                    <motion.div
                      whileHover={{ rotateY: 180 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative w-14 h-14"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 group-hover:border-lebanon-green/40 flex items-center justify-center text-2xl"
                        style={{ backfaceVisibility: "hidden" }}>{sport.icon}</div>
                      <div className="absolute inset-0 rounded-2xl bg-lebanon-green/15 border border-lebanon-green/40 flex items-center justify-center px-1"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                        <span className="text-white text-[9px] font-semibold leading-tight text-center">{sport.desc}</span>
                      </div>
                    </motion.div>
                    <span className="text-white/50 group-hover:text-lebanon-green text-xs font-medium transition-colors">
                      {t(sport.label, sport.labelAr)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>
        </motion.div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
          style={{ opacity: dotOpacity }}
        >
          <span className="text-white/50 text-xs font-semibold tracking-[0.25em] uppercase">
            {t("Scroll to light up", "مرر لإضاءة الملعب")}
          </span>
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 rounded-full bg-lebanon-green"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

      </div>
      {/* end sticky */}
    </section>
  );
}
