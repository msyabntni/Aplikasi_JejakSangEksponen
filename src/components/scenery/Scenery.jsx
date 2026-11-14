/** Elemen lingkungan hutan (SVG/CSS ringan) yang dipakai ulang di banyak halaman. */

export function Monstera({ className = "", style, color = "#2f8a4f", flip }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={{ ...style, transform: `${style?.transform ?? ""} ${flip ? "scaleX(-1)" : ""}` }} aria-hidden>
      <path d="M60 112 C20 104 4 70 10 42 C16 16 44 4 66 8 C96 14 116 40 112 70 C108 96 88 110 60 112 Z" fill={color} />
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

export function Leaf({ className = "", style, color = "#62A66B" }) {
  return (
    <svg viewBox="0 0 40 60" className={className} style={style} aria-hidden>
      <path d="M20 58 C2 44 0 18 20 2 C40 18 38 44 20 58 Z" fill={color} />
      <path d="M20 58 L20 6" stroke="#1d5c34" strokeWidth="1.6" opacity="0.6" />
    </svg>
  );
}

/** Tanaman rambat menjuntai dari atas. */
export function HangingVines({ className = "", count = 7, seed = 1 }) {
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
              <path
                key={k}
                d={`M20 ${18 + k * 24} q${k % 2 ? 12 : -12} -4 ${k % 2 ? 16 : -16} 6 q${k % 2 ? -10 : 10} 4 ${k % 2 ? -16 : 16} -6`}
                fill={k % 2 ? "#62A66B" : "#4e9a5a"}
              />
            ))}
            <path d={`M20 ${v.len} q-9 6 0 22 q9 -16 0 -22`} fill="#7cc283" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export function Butterfly({ className = "", color = "#F39B57", style }) {
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

export function Mushroom({ className = "", color = "#F39B57", glow }) {
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

export function Gem({ className = "", color = "#5fd0c4", size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path d="M6 3 H18 L22 9 L12 22 L2 9 Z" fill={color} />
      <path d="M2 9 H22 M8 3 L12 9 L16 3 M12 9 V22" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" fill="none" />
      <path d="M7 5 L9 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TreasureChest({ open, className = "", width = 120 }) {
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
      <g
        style={{
          transformOrigin: "60px 50px",
          transform: open ? "rotateX(0) translateY(-22px) rotate(-12deg)" : "none",
          transition: "transform .6s cubic-bezier(.2,1.4,.4,1)",
        }}
      >
        <path d="M14 52 Q14 22 60 22 Q106 22 106 52 Z" fill="#a06c48" stroke="#5a3a28" strokeWidth="3" />
        <path d="M30 26 L30 52 M90 26 L90 52" stroke="#e0b43c" strokeWidth="6" />
      </g>
      <path d="M30 50 V94 M90 50 V94" stroke="#e0b43c" strokeWidth="6" />
      <rect x="51" y="54" width="18" height="18" rx="3" fill="#e0b43c" stroke="#a57b1f" strokeWidth="2" />
      <circle cx="60" cy="62" r="3" fill="#5a3a28" />
    </svg>
  );
}

export function Footprints({ className = "" }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <g fill="#754B35" opacity="0.5">
        <ellipse cx="10" cy="20" rx="4" ry="6" />
        <circle cx="8" cy="12" r="1.4" />
        <circle cx="11" cy="11.5" r="1.4" />
        <circle cx="13.5" cy="13" r="1.3" />
        <ellipse cx="40" cy="12" rx="4" ry="6" />
        <circle cx="38" cy="4" r="1.4" />
        <circle cx="41" cy="3.5" r="1.4" />
        <circle cx="43.5" cy="5" r="1.3" />
      </g>
    </svg>
  );
}

export function Compass({ className = "", size = 28 }) {
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
export function Fireflies({ count = 10, className = "" }) {
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

export function SunRays({ className = "" }) {
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

export function Waterfall({ className = "" }) {
  return (
    <div className={`absolute ${className}`} aria-hidden>
      {/* tebing batu di belakang air terjun (lebih lebar ke kanan agar tidak menghalangi judul) */}
      <svg viewBox="0 0 260 400" preserveAspectRatio="none" className="absolute -left-[30%] -top-[7%] h-[109%] w-[253%] overflow-visible">
        <path
          d="M18 46 L30 22 L52 14 L70 4 L104 0 L130 8 L152 6 L176 18 L204 30 L228 52 L244 84 L250 124 L244 170 L256 222 L248 278 L258 332 L252 392 Q228 404 200 396 Q170 404 140 398 L30 398 Q14 404 8 392 L14 352 L6 300 L12 246 L4 196 L12 146 L6 98 Z"
          fill="#8d8571"
        />
        {/* bidang terang & bayangan tebing */}
        <path d="M150 10 L176 20 L204 32 L228 54 L244 86 L250 126 L244 170 L256 222 L248 278 L258 332 L252 392 Q228 404 200 396 L196 330 L188 270 L198 210 L186 150 L192 92 L170 40 Z" fill="#a69d86" />
        <path d="M12 146 L6 98 L18 46 L30 22 L36 60 L28 110 L34 170 L24 230 L32 300 L22 360 L24 400 L8 400 L14 352 L6 300 L12 246 L4 196 Z" fill="#766e5c" />
        {/* lapisan retakan batu */}
        <g stroke="#6b6352" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M140 60 L170 66 L200 58 L228 66" />
          <path d="M150 128 L186 136 L214 128 L240 136" />
          <path d="M146 196 L180 190 L212 198 L244 192" />
          <path d="M150 262 L188 270 L220 262 L246 270" />
          <path d="M156 330 L190 324 L222 332 L250 326" />
          <path d="M10 120 L26 126" />
          <path d="M8 214 L26 208" />
          <path d="M12 300 L28 306" />
        </g>
        {/* batu basah gelap di balik aliran air */}
        <path d="M34 20 Q84 6 136 20 L140 400 L32 400 Z" fill="#5c6a63" />
        {/* lumut di tepian tebing */}
        <g fill="#5f9e4f">
          <path d="M140 60 Q170 46 206 58 Q190 68 166 66 Q148 68 140 60Z" /><path d="M212 62 Q226 54 240 66 Q228 72 214 68Z" />
          <path d="M150 196 Q180 184 214 198 Q196 206 172 202 Q156 204 150 196Z" />
          <path d="M156 330 Q190 318 226 332 Q206 340 182 336 Q164 338 156 330Z" /><path d="M228 326 Q242 318 252 330 Q242 334 230 332Z" />
          <path d="M6 98 Q18 92 30 100 Q22 106 14 104Z" />
          <path d="M4 196 Q16 188 28 198 Q18 204 10 202Z" />
        </g>
        <g fill="#7cc283">
          <circle cx="164" cy="58" r="5" />
          <circle cx="196" cy="190" r="4" /><circle cx="236" cy="62" r="4" />
          <circle cx="16" cy="96" r="4" />
        </g>
        {/* pakis & tanaman menjuntai dari celah tebing */}
        <g stroke="#3f8a55" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M176 64 Q190 90 184 120" /><path d="M226 66 Q240 92 234 124" />
          <path d="M22 104 Q8 130 14 160" />
          <path d="M200 202 Q214 226 206 252" />
        </g>
        <g fill="#62A66B">
          {[
            [181, 78, 1],
            [186, 92, -1],
            [182, 106, 1],
            [17, 118, -1],
            [11, 132, 1],
            [13, 146, -1],
            [205, 216, 1],
            [209, 230, -1],
            [205, 244, 1],
            [231, 80, 1],
            [236, 94, -1],
            [232, 108, 1],
          ].map(([x, y, a], i) => (
            <path key={i} d={`M${x} ${y} q${a * 10} -6 ${a * 14} 2 q${a * -8} 5 ${a * -14} -2Z`} />
          ))}
        </g>
      </svg>
      <div className="relative h-full w-full overflow-hidden rounded-t-[40%] rounded-b-md">
        <div className="water-fall absolute inset-0 bg-sky/80" />
      </div>
      {/* bibir tebing tempat sumber air keluar: batu, lumut & tanaman */}
      <svg viewBox="0 0 170 64" className="absolute -left-[35%] -top-[9%] w-[170%] overflow-visible">
        <path d="M0 40 Q4 18 26 14 Q40 2 62 8 Q86 0 110 8 Q134 2 148 16 Q168 20 170 42 Q150 52 130 46 Q112 54 96 44 L74 44 Q58 54 40 46 Q18 54 0 40Z" fill="#9a9178" stroke="#6b6352" strokeWidth="3" />
        <path d="M10 34 Q24 22 40 26 M118 22 Q136 16 154 30" stroke="#b9b09a" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* air mengalir keluar dari celah batu */}
        <path d="M38 44 Q52 36 85 38 Q118 36 132 44 Q118 52 85 50 Q52 52 38 44Z" fill="#bfeaf3" />
        <path d="M50 44 Q66 40 85 42 Q104 40 120 44" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
        {/* lumut menutupi puncak batu */}
        <path d="M14 22 Q30 6 56 10 Q76 2 100 8 Q124 2 146 14 Q132 20 114 16 Q92 22 74 16 Q52 22 36 18 Q24 24 14 22Z" fill="#5f9e4f" />
        <g fill="#7cc283">
          <circle cx="40" cy="12" r="5" />
          <circle cx="98" cy="8" r="4.5" />
          <circle cx="132" cy="14" r="4" />
        </g>
        {/* tanaman kecil & daun pakis di atas bibir tebing */}
        <g fill="#3f8a55">
          <path d="M22 18 Q12 0 4 -6 Q18 -2 26 14Z" />
          <path d="M28 16 Q30 -6 40 -14 Q38 4 32 16Z" />
          <path d="M140 14 Q150 -4 162 -8 Q154 6 146 18Z" />
          <path d="M134 12 Q128 -8 132 -18 Q140 -2 138 12Z" />
        </g>
        <g fill="#62A66B">
          <path d="M66 8 Q60 -8 68 -16 Q72 -2 70 8Z" />
          <path d="M72 8 Q80 -6 90 -8 Q84 2 76 10Z" />
        </g>
      </svg>
      <div className="absolute -bottom-3 left-1/2 h-6 w-[160%] -translate-x-1/2 rounded-full bg-white/60 blur-sm" />
      {/* kolam kecil di kaki air terjun: bebatuan, lumut & tanaman */}
      <svg viewBox="0 0 220 70" className="absolute -bottom-[11%] -left-[60%] w-[220%] overflow-visible">
        <ellipse cx="110" cy="34" rx="62" ry="13" fill="#8ED6E8" opacity="0.9" />
        <path d="M70 32 q8 -5 16 0 q8 -5 16 0 M112 36 q8 -5 16 0 q8 -5 16 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
        {/* batu kiri */}
        <path d="M18 50 C14 34 30 22 48 24 C64 22 76 34 72 48 C70 58 24 60 18 50Z" fill="#a9b0b2" stroke="#646c72" strokeWidth="3" />
        <path d="M28 34 Q38 26 50 28" stroke="#d4d9da" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M24 30 Q38 18 56 24 Q44 30 30 34Z" fill="#5f9e4f" />
        <path d="M60 50 C58 40 68 34 78 36 C88 36 92 44 90 50 C86 58 64 58 60 50Z" fill="#b3a387" stroke="#6b5d43" strokeWidth="2.5" />
        {/* batu kanan */}
        <path d="M140 52 C136 38 150 28 166 30 C184 28 198 38 196 52 C192 62 146 62 140 52Z" fill="#b3a387" stroke="#6b5d43" strokeWidth="3" />
        <path d="M150 38 Q160 32 172 34" stroke="#d6c9ae" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M156 32 Q172 22 188 34 Q174 36 160 36Z" fill="#5f9e4f" />
        <path d="M126 50 C124 42 132 38 140 40 C148 40 150 46 148 52 C144 58 128 58 126 50Z" fill="#a9b0b2" stroke="#646c72" strokeWidth="2.5" />
        {/* kerikil */}
        <ellipse cx="100" cy="52" rx="7" ry="4" fill="#c9c2ad" stroke="#8a826b" strokeWidth="1.5" />
        <ellipse cx="114" cy="54" rx="5" ry="3" fill="#a9b0b2" stroke="#646c72" strokeWidth="1.5" />
        {/* pakis & rumput di sekitar kolam */}
        <g stroke="#3f8a55" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M8 56 Q4 40 -6 30 M12 56 Q14 38 8 22 M16 56 Q24 42 30 36" />
          <path d="M204 58 Q210 42 220 34 M200 58 Q198 40 204 24 M196 58 Q190 44 184 40" />
        </g>
        <g fill="#62A66B">
          <path d="M-6 30 q-4 -10 4 -14 q4 8 -4 14Z" />
          <path d="M8 22 q-2 -12 6 -14 q2 10 -6 14Z" />
          <path d="M220 34 q8 -8 12 0 q-6 6 -12 0Z" />
          <path d="M204 24 q2 -12 10 -12 q-2 10 -10 12Z" />
        </g>
        <g fill="#e57f9a">
          <circle cx="30" cy="36" r="3" />
          <circle cx="184" cy="40" r="3" />
        </g>
      </svg>
    </div>
  );
}

/** Siluet pohon besar untuk layer latar. */
export function TreeSilhouette({ className = "", color = "#1f5536" }) {
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
export function JungleBackdrop({ children, className = "", sky = ["#bfe6c9", "#e9f0d8"], rays = true, fireflies = 8, vines = true, tone = "day" }) {
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
