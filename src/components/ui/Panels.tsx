"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MathText } from "./MathText";
import Naru, { type NaruPose, type NaruMood } from "../characters/Naru";
import Kaciro, { type KaciroPose, type KaciroMood } from "../characters/Kaciro";

/** Papan kayu bertali (judul bagian). */
export function WoodSign({ children, className = "", small }: { children: ReactNode; className?: string; small?: boolean }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="absolute -top-5 left-6 h-6 w-1 rounded bg-[#c9a96a]" aria-hidden />
      <span className="absolute -top-5 right-6 h-6 w-1 rounded bg-[#c9a96a]" aria-hidden />
      <div className={`wood rounded-xl font-display font-extrabold tracking-wider ${small ? "px-4 py-1.5 text-sm" : "px-5 py-2.5 text-lg sm:text-2xl"}`}>
        {children}
      </div>
    </div>
  );
}

/** Panel perkamen. */
export function Parchment({ children, className = "", as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <As className={`parchment rounded-3xl p-4 sm:p-6 ${className}`}>{children}</As>;
}

/** Gelembung dialog karakter. */
export function Speech({
  who,
  text,
  pose,
  mood,
  side = "left",
  size = 92,
  className = "",
  children,
}: {
  who: "naru" | "kaciro";
  text?: string;
  pose?: NaruPose | KaciroPose;
  mood?: NaruMood | KaciroMood;
  side?: "left" | "right";
  size?: number;
  className?: string;
  children?: ReactNode;
}) {
  const char =
    who === "naru" ? (
      <Naru pose={(pose as NaruPose) ?? "idle"} mood={mood as NaruMood} width={size} />
    ) : (
      <Kaciro pose={(pose as KaciroPose) ?? "idle"} mood={mood as KaciroMood} width={size} />
    );
  const name = who === "naru" ? "NARU" : "KACIRO";
  const tag = who === "naru" ? "bg-pink text-[#5a1f2b]" : "bg-forest text-white";
  return (
    <div className={`flex items-end gap-2 ${side === "right" ? "flex-row-reverse" : ""} ${className}`}>
      <div className="shrink-0">{char}</div>
      <div className="relative mb-6 min-w-0 flex-1 rounded-2xl border-2 border-[#d9c08f] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#2a2418] shadow-[0_4px_0_#d9c08f] sm:text-base">
        <span className={`absolute -top-3 ${side === "right" ? "right-4" : "left-4"} rounded-full px-2.5 py-0.5 font-display text-xs font-extrabold tracking-wider ${tag}`}>
          {name}
        </span>
        <span
          aria-hidden
          className={`absolute bottom-3 h-4 w-4 rotate-45 border-[#d9c08f] bg-white ${side === "right" ? "-right-2 border-t-2 border-r-2" : "-left-2 border-b-2 border-l-2"}`}
        />
        {text && <MathText text={text} />}
        {children}
      </div>
    </div>
  );
}

/** Modal sederhana yang aksesibel. */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  // portal ke <body> agar tidak terjebak di dalam elemen bertransformasi (transisi halaman)
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-jungle/70 p-3 backdrop-blur-sm sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`parchment animate-pop max-h-[88vh] w-full overflow-y-auto rounded-3xl p-5 ${wide ? "max-w-2xl" : "max-w-md"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold text-bark sm:text-2xl">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-earth/10 p-2 text-bark hover:bg-earth/20" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Bilah progres berbentuk sulur. */
export function VineProgress({ value, label, className = "" }: { value: number; label?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {label && <div className="mb-1 flex justify-between text-xs font-bold text-current"><span>{label}</span><span>{Math.round(v)}%</span></div>}
      <div className="relative h-4 overflow-hidden rounded-full border-2 border-jungle/40 bg-jungle/15" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-leaf to-lime transition-[width] duration-700"
          style={{ width: `${v}%`, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.25) 0 6px, transparent 6px 12px), linear-gradient(90deg,#62A66B,#B7D98A)" }}
        />
      </div>
    </div>
  );
}

export function Stat({ icon, label, value, className = "" }: { icon: ReactNode; label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-jungle text-sun">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-earth/80">{label}</div>
        <div className="truncate font-display text-lg font-extrabold leading-tight text-jungle">{value}</div>
      </div>
    </div>
  );
}
