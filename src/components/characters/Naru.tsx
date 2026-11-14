/**
 * NARU — monyet penjelajah cokelat dengan aksen pink.
 * Satu komponen SVG dengan banyak pose supaya proporsi & warna selalu konsisten
 * (lihat /karakter untuk reference sheet).
 */
import type { CSSProperties } from "react";

export type NaruPose = "idle" | "hang" | "swing" | "jump" | "sit" | "point" | "peek" | "cheer";
export type NaruMood = "happy" | "neutral" | "cheer" | "worried" | "wink";

export const NARU_COLORS = {
  fur: "#8B5A3C",
  furDark: "#6B4228",
  face: "#EFCFA4",
  pink: "#E59AA8",
  pinkDark: "#C97586",
  coral: "#F08A8A",
  hat: "#D8B878",
  hatDark: "#B89652",
  line: "#3B2416",
};
const C = NARU_COLORS;

const ARMS: Record<Exclude<NaruPose, "peek">, { l: string; r: string; hl: [number, number]; hr: [number, number] }> = {
  idle: { l: "M74 146 Q60 170 66 190", r: "M126 146 Q150 132 152 108", hl: [66, 192], hr: [152, 104] },
  hang: { l: "M76 146 Q58 166 60 186", r: "M124 144 Q170 104 160 26", hl: [60, 188], hr: [160, 22] },
  swing: { l: "M78 144 Q46 80 92 4", r: "M122 144 Q154 80 108 4", hl: [93, 0], hr: [107, 0] },
  jump: { l: "M74 146 Q50 122 44 96", r: "M126 146 Q150 122 156 96", hl: [43, 92], hr: [157, 92] },
  sit: { l: "M76 148 Q66 178 74 198", r: "M124 148 Q134 178 126 198", hl: [74, 200], hr: [126, 200] },
  point: { l: "M74 146 Q58 166 64 182", r: "M126 146 Q152 140 170 126", hl: [64, 184], hr: [172, 124] },
  cheer: { l: "M74 146 Q54 122 62 98", r: "M126 146 Q146 122 138 98", hl: [62, 94], hr: [138, 94] },
};

const LEGS: Record<"stand" | "dangle" | "bent" | "sit", { l: string; r: string; fl: [number, number]; fr: [number, number] }> = {
  stand: { l: "M90 198 Q86 220 82 236", r: "M110 198 Q114 220 118 236", fl: [78, 239], fr: [122, 239] },
  dangle: { l: "M90 198 Q86 222 92 242", r: "M110 198 Q120 220 114 240", fl: [93, 245], fr: [114, 243] },
  bent: { l: "M90 198 Q68 208 74 228", r: "M110 198 Q132 208 126 228", fl: [72, 231], fr: [128, 231] },
  sit: { l: "M90 202 Q76 216 60 216", r: "M110 202 Q124 216 140 216", fl: [56, 217], fr: [144, 217] },
};

const TAILS: Record<string, string> = {
  idle: "M114 196 Q162 214 164 172 Q164 142 144 142 Q128 144 134 158",
  hang: "M110 200 Q176 206 172 150 Q168 100 162 60",
  swing: "M110 200 Q166 200 160 140 Q154 90 132 62",
  jump: "M112 200 Q170 206 172 166 Q172 140 154 140",
  sit: "M112 206 Q156 214 160 240 Q162 252 150 254",
  point: "M114 196 Q160 214 162 176 Q162 150 146 152",
  cheer: "M112 196 Q166 210 168 168 Q168 140 148 144",
};

function Eyes({ mood }: { mood: NaruMood }) {
  if (mood === "happy" || mood === "cheer")
    return (
      <g stroke={C.line} strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M78 88 Q85 79 92 88" />
        <path d="M108 88 Q115 79 122 88" />
      </g>
    );
  if (mood === "wink")
    return (
      <g>
        <ellipse cx="85" cy="86" rx="6.5" ry="8" fill={C.line} />
        <circle cx="87.5" cy="83" r="2.2" fill="#fff" />
        <path d="M108 88 Q115 80 122 88" stroke={C.line} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      </g>
    );
  return (
    <g>
      <ellipse cx="85" cy="86" rx="6.5" ry="8" fill={C.line} />
      <ellipse cx="115" cy="86" rx="6.5" ry="8" fill={C.line} />
      <circle cx="87.5" cy="83" r="2.3" fill="#fff" />
      <circle cx="117.5" cy="83" r="2.3" fill="#fff" />
      {mood === "worried" && (
        <g stroke={C.furDark} strokeWidth="3" strokeLinecap="round">
          <path d="M76 72 L92 76" />
          <path d="M124 72 L108 76" />
        </g>
      )}
    </g>
  );
}

