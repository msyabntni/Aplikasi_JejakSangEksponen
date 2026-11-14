/**
 * KACIRO — kancil cerdas berkacamata bulat dengan rompi penjelajah hijau.
 * Pose berbeda memakai kerangka tubuh yang sama agar konsisten.
 */

export const KACIRO_COLORS = {
  fur: "#C9965F",
  furDark: "#9C6C3C",
  cream: "#F6E7C8",
  ear: "#E9B9A2",
  vest: "#3E7C4F",
  vestDark: "#2D5E3B",
  scarf: "#F4D77A",
  strap: "#754B35",
  hoof: "#4A3020",
  line: "#2E1F12",
};
const C = KACIRO_COLORS;

const ARMS = {
  idle: { l: "M80 150 Q70 176 74 196", r: "M120 150 Q130 176 126 196", hl: [74, 198], hr: [126, 198] },
  board: { l: "M80 150 Q68 174 72 194", r: "M120 150 Q142 160 148 178", hl: [72, 196], hr: [149, 180] },
  point: { l: "M80 150 Q70 176 74 196", r: "M120 150 Q148 134 168 112", hl: [74, 198], hr: [170, 110] },
  book: { l: "M80 150 Q70 172 84 182", r: "M120 150 Q130 172 116 182", hl: [86, 183], hr: [114, 183] },
  think: { l: "M80 150 Q78 176 100 180", r: "M120 150 Q134 132 112 120", hl: [100, 180], hr: [110, 119] },
  tip: { l: "M80 150 Q70 176 74 196", r: "M120 150 Q144 132 142 104", hl: [74, 198], hr: [142, 101] },
  map: { l: "M80 150 Q64 160 58 172", r: "M120 150 Q136 160 142 172", hl: [58, 174], hr: [142, 174] },
  cheer: { l: "M80 150 Q60 128 64 102", r: "M120 150 Q140 128 136 102", hl: [64, 99], hr: [136, 99] },
};

function Eyes({ mood }) {
  if (mood === "happy" || mood === "proud")
    return (
      <g stroke={C.line} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M80 84 Q86 77 92 84" />
        <path d="M108 84 Q114 77 120 84" />
      </g>
    );
  const dy = mood === "think" ? -3 : 0;
  const dx = mood === "think" ? 2 : 0;
  return (
    <g>
      <ellipse cx={86} cy={82} rx="6.5" ry="8.5" fill={C.line} />
      <ellipse cx={114} cy={82} rx="6.5" ry="8.5" fill={C.line} />
      <circle cx={88 + dx} cy={79 + dy} r="2.4" fill="#fff" />
      <circle cx={116 + dx} cy={79 + dy} r="2.4" fill="#fff" />
    </g>
  );
}

