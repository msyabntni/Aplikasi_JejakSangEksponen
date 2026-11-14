import { formatRational, powExact, powText as P, rationalEquals, repeatedProduct } from "@/lib/math/exponent";

import { QUESTION_BANK, shuffle } from "./questionBank";

export const GAMES = [
  {
    id: "power-match",
    title: "Power Match",
    tagline: "Cocokkan perkalian berulang dengan bentuk pangkatnya.",
    mechanic: "Ketuk dua kartu",
    rules: [
      "Ada 12 kartu: 6 kartu perkalian berulang dan 6 kartu bentuk pangkat.",
      "Ketuk satu kartu, lalu ketuk kartu pasangannya.",
      "Pasangan tepat: +10 poin dan kartu terkunci.",
      "Pasangan salah: Kaciro menjelaskan kenapa belum cocok.",
      "Selesai saat semua pasangan ditemukan.",
    ],
    color: "#F39B57",
    scene: "Lembah Kartu",
  },
  {
    id: "jungle-bridge",
    title: "Jungle Bridge",
    tagline: "Bangun jembatan papan demi papan dengan jawaban benar.",
    mechanic: "Jawab untuk membangun",
    rules: [
      "Jembatan butuh 6 papan.",
      "Setiap jawaban benar memasang satu papan (+15 poin).",
      "Jawaban salah membuat papan bergoyang. Kaciro memberi petunjuk dan kamu boleh mencoba lagi (+5 poin bila benar setelahnya).",
      "Saat jembatan utuh, Naru menyeberang!",
    ],
    color: "#754B35",
    scene: "Jurang Sungai",
  },
  {
    id: "exponent-puzzle",
    title: "Exponent Puzzle",
    tagline: "Susun potongan menjadi persamaan pangkat yang benar.",
    mechanic: "Ketuk potongan ke slot",
    rules: [
      "Setiap teka-teki punya slot kosong pada persamaan.",
      "Ketuk potongan angka, lalu ketuk slot untuk menaruhnya (atau ketuk potongan saja untuk mengisi slot kosong pertama).",
      "Ketuk slot yang sudah terisi untuk mengosongkannya.",
      "Tekan PERIKSA. Persamaan diperiksa otomatis; susunan lain yang tetap benar juga diterima!",
      "Ada 6 teka-teki dan 2 kesempatan memeriksa tiap teka-teki. Menang jika minimal 4 terpecahkan.",
    ],
    color: "#62A66B",
    scene: "Batu Bertulis",
  },
  {
    id: "mystery-chest",
    title: "Mystery Chest",
    tagline: "Pecahkan kode peti dari hasil perpangkatan.",
    mechanic: "Roda angka",
    rules: [
      "Ada 4 peti. Setiap peti punya petunjuk perpangkatan.",
      "Hitung hasilnya, lalu putar roda angka menjadi kode tersebut.",
      "Setiap peti hanya bisa dicoba 3 kali.",
      "Peti terbuka memberi permata (+25 poin).",
    ],
    color: "#e0b43c",
    scene: "Ruang Harta",
  },
  {
    id: "wrong-or-right",
    title: "Wrong or Right?",
    tagline: "Periksa penyelesaian langkah demi langkah.",
    mechanic: "Detektif langkah",
    rules: [
      "Kamu melihat penyelesaian soal langkah demi langkah.",
      "Tentukan: penyelesaiannya BENAR atau SALAH?",
      "Jika SALAH, pilih langkah yang keliru.",
      "Kaciro lalu menjelaskan langkah yang benar.",
      "6 kasus, +15 poin untuk setiap analisis tepat.",
    ],
    color: "#8ED6E8",
    scene: "Pos Detektif",
  },
  {
    id: "rescue-naru",
    title: "Rescue Naru",
    tagline: "Bantu Naru melewati lumpur, sungai, dan tebing!",
    mechanic: "Petualangan berenergi",
    rules: [
      "Naru terjebak di hutan dan harus melewati 6 rintangan.",
      "Jawaban benar membuat Naru maju melewati rintangan (+15 poin).",
      "Jawaban salah mengurangi 1 energi. Energimu 3.",
      "Jika energi habis, Naru beristirahat dan kamu bisa mencoba lagi.",
    ],
    color: "#e57f9a",
    scene: "Jalur Rintangan",
  },
];

export const getGame = (id) => GAMES.find((g) => g.id === id);

// ───────────── Power Match ─────────────
export function powerMatchPairs() {
  const bases = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6);
  return bases.map((b, i) => {
    const e = 2 + Math.floor(Math.random() * 4);
    return { id: i, repeat: repeatedProduct(b, e), power: P(b, e) };
  });
}

