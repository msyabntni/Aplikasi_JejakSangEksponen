/** Elemen lingkungan hutan (SVG/CSS ringan) yang dipakai ulang di banyak halaman. */
import type { CSSProperties, ReactNode } from "react";

export function Monstera({ className = "", style, color = "#2f8a4f", flip }: { className?: string; style?: CSSProperties; color?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={{ ...style, transform: `${style?.transform ?? ""} ${flip ? "scaleX(-1)" : ""}` }} aria-hidden>
      <path
        d="M60 112 C20 104 4 70 10 42 C16 16 44 4 66 8 C96 14 116 40 112 70 C108 96 88 110 60 112 Z"
        fill={color}
      />
      <path d="M60 112 C58 80 56 50 64 10" stroke="#1d5c34" strokeWidth="3" fill="none" />
      <g fill="#173F2A" opacity="0.85">
        <path d="M14 46 Q34 50 56 58 Q34 40 18 32 Z" />
        <path d="M16 78 Q36 76 56 80 Q36 64 14 62 Z" />
        <path d="M108 50 Q88 52 66 58 Q86 38 102 32 Z" />
        <path d="M108 82 Q86 80 66 82 Q86 66 110 64 Z" />
        <ellipse cx="38" cy="58" rx="5" ry="3" />
        <ellipse cx="86" cy="62" rx="5" ry="3" />
      </g>
      <path d="M60 112 C58 80 56 50 64 10" stroke="#9fd39b" strokeWidth="1" opacity="0.5" fill="none" />
    </svg>
  );
}

export function Leaf({ className = "", style, color = "#62A66B" }: { className?: string; style?: CSSProperties; color?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} style={style} aria-hidden>
      <path d="M20 58 C2 44 0 18 20 2 C40 18 38 44 20 58 Z" fill={color} />
      <path d="M20 58 L20 6" stroke="#1d5c34" strokeWidth="1.6" opacity="0.6" />
    </svg>
  );
}

