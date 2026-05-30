"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({ children, className = "", maxTilt = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), { stiffness: 300, damping: 30 });
  const scale   = useSpring(1, { stiffness: 300, damping: 25 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isTouch) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.02);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
  }

  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