function Head({ mood }: { mood: NaruMood }) {
  return (
    <g>
      <circle cx="55" cy="92" r="15" fill={C.fur} />
      <circle cx="55" cy="92" r="8" fill={C.face} />
      <circle cx="145" cy="92" r="15" fill={C.fur} />
      <circle cx="145" cy="92" r="8" fill={C.face} />
      <circle cx="100" cy="88" r="44" fill={C.fur} />
      <circle cx="84" cy="86" r="17" fill={C.face} />
      <circle cx="116" cy="86" r="17" fill={C.face} />
      <ellipse cx="100" cy="106" rx="26" ry="18" fill={C.face} />
      <Eyes mood={mood} />
      <ellipse cx="72" cy="101" rx="6" ry="3.5" fill={C.pink} opacity="0.6" />
      <ellipse cx="128" cy="101" rx="6" ry="3.5" fill={C.pink} opacity="0.6" />
      <ellipse cx="96" cy="100" rx="1.8" ry="1.4" fill={C.line} />
      <ellipse cx="104" cy="100" rx="1.8" ry="1.4" fill={C.line} />
      {mood === "cheer" ? (
        <g>
          <path d="M88 108 Q100 128 112 108 Z" fill="#7a2b2b" />
          <path d="M94 117 Q100 124 106 117 Q100 114 94 117Z" fill="#e57f7f" />
        </g>
      ) : mood === "worried" ? (
        <path d="M91 114 Q100 108 109 114" stroke={C.line} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M89 108 Q100 118 111 108" stroke={C.line} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      )}
      {/* topi penjelajah */}
      <ellipse cx="100" cy="56" rx="52" ry="9.5" fill={C.hatDark} />
      <path d="M62 57 Q63 18 100 16 Q137 18 138 57 Z" fill={C.hat} />
      <path d="M63 49 Q100 41 137 49 L138 57 Q100 49 62 57 Z" fill={C.pink} />
      <circle cx="100" cy="19" r="4.5" fill={C.hatDark} />
      <path d="M78 30 Q88 22 98 22" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Arms({ arms }: { arms: { l: string; r: string; hl: [number, number]; hr: [number, number] } }) {
  return (
    <g>
      <g stroke={C.fur} strokeWidth="11" strokeLinecap="round" fill="none">
        <path d={arms.l} />
        <path d={arms.r} />
      </g>
      <circle cx={arms.hl[0]} cy={arms.hl[1]} r="7.5" fill={C.face} />
      <circle cx={arms.hr[0]} cy={arms.hr[1]} r="7.5" fill={C.face} />
    </g>
  );
}

function Vine({ x, to }: { x: number; to: number }) {
  return (
    <g>
      <path d={`M${x} -30 Q${x - 6} ${to / 2} ${x} ${to + 8}`} stroke="#3f7d3a" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={`M${x} 6 q-14 -2 -18 8 q12 4 18 -8`} fill="#62A66B" />
      <path d={`M${x} 22 q14 -2 18 8 q-12 4 -18 -8`} fill="#4e9a5a" />
    </g>
  );
}

export default function Naru({
  pose = "idle",
  mood,
  width = 180,
  className = "",
  animate = true,
  title = "Naru, monyet penjelajah",
  style,
}: {
  pose?: NaruPose;
  mood?: NaruMood;
  width?: number | string;
  className?: string;
  animate?: boolean;
  title?: string;
  style?: CSSProperties;
}) {
  const m: NaruMood = mood ?? (pose === "cheer" || pose === "jump" ? "cheer" : pose === "hang" || pose === "swing" ? "happy" : "neutral");

  if (pose === "peek") {
    return (
      <svg viewBox="20 0 160 140" width={width} className={className} style={style} role="img" aria-label={title}>
        <g className={animate ? "animate-bob" : ""}>
          <Head mood={mood ?? "wink"} />
          <ellipse cx="62" cy="132" rx="14" ry="10" fill={C.face} stroke={C.fur} strokeWidth="5" />
          <ellipse cx="138" cy="132" rx="14" ry="10" fill={C.face} stroke={C.fur} strokeWidth="5" />
        </g>
      </svg>
    );
  }

  const arms = ARMS[pose];
  const legKey = pose === "hang" || pose === "swing" ? "dangle" : pose === "jump" ? "bent" : pose === "sit" ? "sit" : "stand";
  const legs = LEGS[legKey];
  const hanging = pose === "hang" || pose === "swing";
  const wrapClass = !animate ? "" : hanging ? "animate-swing" : pose === "jump" || pose === "cheer" ? "animate-bob" : "";
  const wrapStyle: CSSProperties = hanging ? { transformOrigin: "50% 0%", transformBox: "fill-box" } : {};

  return (
    <svg viewBox={hanging ? "0 -30 200 280" : "0 0 200 260"} width={width} className={className} style={style} role="img" aria-label={title}>
      <g className={wrapClass} style={wrapStyle}>
        {pose === "hang" && <Vine x={160} to={24} />}
        {pose === "swing" && <Vine x={100} to={2} />}
        {/* ekor panjang */}
        <path d={TAILS[pose]} stroke={C.fur} strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* tas punggung */}
        <rect x="116" y="138" width="34" height="44" rx="10" fill={C.pinkDark} />
        <rect x="120" y="140" width="26" height="12" rx="5" fill={C.pink} />
        <circle cx="133" cy="166" r="4" fill={C.hat} />
        {/* kaki */}
        <g stroke={C.fur} strokeWidth="11" strokeLinecap="round" fill="none">
          <path d={legs.l} />
          <path d={legs.r} />
        </g>
        <ellipse cx={legs.fl[0]} cy={legs.fl[1]} rx="10" ry="6" fill={C.face} />
        <ellipse cx={legs.fr[0]} cy={legs.fr[1]} rx="10" ry="6" fill={C.face} />
        {/* badan */}
        <ellipse cx="100" cy="168" rx="32" ry="37" fill={C.fur} />
        <ellipse cx="100" cy="177" rx="19" ry="23" fill={C.face} />
        {/* rompi pink */}
        <path d="M69 152 Q66 186 80 202 L90 202 L89 146 Z" fill={C.pink} />
        <path d="M131 152 Q134 186 120 202 L110 202 L111 146 Z" fill={C.pink} />
        <rect x="74" y="176" width="11" height="9" rx="2" fill={C.pinkDark} />
        <path d="M111 152 L120 196" stroke={C.pinkDark} strokeWidth="4" strokeLinecap="round" />
        {/* syal */}
        <path d="M70 134 Q100 150 130 134 L128 145 Q100 160 72 145 Z" fill={C.coral} />
        <path d="M118 146 L126 168 L116 166 Z" fill={C.coral} />
        {/* lengan (pose bergelantungan digambar di atas kepala) */}
        {!hanging && <Arms arms={arms} />}
        {pose === "point" && (
          <g>
            <path d="M174 122 L188 116" stroke={C.face} strokeWidth="5" strokeLinecap="round" />
            {/* peta */}
            <g transform="rotate(-10 60 186)">
              <rect x="34" y="170" width="50" height="36" rx="3" fill="#fbf3dc" stroke="#c9a96a" strokeWidth="2" />
              <path d="M40 196 Q52 178 62 192 T80 182" stroke="#c97586" strokeWidth="2" strokeDasharray="3 3" fill="none" />
              <path d="M74 178 l6 6 m0 -6 l-6 6" stroke="#d9534f" strokeWidth="2.4" />
            </g>
          </g>
        )}
        {pose === "idle" && (
          <g>
            {/* kompas di tangan kiri */}
            <circle cx="66" cy="200" r="9" fill={C.hat} stroke={C.hatDark} strokeWidth="2" />
            <path d="M66 194 L68 200 L66 206 L64 200 Z" fill="#d9534f" />
          </g>
        )}
        <g transform={pose === "jump" || pose === "cheer" ? "translate(0 -2)" : undefined}>
          <Head mood={m} />
        </g>
        {hanging && <Arms arms={arms} />}
        {pose === "cheer" && (
          <g fill={C.hat}>
            <path className="twinkle" d="M30 70 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" />
            <path className="twinkle" style={{ animationDelay: "0.6s" }} d="M170 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          </g>
        )}
      </g>
    </svg>
  );
}
