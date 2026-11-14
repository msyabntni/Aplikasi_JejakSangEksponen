/** Avatar bertema hutan (bukan maskot). */
export const AVATARS = [
  { id: "daun", name: "Daun Monstera", bg: "#62A66B" },
  { id: "kompas", name: "Kompas", bg: "#F4D77A" },
  { id: "jamur", name: "Jamur Ajaib", bg: "#F39B57" },
  { id: "permata", name: "Permata", bg: "#8ED6E8" },
  { id: "kupu", name: "Kupu-kupu", bg: "#e8a0ac" },
  { id: "bunga", name: "Bunga Rafflesia", bg: "#e07a5f" },
  { id: "kristal", name: "Kristal Gua", bg: "#b7a3f0" },
  { id: "gunung", name: "Gunung", bg: "#94a5b9" },
];

export function Avatar({ id, size = 64 }: { id: string; size?: number }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={`Avatar ${a.name}`}>
      <circle cx="32" cy="32" r="31" fill={a.bg} stroke="#754B35" strokeWidth="2" />
      {a.id === "daun" && <g><path d="M32 54 C14 46 12 22 32 10 C52 22 50 46 32 54Z" fill="#246B45" /><path d="M32 52 V14" stroke="#B7D98A" strokeWidth="2" /><path d="M32 28 L22 22 M32 36 L42 30 M32 44 L22 38" stroke="#B7D98A" strokeWidth="2" /></g>}
      {a.id === "kompas" && <g><circle cx="32" cy="32" r="18" fill="#fbf3dc" stroke="#754B35" strokeWidth="3" /><path d="M32 16 L36 32 L32 34 L28 32Z" fill="#d9534f" /><path d="M32 48 L36 32 L32 30 L28 32Z" fill="#246B45" /></g>}
      {a.id === "jamur" && <g><rect x="27" y="32" width="10" height="18" rx="4" fill="#fbf3dc" /><path d="M12 34 Q14 12 32 12 Q50 12 52 34Z" fill="#d9534f" /><circle cx="24" cy="22" r="3.5" fill="#fff" /><circle cx="38" cy="20" r="3" fill="#fff" /><circle cx="44" cy="28" r="2.5" fill="#fff" /></g>}
      {a.id === "permata" && <g><path d="M18 22 H46 L54 32 L32 54 L10 32Z" fill="#2fa6a0" /><path d="M10 32 H54 M24 22 L32 32 L40 22 M32 32 V54" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" /></g>}
      {a.id === "kupu" && <g><path d="M32 32 C18 10 6 18 12 30 C16 38 26 36 32 32Z M32 32 C46 10 58 18 52 30 C48 38 38 36 32 32Z" fill="#F39B57" /><path d="M32 32 C22 40 16 52 24 50 C28 48 30 40 32 32Z M32 32 C42 40 48 52 40 50 C36 48 34 40 32 32Z" fill="#F4D77A" /><rect x="30.5" y="22" width="3" height="22" rx="1.5" fill="#3B2416" /></g>}
      {a.id === "bunga" && <g>{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="32" cy="18" rx="9" ry="12" fill="#b6413a" transform={`rotate(${r} 32 32)`} />)}<circle cx="32" cy="32" r="9" fill="#F4D77A" /><circle cx="29" cy="30" r="1.5" fill="#fff" /><circle cx="35" cy="34" r="1.5" fill="#fff" /></g>}
      {a.id === "kristal" && <g><path d="M22 50 L26 22 L32 14 L38 22 L42 50Z" fill="#7b63c4" /><path d="M14 50 L18 34 L24 50Z M40 50 L46 30 L50 50Z" fill="#9b7fd1" /><path d="M32 14 V50" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" /></g>}
      {a.id === "gunung" && <g><path d="M8 50 L26 18 L44 50Z" fill="#5f6f85" /><path d="M26 18 L20 30 L26 27 L32 30Z" fill="#fff" /><path d="M30 50 L44 28 L58 50Z" fill="#7d8ea3" /></g>}
    </svg>
  );
}
