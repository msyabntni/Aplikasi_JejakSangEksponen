"use client";

import { useMemo } from "react";

import Naru from "../characters/Naru";
import { REGIONS } from "@/data/regions";

export const SPOTS = {
  1: { x: 250, y: 1440 },
  2: { x: 730, y: 1250 },
  3: { x: 290, y: 1020 },
  4: { x: 735, y: 800 },
  5: { x: 280, y: 590 },
  6: { x: 715, y: 375 },
  7: { x: 390, y: 160 },
};

const TRAIL =
  "M250 1500 C250 1440 260 1400 330 1370 C480 1310 650 1330 730 1250 C800 1180 640 1110 520 1080 C390 1050 230 1080 290 1020 C340 960 600 900 735 800 C820 730 620 660 470 640 C340 620 220 650 280 590 C340 520 640 470 715 375 C770 300 560 260 470 230 C410 210 380 190 390 160";

function Landmark({ id }) {
  switch (id) {
    case 1: // tenda & api unggun
      return (
        <g>
          <path d="M-70 30 L-30 -40 L10 30 Z" fill="#F39B57" stroke="#a3521c" strokeWidth="4" />
          <path d="M-30 -40 L-30 30" stroke="#a3521c" strokeWidth="3" />
          <path d="M-42 30 L-30 4 L-18 30Z" fill="#7a3b16" />
          <g transform="translate(50 22)">
            <path d="M-16 8 L16 -2 M-16 -2 L16 8" stroke="#754B35" strokeWidth="6" strokeLinecap="round" />
            <path d="M0 -6 Q-12 -22 0 -40 Q4 -26 12 -24 Q12 -10 0 -6Z" fill="#F39B57" className="twinkle" />
            <path d="M0 -8 Q-5 -18 0 -28 Q6 -18 0 -8Z" fill="#F4D77A" />
          </g>
        </g>
      );
    case 2: // batu-batu lembah
      return (
        <g>
          <path d="M-90 30 Q-60 -40 -20 30 Z" fill="#b98a5a" />
          <path d="M-10 30 Q30 -60 80 30 Z" fill="#a37548" />
          <ellipse cx="-30" cy="22" rx="22" ry="14" fill="#c9c2ad" stroke="#8a826b" strokeWidth="3" />
          <ellipse cx="20" cy="26" rx="18" ry="11" fill="#e8e4d6" stroke="#8a826b" strokeWidth="3" />
          <text x="-30" y="28" textAnchor="middle" fontSize="16" fontWeight="900" fill="#754B35">
            ×
          </text>
          <circle cx="60" cy="0" r="5" fill="#5fd0c4" className="twinkle" />
        </g>
      );
    case 3: // pohon tepi sungai
      return (
        <g>
          <circle cx="-60" cy="-20" r="34" fill="#3f8a55" />
          <rect x="-66" y="0" width="12" height="34" fill="#754B35" />
          <path d="M20 26 Q40 0 70 26" stroke="#8ED6E8" strokeWidth="5" fill="none" />
          <text x="44" y="12" textAnchor="middle" fontSize="18" fontWeight="900" fill="#246B45">
            :
          </text>
        </g>
      );
    case 4: // gua kristal
      return (
        <g>
          <path d="M-90 40 Q-90 -60 0 -70 Q90 -60 90 40 Z" fill="#5a4c80" />
          <path d="M-40 40 Q-40 -16 0 -18 Q40 -16 40 40 Z" fill="#231c33" />
          <path d="M-70 10 L-62 -20 L-54 10Z M60 0 L68 -30 L76 0Z M-20 -40 L-14 -60 L-8 -40Z" fill="#b7a3f0" className="twinkle" />
        </g>
      );
    case 5: // pohon nol raksasa
      return (
        <g>
          <rect x="-14" y="-20" width="28" height="60" rx="6" fill="#6b4228" />
          <circle cx="0" cy="-50" r="56" fill="#4f8a4b" />
          <circle cx="-44" cy="-30" r="32" fill="#5a9a55" />
          <circle cx="44" cy="-34" r="32" fill="#5a9a55" />
          {[-30, 0, 30].map((x) => (
            <g key={x}>
              <circle cx={x} cy={-50 + Math.abs(x) / 2} r="10" fill="#F4D77A" />
              <text x={x} y={-45 + Math.abs(x) / 2} textAnchor="middle" fontSize="12" fontWeight="900" fill="#754B35">
                1
              </text>
            </g>
          ))}
        </g>
      );
    case 6: // gunung bersalju
      return (
        <g>
          <path d="M-110 40 L-20 -100 L70 40 Z" fill="#7d8ea3" />
          <path d="M-20 -100 L-48 -56 L-30 -62 L-14 -50 L4 -64 Z" fill="#fff" />
          <path d="M10 40 L70 -50 L120 40 Z" fill="#94a5b9" />
          <path d="M70 -50 L56 -28 L70 -32 L84 -26Z" fill="#fff" />
        </g>
      );
    case 7: // kuil harta
      return (
        <g>
          <rect x="-80" y="-10" width="160" height="50" fill="#c9a96a" stroke="#8a6a3d" strokeWidth="4" />
          <path d="M-96 -10 L0 -80 L96 -10 Z" fill="#e0b43c" stroke="#8a6a3d" strokeWidth="4" />
          {[-56, -20, 20, 56].map((x) => (
            <rect key={x} x={x - 7} y="-6" width="14" height="44" fill="#fbeccb" />
          ))}
          <rect x="-18" y="14" width="36" height="24" rx="4" fill="#8a5a3c" stroke="#5a3a28" strokeWidth="3" />
          <rect x="-5" y="18" width="10" height="10" fill="#F4D77A" />
          <circle cx="0" cy="-40" r="10" fill="#5fd0c4" className="twinkle" />
        </g>
      );
  }
}

