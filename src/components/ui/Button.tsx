/**
 * Reusable Button component.
 */

import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  external?: boolean;
}

const variantClasses = {
  primary:
    "bg-lebanon-green hover:bg-cedar-600 text-white shadow-lg hover:shadow-green-900/30",
  secondary:
    "bg-lebanon-red hover:bg-red-700 text-white shadow-lg hover:shadow-red-900/30",
  outline:
    "border-2 border-white/20 hover:border-white/40 text-white hover:bg-white/5",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-2xl",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  external = false,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