/** Tanaman rambat menjuntai dari atas. */
export function HangingVines({ className = "", count = 7, seed = 1 }: { className?: string; count?: number; seed?: number }) {
  const vines = Array.from({ length: count }, (_, i) => {
    const x = ((i + 0.5) / count) * 100 + (((i * 37 + seed * 13) % 9) - 4);
    const len = 50 + ((i * 53 + seed * 29) % 90);
    return { x, len, delay: (i % 4) * 0.7 };
  });
  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-0 ${className}`} aria-hidden>
      {vines.map((v, i) => (
        <div key={i} className="animate-sway absolute top-0" style={{ left: `${v.x}%`, transformOrigin: "top center", animationDelay: `${v.delay}s` }}>
          <svg width="40" height={v.len + 30} viewBox={`0 0 40 ${v.len + 30}`}>
            <path d={`M20 0 Q${i % 2 ? 28 : 12} ${v.len / 2} 20 ${v.len}`} stroke="#2f6d35" strokeWidth="4" fill="none" />
            {Array.from({ length: Math.floor(v.len / 24) }, (_, k) => (
              <path key={k} d={`M20 ${18 + k * 24} q${k % 2 ? 12 : -12} -4 ${k % 2 ? 16 : -16} 6 q${k % 2 ? -10 : 10} 4 ${k % 2 ? -16 : 16} -6`} fill={k % 2 ? "#62A66B" : "#4e9a5a"} />
            ))}
            <path d={`M20 ${v.len} q-9 6 0 22 q9 -16 0 -22`} fill="#7cc283" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export function Butterfly({ className = "", color = "#F39B57", style }: { className?: string; color?: string; style?: CSSProperties }) {
  return (
    <div className={`animate-float pointer-events-none absolute ${className}`} style={style} aria-hidden>
      <svg width="34" height="28" viewBox="0 0 34 28">
        <g className="animate-flutter" style={{ transformOrigin: "17px 14px" }}>
          <path d="M17 14 C8 0 0 4 3 12 C5 18 12 17 17 14 Z" fill={color} />
          <path d="M17 14 C26 0 34 4 31 12 C29 18 22 17 17 14 Z" fill={color} />
          <path d="M17 14 C10 20 6 26 11 26 C14 26 16 20 17 14 Z" fill={color} opacity="0.8" />
          <path d="M17 14 C24 20 28 26 23 26 C20 26 18 20 17 14 Z" fill={color} opacity="0.8" />
        </g>
        <rect x="16" y="8" width="2" height="13" rx="1" fill="#3B2416" />
      </svg>
    </div>
  );
}

export function Mushroom({ className = "", color = "#F39B57", glow }: { className?: string; color?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {glow && <circle cx="20" cy="18" r="18" fill={color} opacity="0.25" className="twinkle" />}
      <rect x="16" y="18" width="8" height="18" rx="3" fill="#f6e7c8" />
      <path d="M4 20 Q6 4 20 4 Q34 4 36 20 Z" fill={color} />
      <circle cx="13" cy="12" r="2.6" fill="#fff" opacity="0.85" />
      <circle cx="24" cy="9" r="2" fill="#fff" opacity="0.85" />
      <circle cx="28" cy="15" r="2.2" fill="#fff" opacity="0.85" />
    </svg>
  );
}

export function Gem({ className = "", color = "#5fd0c4", size = 22 }: { className?: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path d="M6 3 H18 L22 9 L12 22 L2 9 Z" fill={color} />
      <path d="M2 9 H22 M8 3 L12 9 L16 3 M12 9 V22" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" fill="none" />
      <path d="M7 5 L9 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TreasureChest({ open, className = "", width = 120 }: { open?: boolean; className?: string; width?: number }) {
  return (
    <svg viewBox="0 0 120 100" width={width} className={className} aria-hidden>
      {open && (
        <g>
          <ellipse cx="60" cy="46" rx="40" ry="16" fill="#F4D77A" opacity="0.6" className="twinkle" />
          <circle cx="44" cy="48" r="7" fill="#F4D77A" />
          <circle cx="60" cy="44" r="8" fill="#ffe08a" />
          <circle cx="76" cy="48" r="7" fill="#F4D77A" />
          <path d="M54 36 L60 26 L66 36 L60 42Z" fill="#5fd0c4" />
        </g>
      )}
      <rect x="14" y="50" width="92" height="44" rx="6" fill="#8a5a3c" stroke="#5a3a28" strokeWidth="3" />
      <rect x="14" y="62" width="92" height="6" fill="#5a3a28" opacity="0.5" />
      <g style={{ transformOrigin: "60px 50px", transform: open ? "rotateX(0) translateY(-22px) rotate(-12deg)" : "none", transition: "transform .6s cubic-bezier(.2,1.4,.4,1)" }}>
        <path d="M14 52 Q14 22 60 22 Q106 22 106 52 Z" fill="#a06c48" stroke="#5a3a28" strokeWidth="3" />
        <path d="M30 26 L30 52 M90 26 L90 52" stroke="#e0b43c" strokeWidth="6" />
      </g>
      <path d="M30 50 V94 M90 50 V94" stroke="#e0b43c" strokeWidth="6" />
      <rect x="51" y="54" width="18" height="18" rx="3" fill="#e0b43c" stroke="#a57b1f" strokeWidth="2" />
      <circle cx="60" cy="62" r="3" fill="#5a3a28" />
    </svg>
  );
}

export function Footprints({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <g fill="#754B35" opacity="0.5">
        <ellipse cx="10" cy="20" rx="4" ry="6" />
        <circle cx="8" cy="12" r="1.4" /><circle cx="11" cy="11.5" r="1.4" /><circle cx="13.5" cy="13" r="1.3" />
        <ellipse cx="40" cy="12" rx="4" ry="6" />
        <circle cx="38" cy="4" r="1.4" /><circle cx="41" cy="3.5" r="1.4" /><circle cx="43.5" cy="5" r="1.3" />
      </g>
    </svg>
  );
}

export function Compass({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#F4D77A" stroke="#754B35" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="10" fill="#fbf3dc" />
      <g className="animate-sway" style={{ transformOrigin: "16px 16px" }}>
        <path d="M16 6 L19 16 L16 18 L13 16 Z" fill="#d9534f" />
        <path d="M16 26 L19 16 L16 14 L13 16 Z" fill="#246B45" />
      </g>
      <circle cx="16" cy="16" r="1.8" fill="#754B35" />
    </svg>
  );
}

/** Partikel cahaya melayang. */
export function Fireflies({ count = 10, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="drift absolute h-1.5 w-1.5 rounded-full bg-sun shadow-[0_0_8px_3px_rgba(244,215,122,0.7)]"
          style={{ left: `${(i * 37) % 100}%`, top: `${40 + ((i * 23) % 55)}%`, animationDelay: `${(i * 0.7) % 6}s`, animationDuration: `${5 + (i % 4)}s` }}
        />
      ))}
    </div>
  );
}

export function SunRays({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {[12, 34, 58, 80].map((l, i) => (
        <div
          key={l}
          className="sunray absolute -top-10 h-[130%] w-16 bg-gradient-to-b from-[#fff6c8]/60 to-transparent sm:w-24"
          style={{ left: `${l}%`, animationDelay: `${i * 1.6}s` }}
        />
      ))}
    </div>
  );
}

export function Waterfall({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className}`} aria-hidden>
      <div className="relative h-full w-full overflow-hidden rounded-t-[40%] rounded-b-md">
        <div className="water-fall absolute inset-0 bg-sky/80" />
      </div>
      <div className="absolute -bottom-3 left-1/2 h-6 w-[160%] -translate-x-1/2 rounded-full bg-white/60 blur-sm" />
    </div>
  );
}

