/** Ilustrasi kecil untuk soal cerita & contoh penerapan. */

export function SceneArt({ scene, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border-2 border-[#d9c08f] bg-[#f4f8e8] ${className}`}>
      <svg viewBox="0 0 320 110" className="block h-24 w-full sm:h-28" role="img" aria-label={`Ilustrasi ${scene}`}>
        {scene === "bacteria" && (
          <g>
            {[1, 2, 4, 8].map((n, col) => (
              <g key={n} transform={`translate(${30 + col * 80} 18)`}>
                {Array.from({ length: n }, (_, i) => (
                  <ellipse key={i} cx={(i % 4) * 14} cy={Math.floor(i / 4) * 22 + 20} rx="7" ry="10" fill="#9fd39b" stroke="#2f6d35" strokeWidth="2" />
                ))}
                <text x="20" y="90" textAnchor="middle" fontSize="13" fontWeight="800" fill="#754B35">
                  jam {col}
                </text>
              </g>
            ))}
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${82 + i * 80} 50 l14 0 m-5 -5 l5 5 l-5 5`} stroke="#F39B57" strokeWidth="3" fill="none" />
            ))}
          </g>
        )}
        {scene === "box" && (
          <g>
            <rect x="40" y="14" width="240" height="84" fill="#a06c48" stroke="#5a3a28" strokeWidth="4" rx="4" />
            {[0, 1].map((row) =>
              [0, 1, 2, 3].map((c) => (
                <g key={`${row}${c}`} transform={`translate(${56 + c * 56} ${22 + row * 38})`}>
                  <rect width="44" height="30" rx="3" fill="#F4D77A" stroke="#a57b1f" strokeWidth="2" />
                  {[0, 1, 2, 3].map((b) => (
                    <circle key={b} cx={9 + (b % 2) * 24} cy={9 + Math.floor(b / 2) * 12} r="5" fill={b % 2 ? "#e57f9a" : "#8ED6E8"} />
                  ))}
                </g>
              )),
            )}
          </g>
        )}
        {(scene === "mango" || scene === "fruit") && (
          <g>
            {Array.from({ length: scene === "mango" ? 9 : 6 }, (_, i) => (
              <g key={i} transform={`translate(${24 + i * (scene === "mango" ? 32 : 48)} 40)`}>
                {scene === "mango" ? (
                  <g>
                    <path d="M0 40 L4 70 H24 L28 40 Z" fill="#a06c48" />
                    <ellipse cx="10" cy="34" rx="8" ry="10" fill="#F39B57" />
                    <ellipse cx="18" cy="32" rx="8" ry="10" fill="#F4D77A" />
                  </g>
                ) : (
                  <g>
                    <rect x="12" y="20" width="8" height="40" fill="#754B35" />
                    <circle cx="16" cy="12" r="22" fill="#3f8a55" />
                    <circle cx="8" cy="10" r="4" fill="#e57f9a" />
                    <circle cx="22" cy="16" r="4" fill="#e57f9a" />
                    <circle cx="16" cy="2" r="4" fill="#e57f9a" />
                  </g>
                )}
              </g>
            ))}
          </g>
        )}
        {scene === "garden" && (
          <g>
            <rect x="110" y="8" width="94" height="94" fill="#86bd7c" stroke="#3f8a55" strokeWidth="4" />
            {Array.from({ length: 16 }, (_, i) => (
              <circle key={i} cx={122 + (i % 4) * 23} cy={20 + Math.floor(i / 4) * 23} r="5" fill={i % 3 ? "#F4D77A" : "#e57f9a"} />
            ))}
            <text x="157" y="108" textAnchor="middle" fontSize="12" fontWeight="800" fill="#754B35">
              sisi 2³ m
            </text>
            <text x="230" y="58" fontSize="12" fontWeight="800" fill="#754B35">
              sisi 2³ m
            </text>
          </g>
        )}
        {scene === "ruler" && (
          <g>
            <rect x="20" y="40" width="280" height="40" rx="4" fill="#F4D77A" stroke="#a57b1f" strokeWidth="3" />
            {Array.from({ length: 29 }, (_, i) => (
              <line key={i} x1={30 + i * 9.6} y1="40" x2={30 + i * 9.6} y2={i % 5 === 0 ? 62 : 52} stroke="#754B35" strokeWidth="2" />
            ))}
            <circle cx="40" cy="26" r="4" fill="#d9534f" />
            <text x="52" y="30" fontSize="13" fontWeight="800" fill="#754B35">
              1 mm = 10⁻³ m
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
