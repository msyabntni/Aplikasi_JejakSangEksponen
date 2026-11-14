import { BADGES, type BadgeDef } from "@/lib/gamification";

const GLYPH: Record<BadgeDef["icon"], React.ReactNode> = {
  footprint: (
    <g fill="#fff">
      <ellipse cx="26" cy="36" rx="5" ry="7" />
      <circle cx="23" cy="26" r="2" /><circle cx="27" cy="25" r="2" /><circle cx="30.5" cy="27" r="1.8" />
      <ellipse cx="38" cy="28" rx="4" ry="6" opacity="0.8" />
    </g>
  ),
  times: <path d="M22 22 L42 42 M42 22 L22 42" stroke="#fff" strokeWidth="6" strokeLinecap="round" />,
  divide: (
    <g fill="#fff">
      <rect x="20" y="29" width="24" height="6" rx="3" />
      <circle cx="32" cy="21" r="4" />
      <circle cx="32" cy="43" r="4" />
    </g>
  ),
  cave: <path d="M16 44 Q16 20 32 20 Q48 20 48 44 Z M26 44 Q26 32 32 32 Q38 32 38 44Z" fill="#fff" fillRule="evenodd" />,
  zero: <text x="32" y="44" textAnchor="middle" fontSize="28" fontWeight="900" fill="#754B35">a⁰</text>,
  mountain: <path d="M14 44 L28 22 L34 30 L40 24 L50 44 Z M26 26 L28 22 L31 26 Z" fill="#fff" />,
  crown: <path d="M16 42 L18 24 L26 32 L32 20 L38 32 L46 24 L48 42 Z" fill="#fff" />,
  flask: <path d="M28 18 H36 V28 L46 44 Q46 46 44 46 H20 Q18 46 18 44 L28 28 Z" fill="#fff" />,
  gamepad: (
    <g fill="#fff">
      <rect x="14" y="24" width="36" height="18" rx="9" />
      <rect x="21" y="31" width="9" height="3" fill="#e57f9a" />
      <rect x="24" y="28" width="3" height="9" fill="#e57f9a" />
      <circle cx="40" cy="31" r="2" fill="#e57f9a" />
      <circle cx="44" cy="35" r="2" fill="#e57f9a" />
    </g>
  ),
};

/** Lencana berbentuk medali kayu + pita. Abu-abu bila belum diperoleh. */
export function BadgeIcon({ id, size = 64, locked }: { id: string; size?: number; locked?: boolean }) {
  const b = BADGES.find((x) => x.id === id);
  if (!b) return null;
  return (
    <svg viewBox="0 0 64 76" width={size} height={(size * 76) / 64} style={locked ? { filter: "grayscale(1)", opacity: 0.4 } : undefined} role="img" aria-label={`Lencana ${b.name}${locked ? " (belum diperoleh)" : ""}`}>
      <path d="M20 52 L14 74 L24 68 L30 76 L32 56 Z" fill="#d9534f" />
      <path d="M44 52 L50 74 L40 68 L34 76 L32 56 Z" fill="#c9414b" />
      <circle cx="32" cy="32" r="29" fill="#754B35" />
      <circle cx="32" cy="32" r="25" fill={b.color} />
      <circle cx="32" cy="32" r="25" fill="url(#shine)" />
      <defs>
        <radialGradient id="shine" cx="0.3" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {GLYPH[b.icon]}
    </svg>
  );
}
