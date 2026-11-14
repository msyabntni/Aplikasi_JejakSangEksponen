import { Fragment } from "react";

/**
 * Merender notasi pangkat: "2^{3}", "a^{m+n}", "2^3", "(−2)^{5}" menjadi superskrip.
 * Teks lain ditampilkan apa adanya.
 */
export function MathText({ text, className = "" }: { text: string; className?: string }) {
  const parts: (string | { sup: string })[] = [];
  const re = /\^(\{([^}]*)\}|(−|-)?[0-9a-zA-Z]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const sup = m[2] !== undefined ? m[2] : m[1];
    parts.push({ sup: sup.replace(/-/g, "−") });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <span className={`sup-math ${className}`}>
      {parts.map((p, i) => (typeof p === "string" ? <Fragment key={i}>{p}</Fragment> : <sup key={i}>{p.sup}</sup>))}
    </span>
  );
}

/** Rumus besar bergaya papan, mis. untuk rumus utama. */
export function FormulaBoard({ expr, caption, className = "" }: { expr: string; caption?: string; className?: string }) {
  return (
    <div className={`relative rounded-2xl border-4 border-earth bg-[#2f5e44] px-4 py-5 text-center shadow-[0_6px_0_#3e2718] ${className}`}>
      <span className="absolute -top-3 left-6 h-5 w-2 rounded bg-earth" aria-hidden />
      <span className="absolute -top-3 right-6 h-5 w-2 rounded bg-earth" aria-hidden />
      <div className="font-display text-3xl font-extrabold text-[#fff7e0] sm:text-4xl">
        <MathText text={expr} />
      </div>
      {caption && <p className="mt-2 text-sm text-lime">{caption}</p>}
    </div>
  );
}

const SUPMAP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "−": "⁻", "-": "⁻", m: "ᵐ", n: "ⁿ", p: "ᵖ", "×": "ˣ", x: "ˣ",
};

/** Mengubah notasi ^{..} menjadi karakter superskrip Unicode (untuk teks SVG). */
export function toUnicodeSup(text: string): string {
  return text.replace(/\^\{([^}]*)\}|\^(-?\w+)/g, (_, a: string | undefined, b: string | undefined) =>
    [...(a ?? b ?? "")].map((c) => SUPMAP[c] ?? c).join(""),
  );
}