// ───────────── Jungle Bridge & Rescue Naru ─────────────
export function quickQuestions(n, levels) {
  const pool = QUESTION_BANK.filter((q) => levels.includes(q.level) && (q.kind === "mcq" || q.kind === "tf"));
  return shuffle(pool).slice(0, n);
}

export const OBSTACLES = [
  { id: "lumpur", name: "Kubangan Lumpur", desc: "Naru harus melompati lumpur lengket!" },
  { id: "sungai", name: "Sungai Deras", desc: "Batu pijakan muncul jika jawabanmu tepat." },
  { id: "akar", name: "Akar Berduri", desc: "Akar berduri menghalangi jalan." },
  { id: "tebing", name: "Tebing Curam", desc: "Naru perlu sulur untuk memanjat tebing." },
  { id: "gua", name: "Gua Gelap", desc: "Kristal menyala kalau jawabanmu benar." },
  { id: "jembatan", name: "Jembatan Gantung", desc: "Satu langkah lagi menuju camp!" },
];

// ───────────── Exponent Puzzle ─────────────

export function makePuzzles(n = 6) {
  const out = [];
  const ops = ["×", ":", "pow", "×", ":", "pow"];
  for (let i = 0; i < n; i++) {
    const op = ops[i % ops.length];
    const a = [2, 3, 5, 7][Math.floor(Math.random() * 4)];
    let m = 2 + Math.floor(Math.random() * 5);
    const k = 2 + Math.floor(Math.random() * 3);
    let res;
    if (op === "×") res = m + k;
    else if (op === ":") {
      m = k + 1 + Math.floor(Math.random() * 4);
      res = m - k;
    } else res = m * k;
    // pow: (a^m)^k = a^res  -> slot b2 tidak dipakai (diisi -1)
    const values = op === "pow" ? [a, m, -1, k, a, res] : [a, m, a, k, a, res];
    // slot pangkat: 1, 3, 5. Teka-teki awal: 2 slot kosong; berikutnya: 3 slot kosong.
    const uniqBlanks = (i < 3 ? shuffle([1, 3, 5]).slice(0, 2) : [1, 3, 5]).sort((x, y) => x - y);
    const correct = uniqBlanks.map((b) => values[b]);
    const decoys = new Set();
    for (const c of correct) {
      [c + 1, c - 1, op === "×" ? m * k : m + k, op === ":" ? Math.floor(m / k) || 1 : c + 2].forEach((d) => d > 0 && decoys.add(d));
    }
    correct.forEach((c) => decoys.delete(c));
    const pieces = shuffle([...correct, ...shuffle([...decoys]).slice(0, 3)]);
    out.push({ op, values, blanks: uniqBlanks, pieces });
  }
  return out;
}

/** Memeriksa apakah persamaan terisi bernilai benar (bukan sekadar sama dengan kunci). */
export function checkPuzzle(p, filled) {
  const [b1, e1, b2, e2, b3, e3] = filled;
  const lhsText = p.op === "pow" ? `(${P(b1, e1)})^{${e2}}` : `${P(b1, e1)} ${p.op} ${P(b2, e2)}`;
  const rhsText = P(b3, e3);
  let lhs;
  if (p.op === "pow") lhs = powExact(b1, e1 * e2, 10n ** 30n);
  else {
    const x = powExact(b1, e1, 10n ** 30n);
    const y = powExact(b2, e2, 10n ** 30n);
    if (!x.ok || !y.ok) return { ok: false, explain: "Angkanya terlalu besar." };
    lhs = {
      ok: true,
      value:
        p.op === "×" ? { num: x.value.num * y.value.num, den: x.value.den * y.value.den } : { num: x.value.num * y.value.den, den: x.value.den * y.value.num },
    };
  }
  const rhs = powExact(b3, e3, 10n ** 30n);
  if (!lhs.ok || !rhs.ok) return { ok: false, explain: "Angkanya terlalu besar." };
  const ok = rationalEquals(lhs.value, rhs.value);
  const rule =
    p.op === "×"
      ? "Perkalian basis sama: pangkat dijumlahkan."
      : p.op === ":"
        ? "Pembagian basis sama: pangkat dikurangkan."
        : "Pangkat dari pangkat: pangkat dikalikan.";
  return {
    ok,
    explain: ok ? `${lhsText} = ${rhsText} ✓ ${rule}` : `${lhsText} tidak sama dengan ${rhsText}. ${rule}`,
  };
}