function Marker({ id, status, onClick, preview, scale = 1 }) {
  const r = REGIONS[id - 1];
  const p = SPOTS[id];
  const ring = status === "done" ? "#F4D77A" : status === "progress" ? "#F39B57" : status === "new" ? "#B7D98A" : "#8a8a7a";
  const clickable = !preview && onClick;
  return (
    <g
      transform={`translate(${p.x} ${p.y}) scale(${scale})`}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.() : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={
        clickable
          ? `Wilayah ${r.code} ${r.name}, ${{ locked: "terkunci", new: "belum dimainkan", progress: "sedang berlangsung", done: "selesai" }[status]}`
          : undefined
      }
      style={{ cursor: clickable ? "pointer" : "default", outline: "none" }}
      className="group"
    >
      <g transform="translate(0 -70)" opacity={status === "locked" ? 0.55 : 1}>
        <Landmark id={id} />
      </g>
      {status === "locked" && (
        <g>
          <ellipse cx="0" cy="-70" rx="120" ry="70" fill="#e9f0d8" opacity="0.65" style={{ filter: "blur(6px)" }} />
          <path d="M-90 -40 q20 -40 40 -10 q10 -30 34 -6 q16 -24 36 2 q14 -16 30 6" fill="#2f6d35" opacity="0.9" />
        </g>
      )}
      {status === "new" && <circle r="58" fill="none" stroke="#B7D98A" strokeWidth="6" className="twinkle" />}
      <g className="transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110" data-penanda="nomor">
        <circle r="44" fill="#173F2A" stroke={ring} strokeWidth="8" />
        <text y="12" textAnchor="middle" fontSize="34" fontWeight="900" fill={status === "locked" ? "#9aa597" : "#fff7e0"} fontFamily="var(--font-display)">
          {r.code}
        </text>
        {status === "locked" && (
          <g transform="translate(28 -30)">
            <rect x="-12" y="-4" width="24" height="20" rx="4" fill="#754B35" />
            <path d="M-7 -4 v-6 a7 7 0 0 1 14 0 v6" stroke="#754B35" strokeWidth="4" fill="none" />
          </g>
        )}
        {status === "done" && (
          <g fill="#F4D77A" stroke="#a57b1f" strokeWidth="2">
            {[-34, 0, 34].map((x, i) => (
              <path
                key={x}
                transform={`translate(${x} ${i === 1 ? -58 : -48}) scale(${i === 1 ? 1.2 : 0.9})`}
                d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2 L7.5 11 L0 6.5 L-7.5 11 L-5.5 2 L-12 -3.5 L-3.5 -4 Z"
              />
            ))}
          </g>
        )}
      </g>
      <g transform="translate(0 72)" data-penanda="nama">
        <rect x="-110" y="-18" width="220" height="36" rx="10" fill="#8a5a3c" stroke="#5a3a28" strokeWidth="3" />
        <text y="7" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff7e0" fontFamily="var(--font-display)" letterSpacing="1">
          {r.name}
        </text>
      </g>
    </g>
  );
}

