/** Ilustrasi lingkungan khas setiap wilayah (komposisi berbeda-beda). */

function Tree({ x, y, s = 1, c = "#3f8a55" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-7" y="-10" width="14" height="50" fill="#6b4228" />
      <circle cx="0" cy="-30" r="38" fill={c} />
      <circle cx="-26" cy="-12" r="24" fill={c} />
      <circle cx="26" cy="-14" r="26" fill={c} />
    </g>
  );
}

export function RegionScene({ region, className = "", compact }) {
  const { sky, sky2, ground, accent } = region.palette;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(180deg, ${sky}, ${sky2})` }}>
      <svg viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        {region.scene === "camp" && (
          <g>
            <Tree x={70} y={180} s={1.3} />
            <Tree x={720} y={170} s={1.4} c="#2f7a46" />
            <rect y="200" width="800" height="60" fill={ground} />
            <path d="M300 210 L360 120 L420 210 Z" fill={accent} stroke="#a3521c" strokeWidth="4" />
            <path d="M345 210 L360 170 L375 210Z" fill="#7a3b16" />
            <g transform="translate(520 200)">
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x={i * 26 - 50}
                  y={-14 - (i % 2) * 6}
                  width="60"
                  height="12"
                  rx="6"
                  fill="#8a5a3c"
                  stroke="#5a3a28"
                  strokeWidth="2"
                  transform={`rotate(${i * 8 - 12})`}
                />
              ))}
              <circle cx="20" cy="-30" r="10" fill="#F4D77A" className="twinkle" />
            </g>
          </g>
        )}
        {region.scene === "valley" && (
          <g>
            <path d="M0 200 Q160 60 320 200 Z" fill="#c9a06a" />
            <path d="M260 210 Q470 30 680 210 Z" fill="#b98a5a" />
            <path d="M560 210 Q700 90 820 210 Z" fill="#d4b07a" />
            <rect y="200" width="800" height="60" fill={ground} />
            {[
              [150, 200, 34],
              [260, 214, 26],
              [420, 206, 40],
              [600, 216, 30],
            ].map(([x, y, r], i) => (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#e8e4d6" stroke="#8a826b" strokeWidth="3" />
                <circle cx={x + r * 0.3} cy={y - r * 0.3} r="5" fill="#5fd0c4" className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
              </g>
            ))}
          </g>
        )}
        {region.scene === "river" && (
          <g>
            <Tree x={90} y={150} s={1.2} />
            <Tree x={700} y={140} s={1.3} c="#2f7a46" />
            <rect y="160" width="800" height="100" fill={ground} />
            <path d="M0 190 Q200 170 400 195 T800 185 L800 250 Q600 240 400 255 T0 245 Z" fill="#8ED6E8" />
            <path d="M0 210 Q200 190 400 215 T800 205" stroke="#fff" strokeWidth="4" strokeDasharray="18 26" fill="none" opacity="0.8">
              <animate attributeName="stroke-dashoffset" from="0" to="-88" dur="2.5s" repeatCount="indefinite" />
            </path>
            {[200, 300, 400, 500].map((x) => (
              <ellipse key={x} cx={x} cy={218} rx="24" ry="9" fill="#c9c2ad" stroke="#8a826b" strokeWidth="2" />
            ))}
          </g>
        )}
        {region.scene === "cave" && (
          <g>
            <rect width="800" height="260" fill="#2c2541" />
            <path d="M0 0 H800 V60 Q700 110 600 50 Q500 120 400 60 Q300 120 200 50 Q100 110 0 60Z" fill="#3b3357" />
            {[
              [90, 60],
              [230, 80],
              [380, 50],
              [520, 90],
              [680, 60],
            ].map(([x, h], i) => (
              <path key={i} d={`M${x - 14} 40 L${x} ${40 + h} L${x + 14} 40Z`} fill="#4a4070" />
            ))}
            <rect y="210" width="800" height="50" fill="#231c33" />
            {[
              [120, 210],
              [300, 214],
              [480, 208],
              [650, 212],
            ].map(([x, y], i) => (
              <g key={i} className="twinkle" style={{ animationDelay: `${i * 0.6}s` }}>
                <path d={`M${x - 12} ${y} L${x - 4} ${y - 44} L${x + 4} ${y}Z M${x} ${y} L${x + 10} ${y - 30} L${x + 18} ${y}Z`} fill={accent} />
              </g>
            ))}
            <path d="M330 210 Q330 120 400 115 Q470 120 470 210Z" fill="#120d1c" />
          </g>
        )}
        {region.scene === "tree" && (
          <g>
            <rect y="210" width="800" height="50" fill={ground} />
            <rect x="370" y="80" width="60" height="140" rx="12" fill="#6b4228" />
            <path d="M370 210 Q330 220 310 214 M430 210 Q470 220 490 214" stroke="#6b4228" strokeWidth="14" fill="none" strokeLinecap="round" />
            <circle cx="400" cy="70" r="110" fill="#4f8a4b" />
            <circle cx="300" cy="100" r="70" fill="#5a9a55" />
            <circle cx="500" cy="96" r="72" fill="#5a9a55" />
            {[
              [340, 60],
              [400, 30],
              [460, 64],
              [300, 110],
              [510, 112],
              [400, 100],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="14" fill="#F4D77A" className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill="#754B35">
                  {i % 2 ? "1" : "⁰"}
                </text>
              </g>
            ))}
            <Tree x={90} y={190} s={0.9} />
            <Tree x={720} y={190} s={0.9} c="#2f7a46" />
          </g>
        )}
        {region.scene === "mountain" && (
          <g>
            <path d="M-20 240 L240 30 L500 240 Z" fill="#7d8ea3" />
            <path d="M240 30 L196 92 L222 84 L246 100 L270 82 L290 70 Z" fill="#fff" />
            <path d="M340 240 L560 60 L820 240 Z" fill="#94a5b9" />
            <path d="M560 60 L528 100 L552 94 L574 108 L594 92Z" fill="#fff" />
            <rect y="220" width="800" height="40" fill="#a7b6c7" />
            <path d="M240 240 Q300 180 260 140 Q230 100 270 70" stroke="#c9a96a" strokeWidth="5" strokeDasharray="8 8" fill="none" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={60 + i * 140} cy={40 + (i % 3) * 20} r="3" fill="#fff" className="drift" style={{ animationDelay: `${i}s` }} />
            ))}
          </g>
        )}
        {region.scene === "temple" && (
          <g>
            <rect y="214" width="800" height="46" fill={ground} />
            <path d="M200 214 H600 V200 H220Z" fill="#c9a96a" />
            <rect x="250" y="110" width="300" height="100" fill="#c9a96a" stroke="#8a6a3d" strokeWidth="5" />
            <path d="M220 112 L400 30 L580 112 Z" fill={accent} stroke="#8a6a3d" strokeWidth="5" />
            {[285, 345, 455, 515].map((x) => (
              <rect key={x} x={x - 12} y="118" width="24" height="90" fill="#fbeccb" />
            ))}
            <rect x="370" y="160" width="60" height="48" rx="6" fill="#8a5a3c" stroke="#5a3a28" strokeWidth="4" />
            <rect x="392" y="170" width="16" height="16" fill="#F4D77A" />
            <circle cx="400" cy="74" r="14" fill="#5fd0c4" className="twinkle" />
            <Tree x={80} y={190} s={1.1} />
            <Tree x={720} y={190} s={1.1} c="#2f7a46" />
          </g>
        )}
      </svg>
      {!compact && <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent" />}
    </div>
  );
}
