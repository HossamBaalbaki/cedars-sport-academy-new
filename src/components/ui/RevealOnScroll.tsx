"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  className?: string;
}

export default function RevealOnScroll({
  children,
  delay = 0,
  direction = "up",
  className,
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: direction === "up" ? 48 : 0,
        x: direction === "left" ? -48 : direction === "right" ? 48 : 0,
      }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
