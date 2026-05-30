"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function RollingBall() {
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();

  // Zigzag left ↔ right across the full screen width as user scrolls
  const x = useTransform(scrollYProgress, (v) => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    return Math.sin(v * Math.PI * 8) * (w * 0.42);
  });

  // Spin proportional to distance traveled — looks like real rolling
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 1440]);

  // Subtle vertical bounce tied to the zigzag
  const y = useTransform(scrollYProgress, (v) =>
    Math.sin(v * Math.PI * 16) * 10
  );

  // Hide on dashboard pages
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <motion.div
      className="hidden sm:block"
      style={{
        x,
        y,
        rotate,
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        marginLeft: "-1rem",
        zIndex: 40,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontSize: "2.2rem",
          lineHeight: 1,
          display: "block",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))",
        }}
      >
        ⚽
      </span>
    </motion.div>
  );
}
