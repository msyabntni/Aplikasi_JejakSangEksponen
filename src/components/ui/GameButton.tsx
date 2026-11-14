"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { play } from "@/lib/sound";

type Variant = "orange" | "wood" | "leaf" | "cream" | "sky" | "ghost";

const STYLES: Record<Variant, string> = {
  orange: "bg-gradient-to-b from-[#ffb877] to-orange text-[#4a2410] border-[#c46a2b] shadow-[0_5px_0_#a3521c]",
  wood: "wood shadow-[0_5px_0_#3e2718]",
  leaf: "bg-gradient-to-b from-[#7cc283] to-forest text-white border-jungle shadow-[0_5px_0_#123323]",
  cream: "bg-parchment text-bark border-[#d9c08f] shadow-[0_5px_0_#c8ab72]",
  sky: "bg-gradient-to-b from-[#b5e9f4] to-sky text-jungle border-[#5fb5c9] shadow-[0_5px_0_#4795a8]",
  ghost: "bg-white/10 text-cream border-white/30 shadow-[0_4px_0_rgba(0,0,0,0.25)] backdrop-blur",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-base rounded-2xl",
  lg: "px-7 py-3.5 text-lg sm:text-xl rounded-2xl",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  icon?: ReactNode;
  href?: string;
  full?: boolean;
}

export function GameButton({ variant = "orange", size = "md", icon, href, full, className = "", children, onClick, ...rest }: Props) {
  const cls = `btn-game inline-flex min-h-11 items-center justify-center gap-2 border-2 font-display font-extrabold tracking-wide ${STYLES[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} onClick={() => play("tap")}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={(e) => {
        play("tap");
        onClick?.(e);
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