export default function Kaciro({
  pose = "idle",
  mood,
  width = 170,
  className = "",
  animate = true,
  boardText = "aᵐ × aⁿ",
  title = "Kaciro, kancil cerdas berkacamata",
  style,
}) {
  const m = mood ?? (pose === "think" ? "think" : pose === "cheer" ? "proud" : "neutral");
  const a = ARMS[pose];
  return (
    <svg viewBox="0 0 200 260" width={width} className={className} style={style} role="img" aria-label={title}>
      <g className={animate ? "animate-bob" : ""} style={{ animationDuration: "3.6s" }}>
        {/* ekor kecil */}
        <path d="M122 198 Q136 192 134 206 Q128 208 122 204Z" fill={C.cream} />
        {/* kaki ramping dengan kuku */}
        <g stroke={C.fur} strokeWidth="9" strokeLinecap="round">
          <path d="M91 204 L88 238" />
          <path d="M109 204 L112 238" />
        </g>
        <path d="M82 236 h12 l-2 8 h-8z" fill={C.hoof} />
        <path d="M106 236 h12 l-2 8 h-8z" fill={C.hoof} />
        {/* badan */}
        <ellipse cx="100" cy="170" rx="27" ry="39" fill={C.fur} />
        <ellipse cx="100" cy="180" rx="15" ry="26" fill={C.cream} />
        {/* rompi hijau */}
        <path d="M74 150 Q71 188 84 206 L94 206 L92 140 Z" fill={C.vest} />
        <path d="M126 150 Q129 188 116 206 L106 206 L108 140 Z" fill={C.vest} />
        <rect x="78" y="176" width="11" height="10" rx="2" fill={C.vestDark} />
        <rect x="111" y="176" width="11" height="10" rx="2" fill={C.vestDark} />
        <circle cx="92" cy="160" r="2" fill={C.scarf} />
        <circle cx="92" cy="172" r="2" fill={C.scarf} />
        {/* tas selempang */}
        <path d="M118 140 L84 198" stroke={C.strap} strokeWidth="5" strokeLinecap="round" />
        <rect x="64" y="190" width="28" height="22" rx="5" fill={C.strap} />
        <rect x="64" y="190" width="28" height="9" rx="4" fill="#8f5c40" />
        {/* leher & garis putih khas kancil */}
        <path d="M88 108 Q86 128 84 140 L116 140 Q114 128 112 108 Z" fill={C.fur} />
        <path d="M91 118 L100 127 L109 118" stroke={C.cream} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M93 128 L100 134 L107 128" stroke={C.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* syal */}
        <path d="M80 134 Q100 146 120 134 L119 143 Q100 154 81 143 Z" fill={C.scarf} />
        <path d="M84 142 L80 160 L90 156 Z" fill={C.scarf} />
        {/* telinga */}
        <path d="M74 66 Q42 34 50 16 Q76 26 88 58 Z" fill={C.fur} />
        <path d="M74 60 Q54 38 56 26 Q72 34 81 56 Z" fill={C.ear} />
        <path d="M126 66 Q158 34 150 16 Q124 26 112 58 Z" fill={C.fur} />
        <path d="M126 60 Q146 38 144 26 Q128 34 119 56 Z" fill={C.ear} />
        {/* kepala */}
        <ellipse cx="100" cy="82" rx="35" ry="33" fill={C.fur} />
        <path d="M100 50 Q96 64 100 74 Q104 64 100 50Z" fill={C.furDark} opacity="0.6" />
        <ellipse cx="100" cy="106" rx="18" ry="14" fill={C.cream} />
        <Eyes mood={m} />
        {/* kacamata bulat */}
        <g stroke={C.line} strokeWidth="2.6" fill="#ffffff" fillOpacity="0.14">
          <circle cx="86" cy="82" r="13.5" />
          <circle cx="114" cy="82" r="13.5" />
        </g>
        <path d="M99 81 Q100 78 101 81" stroke={C.line} strokeWidth="2.6" fill="none" />
        <path d="M72 80 L66 76 M128 80 L134 76" stroke={C.line} strokeWidth="2.2" />
        <ellipse cx="100" cy="100" rx="6" ry="4.2" fill={C.line} />
        <path d="M93 110 Q100 116 107 110" stroke={C.line} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="73" cy="98" rx="5" ry="3" fill="#e9a08f" opacity="0.6" />
        <ellipse cx="127" cy="98" rx="5" ry="3" fill="#e9a08f" opacity="0.6" />

        {/* properti di belakang lengan */}
        {pose === "board" && (
          <g>
            <rect x="140" y="112" width="58" height="46" rx="5" fill="#2f5e44" stroke="#754B35" strokeWidth="4" />
            <text x="169" y="141" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff7e0" fontFamily="var(--font-display)">
              {boardText}
            </text>
            <path d="M156 158 L150 182 M184 158 L190 182" stroke="#754B35" strokeWidth="3" />
          </g>
        )}
        {pose === "map" && (
          <g>
            <rect x="52" y="160" width="96" height="42" rx="3" fill="#fbf3dc" stroke="#c9a96a" strokeWidth="2" />
            <path d="M60 192 Q78 168 96 186 T138 172" stroke="#3E7C4F" strokeWidth="2.4" strokeDasharray="4 3" fill="none" />
            <path d="M132 166 l7 7 m0 -7 l-7 7" stroke="#d9534f" strokeWidth="2.6" />
          </g>
        )}
        {pose === "book" && (
          <g>
            <path d="M70 172 Q85 166 100 174 Q115 166 130 172 L130 198 Q115 192 100 200 Q85 192 70 198 Z" fill="#fbf3dc" stroke="#754B35" strokeWidth="2.5" />
            <path d="M100 174 L100 200" stroke="#754B35" strokeWidth="2" />
            <path d="M76 180 h16 M76 186 h14 M108 180 h16 M108 186 h12" stroke="#b49b6e" strokeWidth="1.8" />
          </g>
        )}

        {/* lengan depan (kaki depan) dengan kuku kecil */}
        <g stroke={C.fur} strokeWidth="8.5" strokeLinecap="round" fill="none">
          <path d={a.l} />
          <path d={a.r} />
        </g>
        <circle cx={a.hl[0]} cy={a.hl[1]} r="5" fill={C.hoof} />
        <circle cx={a.hr[0]} cy={a.hr[1]} r="5" fill={C.hoof} />
        {pose === "tip" && <path d="M142 97 L142 84" stroke={C.hoof} strokeWidth="4.5" strokeLinecap="round" />}
        {pose === "point" && <path d="M172 108 L184 98" stroke={C.hoof} strokeWidth="4.5" strokeLinecap="round" />}
        {pose === "think" && (
          <g fill="#fff" stroke="#c9b48a" strokeWidth="1.5">
            <circle cx="150" cy="58" r="5" />
            <circle cx="162" cy="42" r="8" />
            <text x="162" y="47" textAnchor="middle" fontSize="11" fontWeight="800" fill="#754B35" stroke="none">
              ?
            </text>
          </g>
        )}
        {pose === "cheer" && (
          <g fill="#F4D77A">
            <path className="twinkle" d="M34 80 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
            <path className="twinkle" style={{ animationDelay: "0.8s" }} d="M168 70 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          </g>
        )}
      </g>
    </svg>
  );
}