/* ── Sungai Division River ───────────────────────────────────────────── */

const SUNGAI =
  "M-20 1110 C200 1060 380 1160 560 1110 C740 1060 860 1130 1020 1090 L1020 1170 C860 1210 740 1140 560 1190 C380 1240 200 1140 -20 1190 Z";
/** Garis arus mengikuti lekuk sungai; dy menggeser lajur (0 = tengah). */
const arus = (dy) => `M-20 ${1140 + dy} C200 ${1100 + dy} 380 ${1190 + dy} 560 ${1150 + dy} C740 ${1100 + dy} 860 ${1170 + dy} 1020 ${1130 + dy}`;

/** Riak kecil yang hanyut terbawa arus: [lajur dy, durasi s, mulai s, skala]. */
const RIAK = [
  [-16, 13, 0, 1],
  [-16, 13, -6.5, 0.8],
  [-4, 11, -2, 1.1],
  [-4, 11, -7.5, 0.9],
  [8, 12, -4, 1],
  [8, 12, -10, 0.8],
  [20, 14, -1, 0.9],
  [20, 14, -8, 1.1],
  [30, 15, -5, 0.7],
  [30, 15, -12, 0.8],
  [-10, 16, -13, 0.7],
  [14, 10, -3, 0.75],
];

/** Batu: [x, y, skala, jenis (0 abu-abu, 1 cokelat), berlumut]. */
const BATU_TEPI = [
  [28, 1101, 1, 0, true],
  [60, 1093, 0.65, 1, false],
  [120, 1092, 1.15, 0, true],
  [442, 1121, 0.95, 1, true],
  [470, 1117, 0.6, 0, false],
  [800, 1093, 1, 0, true],
  [834, 1097, 0.65, 1, false],
  [905, 1100, 1.15, 1, true],
  [975, 1095, 0.8, 0, false],
  [30, 1188, 1, 1, true],
  [150, 1180, 0.85, 0, false],
  [178, 1185, 0.55, 1, false],
  [310, 1196, 1.15, 0, true],
  [420, 1207, 0.85, 1, false],
  [560, 1194, 1, 0, true],
  [592, 1188, 0.6, 1, false],
  [850, 1184, 1.05, 0, true],
  [952, 1185, 0.9, 1, false],
];
const BATU_AIR = [
  [250, 1143, 0.9],
  [516, 1160, 0.7],
  [882, 1142, 0.8],
];
const RUMPUT_TEPI = [
  [92, 1092],
  [455, 1110],
  [770, 1090],
  [940, 1098],
  [95, 1188],
  [250, 1192],
  [365, 1205],
  [500, 1208],
  [895, 1188],
];

