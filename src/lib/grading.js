import { parseRational, rationalEquals } from "./math/exponent";

const SUP = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁻": "-",
  "⁺": "+",
  ᵐ: "m",
  ⁿ: "n",
};

/**
 * Normalisasi jawaban isian teks agar variasi penulisan yang setara diterima:
 * spasi, ×/x/*, ·/., superscript vs ^, kurung kurawal, tanda minus unicode, ":"/÷.
 */
export function normalizeText(raw) {
  let s = raw.trim().toLowerCase();
  // superscript -> ^...
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵐⁿ]+/g, (m) => "^" + [...m].map((c) => SUP[c] ?? c).join(""));
  s = s.replace(/[−–—]/g, "-");
  s = s.replace(/\s*pangkat\s*/g, "^");
  s = s.replace(/\s+/g, "");
  s = s.replace(/[×x*·•]/g, "*");
  // titik di antara angka sebagai tanda kali (4.4.4) – hanya bila bukan desimal tunggal
  if (/^\d+(\.\d+){2,}$/.test(s)) s = s.replace(/\./g, "*");
  s = s.replace(/[÷:]/g, "/");
  // ^{3} atau ^(3) -> ^3
  s = s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/\^\((-?\w+)\)/g, "^$1");
  return s;
}

export function isAnswered(q, a) {
  if (a === undefined || a === null) return false;
  if (q.kind === "short") return typeof a === "string" && a.trim() !== "";
  if (q.kind === "match") return typeof a === "object" && Object.keys(a).length === q.pairs.length;
  return true;
}

export function gradeAnswer(q, a) {
  if (!isAnswered(q, a)) return false;
  switch (q.kind) {
    case "mcq":
      return a === q.answer;
    case "findError":
      return a === q.wrongStep;
    case "tf":
      return a === q.answer;
    case "identify":
      return a === q.target;
    case "match": {
      const m = a;
      return q.pairs.every((_, i) => m[i] === i);
    }
    case "short": {
      const s = String(a);
      if (q.mode === "value") {
        const got = parseRational(s);
        if (!got) return false;
        return q.accept.some((acc) => {
          const exp = parseRational(acc);
          return exp !== null && rationalEquals(exp, got);
        });
      }
      const n = normalizeText(s);
      return q.accept.some((acc) => normalizeText(acc) === n);
    }
  }
}

export function gradeAll(questions, answers) {
  const perQuestion = questions.map((q) => gradeAnswer(q, answers[q.id]));
  const correct = perQuestion.filter(Boolean).length;
  const total = questions.length;
  return {
    correct,
    wrong: total - correct,
    total,
    score: total === 0 ? 0 : Math.round((correct / total) * 100),
    perQuestion,
  };
}

/** Teks jawaban benar untuk ditampilkan di pembahasan. */
export function correctAnswerText(q) {
  switch (q.kind) {
    case "mcq":
      return `${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}`;
    case "tf":
      return q.answer ? "Benar" : "Salah";
    case "short":
      return q.accept[0];
    case "identify":
      return q.target === "base" ? `Basis: ${q.base}` : `Pangkat: ${q.exp}`;
    case "findError":
      return `Langkah ${q.wrongStep + 1}`;
    case "match":
      return q.pairs.map(([l, r]) => `${l} ↔ ${r}`).join("; ");
  }
}