/** Siluet pohon besar untuk layer latar. */
export function TreeSilhouette({ className = "", color = "#1f5536" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 300" className={className} preserveAspectRatio="xMidYMax meet" aria-hidden>
      <path d="M88 300 L92 170 Q70 160 60 140 L94 150 L96 110 L104 110 L106 150 L140 136 Q130 160 108 170 L112 300 Z" fill={color} />
      <circle cx="100" cy="90" r="62" fill={color} />
      <circle cx="52" cy="120" r="40" fill={color} />
      <circle cx="150" cy="118" r="44" fill={color} />
      <circle cx="100" cy="40" r="40" fill={color} />
    </svg>
  );
}

/** Latar hutan berlapis (background, midground, foreground). */
export function JungleBackdrop({
  children,
  className = "",
  sky = ["#bfe6c9", "#e9f0d8"],
  rays = true,
  fireflies = 8,
  vines = true,
  tone = "day",
}: {
  children?: ReactNode;
  className?: string;
  sky?: [string, string];
  rays?: boolean;
  fireflies?: number;
  vines?: boolean;
  tone?: "day" | "dusk" | "night";
}) {
  const far = tone === "night" ? "#203d4a" : tone === "dusk" ? "#4d7a52" : "#7fb685";
  const mid = tone === "night" ? "#183028" : tone === "dusk" ? "#2e5c3c" : "#3f8a55";
  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ background: `linear-gradient(180deg, ${sky[0]}, ${sky[1]})` }}>
      {/* background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex h-[70%] items-end justify-between opacity-70" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <TreeSilhouette key={i} color={far} className="h-[80%] w-1/4 shrink-0" />
        ))}
      </div>
      {rays && <SunRays className="-z-10" />}
      {/* midground */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex h-[45%] items-end justify-around" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <TreeSilhouette key={i} color={mid} className="h-full w-1/3 shrink-0" />
        ))}
      </div>
      {fireflies > 0 && <Fireflies count={fireflies} className="-z-10" />}
      {vines && <HangingVines />}
      {children}
    </div>
  );
}