function Batu({ x, y, s = 1, jenis = 0, lumut = false, basah = false }) {
  const [isi, terang, gelap, garis] = jenis ? ["#b3a387", "#d6c9ae", "#8f805f", "#6b5d43"] : ["#a9b0b2", "#d4d9da", "#879096", "#646c72"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {basah && <ellipse cx="0" cy="7" rx="24" ry="7" fill="#fff" opacity="0.55" />}
      <path d="M-18 7 C-21 -3 -12 -13 -2 -13 C9 -14 19 -7 18 4 C17 11 -15 13 -18 7Z" fill={isi} stroke={garis} strokeWidth="2.5" />
      <path d="M-16 6 C-8 10 8 10 16 5 C15 10 -12 12 -16 6Z" fill={gelap} />
      <path d="M-10 -6 C-7 -10 0 -11 4 -9" stroke={terang} strokeWidth="3" strokeLinecap="round" fill="none" />
      {lumut && <path d="M-6 -12 C-2 -15 6 -15 10 -11 C6 -9 -2 -9 -6 -12Z" fill="#5f9e4f" />}
      {basah && <path d="M-18 6 C-8 1 8 1 18 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />}
    </g>
  );
}

function Sungai() {
  return (
    <g>
      <defs>
        <clipPath id="klip-sungai">
          <path d={SUNGAI} />
        </clipPath>
        <filter id="lembut-sungai" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* tepi sungai: tanah & pasir basah */}
      <path d={SUNGAI} fill="#a7845a" stroke="#93724a" strokeWidth="24" strokeLinejoin="round" />
      <path d={SUNGAI} fill="none" stroke="#d8c08a" strokeWidth="12" strokeLinejoin="round" />
      {/* air */}
      <path d={SUNGAI} fill="#8ED6E8" />
      <g clipPath="url(#klip-sungai)">
        {/* alur dalam di tengah & air dangkal di tepi */}
        <path d={arus(6)} stroke="#5fb4d4" strokeWidth="40" fill="none" opacity="0.6" filter="url(#lembut-sungai)" />
        <path d={SUNGAI} fill="none" stroke="#cdf1f8" strokeWidth="12" opacity="0.75" />
        {/* arus halus memanjang */}
        {[
          [-12, "90 220", 7],
          [10, "60 260", 9],
          [24, "120 300", 11],
        ].map(([dy, dash, dur], i) => (
          <path key={i} d={arus(dy)} stroke="#e9fbff" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" strokeDasharray={dash}>
            <animate attributeName="stroke-dashoffset" from="0" to="-620" dur={`${dur}s`} repeatCount="indefinite" />
          </path>
        ))}
        {/* riak gelombang yang hanyut */}
        {RIAK.map(([dy, dur, mulai, sk], i) => (
          <g key={i} opacity="0">
            <path
              d={`M${-14 * sk} 0 q${5 * sk} ${-6 * sk} ${10 * sk} 0 q${5 * sk} ${-6 * sk} ${10 * sk} 0 q${4 * sk} ${-5 * sk} ${8 * sk} 0`}
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            <animateMotion dur={`${dur}s`} begin={`${mulai}s`} repeatCount="indefinite" rotate="auto" path={arus(dy)} />
            <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.85;1" dur={`${dur}s`} begin={`${mulai}s`} repeatCount="indefinite" />
          </g>
        ))}
        {/* kilau cahaya di permukaan */}
        {[
          [90, 1128],
          [340, 1160],
          [610, 1130],
          [960, 1122],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 6} L${x + 2} ${y} L${x} ${y + 6} L${x - 2} ${y}Z M${x - 6} ${y} L${x} ${y - 2} L${x + 6} ${y} L${x} ${y + 2}Z`}
            fill="#fff"
            className="twinkle"
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        ))}
      </g>
      {/* batu di dalam air + lingkaran riak */}
      {BATU_AIR.map(([x, y, sk], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 6} rx={26 * sk} ry={8 * sk} fill="none" stroke="#fff" strokeWidth="2" opacity="0">
            <animate attributeName="rx" values={`${20 * sk};${40 * sk}`} dur="2.6s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
            <animate attributeName="ry" values={`${6 * sk};${13 * sk}`} dur="2.6s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="2.6s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
          </ellipse>
          <path
            d={`M${x + 18 * sk} ${y + 4} q${10 * sk} -3 ${20 * sk} 2 M${x + 20 * sk} ${y + 10} q${12 * sk} -2 ${22 * sk} 3`}
            stroke="#fff"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
            strokeLinecap="round"
          />
          <Batu x={x} y={y} s={sk} jenis={i % 2} basah />
        </g>
      ))}
      {/* bebatuan & rumput di tepi sungai */}
      {BATU_TEPI.map(([x, y, sk, jenis, lumut], i) => (
        <Batu key={i} x={x} y={y} s={sk} jenis={jenis} lumut={lumut} />
      ))}
      {RUMPUT_TEPI.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} l-6 -12 M${x} ${y} l-1 -15 M${x} ${y} l5 -13 M${x} ${y} l9 -8`}
          stroke={i % 2 ? "#3f8a55" : "#4f9a5a"}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

/** Jembatan kayu: membentang lurus di atas titik jalur menyeberang (593,1102) → (724,1171), bertumpu di kedua tepi. */
function Jembatan() {
  const papan = [];
  for (let x = -96; x <= 96; x += 12) papan.push(x);
  const tiang = [-92, -31, 31, 92];
  return (
    <g>
      {/* bayangan jembatan di air */}
      <g transform="translate(661 1149) rotate(27.8)" opacity="0.22">
        <rect x="-90" y="-26" width="180" height="56" rx="8" fill="#1f5f78" />
      </g>
      <g transform="translate(658 1137) rotate(27.8)">
        {/* pangkal batu di kedua tepi */}
        {[-1, 1].map((sisi) => (
          <g key={sisi} transform={`translate(${sisi * 95} 0)`}>
            <ellipse cx="0" cy="0" rx="11" ry="36" fill="#9c8f78" stroke="#6b604e" strokeWidth="3" />
            {[-24, -8, 8, 24].map((y, k) => (
              <ellipse key={y} cx={(k % 2 ? 2 : -2) * sisi} cy={y} rx="8" ry="7" fill={k % 2 ? "#b8ab92" : "#a89a80"} stroke="#6b604e" strokeWidth="2" />
            ))}
          </g>
        ))}
        {/* balok penyangga */}
        <rect x="-102" y="-23" width="204" height="9" rx="4" fill="#5a3a28" />
        <rect x="-102" y="14" width="204" height="9" rx="4" fill="#5a3a28" />
        {/* papan lantai */}
        {papan.map((x, i) => (
          <g key={x}>
            <rect
              x={x - 5.5}
              y={-27 - (i % 3 === 1 ? 1 : 0)}
              width="11"
              height={54 + (i % 2)}
              rx="2"
              fill={i % 2 ? "#a06c48" : "#ad7a52"}
              stroke="#5a3a28"
              strokeWidth="1.6"
            />
            <path d={`M${x - 2} -18 v${10 + (i % 3) * 4} M${x + 2} 6 v${8 + (i % 2) * 5}`} stroke="#7d5236" strokeWidth="1" opacity="0.7" />
          </g>
        ))}
        {/* tali pegangan & tiang */}
        {[-31, 31].map((y) => {
          const d = `M-92 ${y} Q-61 ${y + Math.sign(y) * 4} -31 ${y} Q0 ${y + Math.sign(y) * 4} 31 ${y} Q61 ${y + Math.sign(y) * 4} 92 ${y}`;
          return (
            <g key={y}>
              <path d={d} stroke="#754B35" strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <path d={d} stroke="#e3c98f" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
              {tiang.map((x) => (
                <g key={x}>
                  <circle cx={x} cy={y} r="7" fill="#6b4228" stroke="#3e2718" strokeWidth="2.5" />
                  <circle cx={x - 1.5} cy={y - 1.5} r="2.6" fill="#a06c48" />
                </g>
              ))}
            </g>
          );
        })}
      </g>
      {/* buih kecil di kaki tiang tengah */}
      {[
        [714, 1129],
        [630, 1155],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 8} ${y} q4 -4 8 0 q4 -4 8 0`} stroke="#fff" strokeWidth="2" fill="none" opacity="0.75" strokeLinecap="round" />
      ))}
    </g>
  );
}

/** Ukuran Naru di peta (satuan peta). Tinggi = proporsi gambar bergelantungan (200 × 280). */
const NARU_W = 170;
const NARU_H = 238;
const BAWAH_PETA = 1600;

/**
 * Memilih posisi Naru yang TIDAK menutupi penanda wilayah mana pun (lingkaran nomor + bintang + papan nama),
 * sedekat mungkin dengan wilayah aktif. Pencarian menyeluruh pada kisi 10 satuan.
 */
function posisiNaru(id, markerScale, top) {
  const p = SPOTS[id];
  const s = markerScale * 1.05; // + ruang efek membesar saat disentuh
  // ukuran hasil pengukuran: lingkaran nomor ±44 (bintang hingga -70), papan nama ±110 × (54..90)
  const kotak = Object.values(SPOTS).map((q) => ({ l: q.x - 112 * s, r: q.x + 112 * s, t: q.y - 72 * s, b: q.y + 92 * s }));
  const bebas = (x, y) => kotak.every((k) => x + NARU_W <= k.l || x >= k.r || y + NARU_H <= k.t || y >= k.b);
  const ax = p.x + 140; // titik ideal: kanan-atas penanda
  const ay = p.y - 220;
  let terbaik = null;
  for (let y = top; y <= BAWAH_PETA - NARU_H; y += 10) {
    for (let x = 0; x <= 1000 - NARU_W; x += 10) {
      if (!bebas(x, y)) continue;
      const d = (x + NARU_W / 2 - ax) ** 2 + (y + NARU_H / 2 - ay) ** 2;
      if (!terbaik || d < terbaik.d) terbaik = { x, y, d };
    }
  }
  return terbaik ? { x: terbaik.x, y: terbaik.y } : { x: Math.min(p.x + 95, 1000 - NARU_W), y: Math.max(p.y - 300, top) };
}

export function AdventureMap({ statuses, onSelect, naruAt, preview, markerScale = 1 }) {
  const st = (id) => statuses?.[id] ?? (preview ? (id === 1 ? "new" : "locked") : "locked");
  const naru = naruAt ? SPOTS[naruAt] : null;
  const naruDiPeta = Boolean(naruAt) && markerScale === 1;
  const posisiNaruMemo = useMemo(() => (naruDiPeta ? posisiNaru(naruAt, markerScale, 70) : null), [naruDiPeta, naruAt, markerScale]);
  return (
    <svg
      viewBox={preview ? "0 80 1000 1460" : markerScale > 1 ? "0 -50 1000 1660" : "0 60 1000 1500"}
      className="block h-auto w-full bg-[#7fb685]"
      role={preview ? "img" : "group"}
      aria-label="Peta petualangan tujuh wilayah hutan eksponen"
    >
      <defs>
        <pattern id="grass" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#86bd7c" />
          <path d="M10 40 l3 -8 l3 8 M40 20 l3 -8 l3 8" stroke="#6aa463" strokeWidth="2" fill="none" />
        </pattern>
        <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6e6f4" />
          <stop offset="1" stopColor="#86bd7c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="-100" width="1000" height="1800" fill="url(#grass)" />
      <rect x="0" y="-100" width="1000" height="620" fill="url(#snow)" />
      <rect x="0" y="-100" width="1000" height="320" fill="#f3d9a4" opacity="0.45" />
      {/* gua & batu gelap area */}
      <ellipse cx="760" cy="760" rx="260" ry="150" fill="#6f6a8f" opacity="0.35" />
      {/* sungai melintas */}
      <Sungai />
      {/* air terjun dekat gunung */}
      <rect x="880" y="470" width="40" height="190" rx="18" fill="#bfeaf3" />
      <rect x="880" y="470" width="40" height="190" rx="18" fill="#fff" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* pepohonan dekoratif */}
      {[
        [80, 1260],
        [920, 1420],
        [70, 860],
        [930, 980],
        [560, 1440],
        [110, 360],
        [900, 220],
        [560, 560],
        [140, 140],
        [620, 960],
        [480, 1300],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-6" y="0" width="12" height="34" fill="#6b4228" />
          <circle cx="0" cy="-8" r="34" fill={i % 2 ? "#2f7a46" : "#3f8a55"} />
          <circle cx="-18" cy="6" r="20" fill="#3f8a55" />
          <circle cx="16" cy="4" r="22" fill="#2f7a46" />
        </g>
      ))}
      {[
        [180, 1330],
        [860, 1060],
        [420, 720],
        [640, 1350],
      ].map(([x, y], i) => (
        <g key={`m${i}`} transform={`translate(${x} ${y})`}>
          <rect x="-4" y="0" width="8" height="12" fill="#f6e7c8" />
          <path d="M-14 2 Q-12 -14 0 -14 Q12 -14 14 2 Z" fill={i % 2 ? "#e57f9a" : "#F39B57"} />
        </g>
      ))}
      {/* jalur jejak */}
      <path d={TRAIL} stroke="#c9a96a" strokeWidth="34" fill="none" strokeLinecap="round" />
      <path d={TRAIL} stroke="#e3c98f" strokeWidth="24" fill="none" strokeLinecap="round" />
      <path d={TRAIL} stroke="#754B35" strokeWidth="7" fill="none" strokeDasharray="2 26" strokeLinecap="round" opacity="0.55" />
      {/* jembatan kayu di atas sungai (tepat di titik jalur menyeberang) */}
      <Jembatan />
      {REGIONS.map((r) => (
        <Marker key={r.id} id={r.id} status={st(r.id)} onClick={onSelect ? () => onSelect(r.id) : undefined} preview={preview} scale={markerScale} />
      ))}
      {/* peti harta di akhir jalur */}
      <g transform="translate(560 70)">
        <rect x="-26" y="-8" width="52" height="30" rx="5" fill="#8a5a3c" stroke="#5a3a28" strokeWidth="3" />
        <path d="M-26 -6 Q-26 -26 0 -26 Q26 -26 26 -6 Z" fill="#a06c48" stroke="#5a3a28" strokeWidth="3" />
        <rect x="-6" y="-4" width="12" height="12" fill="#e0b43c" />
      </g>
      {naru && posisiNaruMemo && (
        <foreignObject {...posisiNaruMemo} width={NARU_W} height={NARU_H} style={{ pointerEvents: "none" }}>
          <div style={{ width: 210 }}>
            <Naru pose="hang" width={210} title="Naru menunggumu di sini" />
          </div>
        </foreignObject>
      )}
      {preview && (
        <foreignObject x="380" y="1300" width="220" height="250" style={{ pointerEvents: "none" }}>
          <div style={{ width: 210 }}>
            <Naru pose="point" width={200} />
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