// ───────────── Mystery Chest ─────────────
export const CHEST_CLUES = [
  { clue: P(2, 5), code: 32 },
  { clue: P(3, 4), code: 81 },
  { clue: P(5, 3), code: 125 },
  { clue: `(${P(2, 3)})^{2}`, code: 64 },
  { clue: `${P(7, 2)} × ${P(7, 0)}`, code: 49 },
  { clue: `${P(10, 5)} : ${P(10, 3)}`, code: 100 },
  { clue: `${P(2, 3)} × ${P(2, 4)}`, code: 128 },
  { clue: `${P(6, 2)} × ${P(6, 1)}`, code: 216 },
  { clue: `${P(3, 7)} : ${P(3, 4)}`, code: 27 },
  { clue: `(${P(3, 2)})^{2} × ${P(3, -1)}`, code: 27 },
  { clue: P(4, 3), code: 64 },
  { clue: `${P(2, 10)} : ${P(2, 2)}`, code: 256 },
];
export function chestRound(n = 4) {
  return shuffle(CHEST_CLUES).slice(0, n);
}

// ───────────── Wrong or Right ─────────────
export const WORKED_CASES = [
  {
    problem: `${P(2, 3)} × ${P(2, 4)}`,
    steps: [`= ${P(2, "3+4")}`, `= ${P(2, 7)}`, "= 128"],
    wrong: -1,
    fix: "Semua langkah benar. Pangkat dijumlahkan karena basis sama.",
  },
  {
    problem: `${P(3, 2)} × ${P(3, 3)}`,
    steps: [`= ${P(3, "2×3")}`, `= ${P(3, 6)}`, "= 729"],
    wrong: 0,
    fix: `Langkah 1 keliru: pangkat dijumlahkan, ${P(3, "2+3")} = ${P(3, 5)} = 243.`,
  },
  {
    problem: `${P(5, 6)} : ${P(5, 2)}`,
    steps: [`= ${P(5, "6−2")}`, `= ${P(5, 4)}`, "= 625"],
    wrong: -1,
    fix: "Semua langkah benar. Pangkat dikurangkan pada pembagian basis sama.",
  },
  {
    problem: `${P(4, 8)} : ${P(4, 2)}`,
    steps: [`= ${P(4, "8:2")}`, `= ${P(4, 4)}`, "= 256"],
    wrong: 0,
    fix: `Langkah 1 keliru: pangkat dikurangkan, ${P(4, "8−2")} = ${P(4, 6)}.`,
  },
  { problem: `(${P(2, 3)})^{2}`, steps: [`= ${P(2, "3×2")}`, `= ${P(2, 6)}`, "= 32"], wrong: 2, fix: `Langkah 3 keliru: ${P(2, 6)} = 64, bukan 32.` },
  {
    problem: `(${P(3, 2)})^{4}`,
    steps: [`= ${P(3, "2+4")}`, `= ${P(3, 6)}`],
    wrong: 0,
    fix: `Langkah 1 keliru: pangkat dikalikan, ${P(3, "2×4")} = ${P(3, 8)}.`,
  },
  { problem: P(9, 0), steps: ["Pangkat nol artinya tidak ada faktor", "= 0"], wrong: 1, fix: `Langkah 2 keliru: ${P(9, 0)} = 1 (a⁰ = 1 untuk a ≠ 0).` },
  { problem: P(2, -4), steps: [`= 1/${P(2, 4)}`, "= 1/16"], wrong: -1, fix: "Semua langkah benar. Pangkat negatif berarti kebalikan." },
  { problem: P(3, -2), steps: [`= −${P(3, 2)}`, "= −9"], wrong: 0, fix: `Langkah 1 keliru: ${P(3, -2)} = 1/${P(3, 2)} = 1/9.` },
  {
    problem: `${P(2, 5)} × ${P(2, 2)} : ${P(2, 4)}`,
    steps: [`= ${P(2, "5+2−4")}`, `= ${P(2, 3)}`, "= 8"],
    wrong: -1,
    fix: "Semua langkah benar. Jumlahkan untuk kali, kurangkan untuk bagi.",
  },
  { problem: `${P(6, 3)} × ${P(6, -3)}`, steps: [`= ${P(6, "3+(−3)")}`, `= ${P(6, 0)}`, "= 6"], wrong: 2, fix: `Langkah 3 keliru: ${P(6, 0)} = 1.` },
  {
    problem: `${P(2, 3)} × ${P(3, 2)}`,
    steps: [`= ${P(6, "3+2")}`, `= ${P(6, 5)}`],
    wrong: 0,
    fix: `Langkah 1 keliru: basisnya berbeda, jadi tidak bisa digabung. ${P(2, 3)} × ${P(3, 2)} = 8 × 9 = 72.`,
  },
];

export function caseRound(n = 6) {
  return shuffle(WORKED_CASES).slice(0, n);
}

export { formatRational };
