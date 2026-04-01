/**
 * Reusable Card component.
 */

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  hover = false,
  glass = true,
  padding = "md",
}: CardProps) {
  const base = glass ? "glass-card" : "bg-dark-800 border border-white/10 rounded-2xl";
  const hoverClass = hover ? "card-hover cursor-pointer" : "";

  return (
    <div className={`${base} ${hoverClass} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
