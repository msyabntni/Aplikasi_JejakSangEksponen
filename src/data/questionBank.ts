/**
 * Bank soal latihan. Sebagian ditulis manual (konsep), sebagian dibangkitkan dari
 * templat dengan RNG ber-seed tetap, sehingga bank selalu sama dan kunci jawabannya
 * dihitung oleh kode (bukan diketik manual) agar pasti benar.
 */
import { formatRational, powExact, powText as P, repeatedProduct } from "@/lib/math/exponent";
import type { Difficulty, Question } from "@/lib/types";
import { findError, identify, match, mcq, short, tfq } from "./qb";

export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rng = () => number;
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
export function shuffle<T>(xs: T[], r: Rng = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const val = (b: number, e: number) => {
  const r = powExact(b, e);
  return r.ok ? formatRational(r.value) : "?";
};
const plainVal = (b: number, e: number) => val(b, e).replace(/\./g, "").replace("−", "-");

/** Menyusun opsi unik + mengacak, mengembalikan indeks jawaban. */
function options(r: Rng, correct: string, distractors: string[]) {
  const uniq = [correct, ...distractors.filter((d, i, arr) => d !== correct && arr.indexOf(d) === i)].slice(0, 4);
  const shuffled = shuffle(uniq, r);
  return { options: shuffled, answer: shuffled.indexOf(correct) };
}

let counter = 0;
const nid = (p: string) => `${p}-${++counter}`;

// ───────────────────────── templat level 1 ─────────────────────────
function genValue(r: Rng): Question {
  const b = pick(r, [2, 3, 4, 5, 10]);
  const e = b === 10 ? int(r, 2, 4) : b <= 3 ? int(r, 2, 5) : int(r, 2, 3);
  return short({
    id: nid("val"), level: 1, indicator: "pengertian", label: "Menentukan Hasil",
    prompt: `Berapa nilai ${P(b, e)}?`, accept: [plainVal(b, e)], mode: "value", placeholder: "angka",
    hint: `Kalikan ${b} sebanyak ${e} kali.`,
    explanation: [`${P(b, e)} = ${repeatedProduct(b, e)}`, `= ${val(b, e)}`],
  });
}

function genRepeatToPow(r: Rng): Question {
  const b = int(r, 2, 9);
  const e = int(r, 3, 6);
  const { options: o, answer } = options(r, P(b, e), [P(e, b), `${b} × ${e}`, `${b * e}`]);
  return mcq({
    id: nid("rep"), level: 1, indicator: "perkalian-berulang", label: "Mengubah Perkalian Berulang",
    prompt: `Bentuk pangkat dari ${repeatedProduct(b, e)} adalah …`, options: o, answer,
    hint: "Basis = bilangan yang dikalikan, pangkat = banyaknya faktor.",
    explanation: [`Bilangan yang dikalikan adalah ${b}, jadi basisnya ${b}.`, `Ada ${e} faktor, jadi pangkatnya ${e}.`, `${repeatedProduct(b, e)} = ${P(b, e)}`],
    optionFeedback: { [o.indexOf(P(e, b))]: "Basis dan pangkatnya tertukar.", [o.indexOf(`${b} × ${e}`)]: "Itu perkalian biasa, bukan perkalian berulang." },
  });
}

function genPowToRepeat(r: Rng): Question {
  const b = int(r, 2, 9);
  const e = int(r, 2, 5);
  return short({
    id: nid("rep2"), level: 1, indicator: "perkalian-berulang", label: "Mengubah ke Perkalian Berulang",
    prompt: `Tuliskan ${P(b, e)} sebagai perkalian berulang.`, accept: [repeatedProduct(b, e)], placeholder: "contoh: 3 × 3", keypad: ["×"],
    hint: `Tulis angka ${b} sebanyak ${e} kali, dipisah tanda ×.`,
    explanation: [`${P(b, e)} artinya ${b} dikalikan ${e} kali.`, `${P(b, e)} = ${repeatedProduct(b, e)}`],
  });
}

function genIdentify(r: Rng): Question {
  const b = pick(r, ["3", "6", "8", "11", "(−2)", "a", "15"]);
  const e = pick(r, ["4", "7", "2", "9", "n", "5"]);
  const target = r() < 0.5 ? "base" : "exp";
  return identify({
    id: nid("idf"), level: 1, indicator: "basis-eksponen", base: b, exp: e, target,
    hint: target === "base" ? "Basis ditulis besar dan berada di bawah." : "Pangkat ditulis kecil di kanan atas.",
    explanation: [`Pada ${b}^{${e}}: basisnya ${b} dan pangkatnya ${e}.`, `Artinya ${b} dikalikan sebanyak ${e} kali.`],
  });
}

function genTfMultiply(r: Rng): Question {
  const b = int(r, 2, 6);
  const e = int(r, 2, 4);
  return tfq({
    id: nid("tf1"), level: 1, indicator: "pengertian",
    statement: `${P(b, e)} = ${b} × ${e} = ${b * e}`, answer: false,
    hint: "Apakah pangkat dikalikan dengan basis?",
    explanation: [`${P(b, e)} = ${repeatedProduct(b, e)} = ${val(b, e)}.`, `Bukan ${b} × ${e}. Jadi pernyataan SALAH.`],
  });
}

function genMatchL1(r: Rng): Question {
  const bases = shuffle([2, 3, 4, 5, 6, 7], r).slice(0, 4);
  const pairs: [string, string][] = bases.map((b) => {
    const e = int(r, 2, 4);
    return [repeatedProduct(b, e), P(b, e)];
  });
  return match({
    id: nid("mt1"), level: 1, indicator: "perkalian-berulang",
    prompt: "Pasangkan setiap perkalian berulang dengan bentuk pangkatnya.", pairs,
    hint: "Hitung banyak faktor pada setiap perkalian.",
    explanation: pairs.map(([a, b]) => `${a} = ${b}`),
  });
}

const L1_MANUAL: Question[] = [
  match({ id: "l1-term", level: 1, indicator: "basis-eksponen", label: "Memasangkan Istilah", prompt: "Pasangkan istilah dengan definisinya.", pairs: [["Basis", "Bilangan yang dikalikan berulang"], ["Pangkat", "Banyaknya faktor yang dikalikan"], ["Faktor", "Setiap bilangan yang dikalikan"], ["Bilangan berpangkat", "Bentuk singkat perkalian berulang"]], hint: "Ingat lagi istilah penting di Forest Camp.", explanation: ["Basis: bilangan yang dikalikan berulang.", "Pangkat (eksponen): banyaknya faktor.", "Faktor: setiap bilangan yang dikalikan.", "Bilangan berpangkat: bentuk singkat perkalian berulang."] }),
  mcq({ id: "l1-c1", level: 1, indicator: "basis-eksponen", prompt: "Angka kecil yang ditulis di kanan atas pada bilangan berpangkat disebut …", options: ["Basis", "Pangkat atau eksponen", "Faktor", "Hasil"], answer: 1, hint: "Letaknya di pucuk!", explanation: ["Angka kecil di kanan atas disebut pangkat atau eksponen."] }),
  mcq({ id: "l1-c2", level: 1, indicator: "pengertian", prompt: "Mana yang nilainya paling besar?", options: ["2^{3}", "3^{2}", "2^{4}", "4^{1}"], answer: 2, hint: "Hitung nilai setiap pilihan.", explanation: ["2^{3} = 8, 3^{2} = 9, 2^{4} = 16, 4^{1} = 4.", "Yang terbesar adalah 2^{4} = 16."] }),
  tfq({ id: "l1-c3", level: 1, indicator: "pengertian", statement: "2^{3} dan 3^{2} memiliki nilai yang sama.", answer: false, hint: "Hitung keduanya.", explanation: ["2^{3} = 8 dan 3^{2} = 9.", "Nilainya berbeda, jadi basis dan pangkat tidak boleh ditukar."] }),
  short({ id: "l1-c4", level: 1, indicator: "pengertian", label: "Soal Cerita", scene: "bacteria", prompt: "Sebuah bakteri membelah menjadi 2 setiap jam. Mula-mula ada 1 bakteri. Berapa banyak bakteri setelah 4 jam?", accept: ["16"], mode: "value", placeholder: "angka", hint: "Setelah n jam ada 2^{n} bakteri.", explanation: ["Setelah 4 jam: 2^{4}", "2^{4} = 2 × 2 × 2 × 2 = 16 bakteri"] }),
  tfq({ id: "l1-c5", level: 1, indicator: "pengertian", statement: "(−2)^{2} = 4", answer: true, hint: "(−2) × (−2) = ?", explanation: ["(−2)^{2} = (−2) × (−2) = 4.", "Negatif dikali negatif hasilnya positif. Pernyataan BENAR."] }),
  mcq({ id: "l1-c6", level: 1, indicator: "pengertian", prompt: "Nilai dari (−3)^{3} adalah …", options: ["−27", "27", "−9", "9"], answer: 0, hint: "Ada tiga faktor negatif.", explanation: ["(−3)^{3} = (−3) × (−3) × (−3)", "= 9 × (−3) = −27", "Basis negatif dengan pangkat ganjil hasilnya negatif."] }),
];

// ───────────────────────── templat level 2 ─────────────────────────
function genMul(r: Rng): Question {
  const b = pick(r, [2, 3, 5, 7, "a", "x"] as (number | string)[]);
  const m = int(r, 2, 6), n = int(r, 2, 6);
  const B = String(b);
  const o = options(r, P(B, m + n), [P(B, m * n), typeof b === "number" ? P(b * b, m + n) : `2${P(B, m + n)}`, P(B, Math.abs(m - n) || 1)]);
  return mcq({
    id: nid("mul"), level: 2, indicator: "perkalian", label: "Menyederhanakan Perpangkatan",
    prompt: `${P(B, m)} × ${P(B, n)} = …`, ...o,
    hint: "Basis sama dikali → pangkat dijumlahkan.",
    explanation: [`Basisnya sama, yaitu ${B}.`, `Pangkat dijumlahkan: ${m} + ${n} = ${m + n}.`, `${P(B, m)} × ${P(B, n)} = ${P(B, m + n)}`],
    optionFeedback: { [o.options.indexOf(P(B, m * n))]: `Pangkatnya dikalikan (${m} × ${n}). Seharusnya dijumlahkan: ${m} + ${n}.` },
  });
}

function genMulShort(r: Rng): Question {
  const b = pick(r, [2, 3, 4, 6, 10]);
  const m = int(r, 1, 5), n = int(r, 2, 5);
  return short({
    id: nid("muls"), level: 2, indicator: "perkalian", label: "Melengkapi Rumus",
    prompt: `Lengkapi: ${P(b, m)} × ${P(b, n)} = ${b}^{…}. Tulis hasilnya dalam bentuk pangkat.`, accept: [`${b}^${m + n}`], placeholder: `${b}^…`,
    hint: `Jumlahkan ${m} dan ${n}.`,
    explanation: [`${P(b, m)} × ${P(b, n)} = ${P(b, `${m}+${n}`)} = ${P(b, m + n)}`],
  });
}

function genDiv(r: Rng): Question {
  const b = pick(r, [2, 3, 5, 7, 10, "a"] as (number | string)[]);
  const n = int(r, 2, 4);
  const m = n * pick(r, [2, 3]) + (r() < 0.5 ? 1 : 0); // pastikan m:n tidak selalu bulat
  const B = String(b);
  const wrongDiv = Number.isInteger(m / n) ? P(B, m / n) : P(B, m + n);
  const o = options(r, P(B, m - n), [wrongDiv, P(B, m + n), typeof b === "number" ? P(1, m - n) : P(B, m * n), P(B, m * n), P(B, m - n + 1)]);
  return mcq({
    id: nid("div"), level: 2, indicator: "pembagian", label: "Menyederhanakan Perpangkatan",
    prompt: `${P(B, m)} : ${P(B, n)} = …`, ...o,
    hint: "Basis sama dibagi → pangkat dikurangkan.",
    explanation: [`Basisnya sama, yaitu ${B}.`, `Pangkat dikurangkan: ${m} − ${n} = ${m - n}.`, `${P(B, m)} : ${P(B, n)} = ${P(B, m - n)}`],
  });
}

function genDivValue(r: Rng): Question {
  const b = pick(r, [2, 3, 10]);
  const k = b === 10 ? int(r, 1, 3) : int(r, 2, 4);
  const n = int(r, 2, 5);
  return short({
    id: nid("divv"), level: 2, indicator: "pembagian", label: "Menentukan Hasil",
    prompt: `Berapa nilai ${P(b, n + k)} : ${P(b, n)}?`, accept: [plainVal(b, k)], mode: "value", placeholder: "angka",
    hint: "Sederhanakan dulu menjadi satu pangkat.",
    explanation: [`${P(b, n + k)} : ${P(b, n)} = ${P(b, `${n + k}−${n}`)} = ${P(b, k)}`, `${P(b, k)} = ${val(b, k)}`],
  });
}

function genPowPow(r: Rng): Question {
  const b = pick(r, [2, 3, 5, "a", "y"] as (number | string)[]);
  const m = int(r, 2, 5), n = int(r, 2, 4);
  const B = String(b);
  const o = options(r, P(B, m * n), [P(B, m + n), P(B, Math.pow(m, n)), typeof b === "number" ? P(b * n, m) : P(B, m), P(B, m * n + 1)]);
  return mcq({
    id: nid("pp"), level: 2, indicator: "pangkat-pangkat", label: "Menyederhanakan Perpangkatan",
    prompt: `(${P(B, m)})^{${n}} = …`, ...o,
    hint: "Pangkat dari pangkat → pangkat dikalikan.",
    explanation: [`(${P(B, m)})^{${n}} = ${P(B, `${m}×${n}`)} = ${P(B, m * n)}`],
    optionFeedback: { [o.options.indexOf(P(B, m + n))]: `Pangkatnya dijumlahkan. Pada (a^{m})^{n}, pangkat dikalikan: ${m} × ${n}.` },
  });
}

function genPowPowTf(r: Rng): Question {
  const m = int(r, 2, 5), n = int(r, 2, 4);
  const truth = r() < 0.5;
  const claim = truth ? m * n : m + n;
  const ans = claim === m * n;
  return tfq({
    id: nid("pptf"), level: 2, indicator: "pangkat-pangkat",
    statement: `(a^{${m}})^{${n}} = a^{${claim}}`, answer: ans,
    hint: "Pangkat dikali atau dijumlah?",
    explanation: [`(a^{${m}})^{${n}} = a^{${m}×${n}} = a^{${m * n}}.`, ans ? "Jadi pernyataan BENAR." : "Jadi pernyataan SALAH."],
  });
}

function genZero(r: Rng): Question {
  const b = pick(r, [3, 8, 12, 25, 100, 999, -6]);
  const o = options(r, "1", ["0", String(b).replace("-", "−"), String(Math.abs(b) * 10)]);
  return mcq({
    id: nid("zero"), level: 2, indicator: "nol", label: "Menentukan Hasil",
    prompt: `Nilai dari ${P(b, 0)} adalah …`, ...o,
    hint: "Basis bukan nol, pangkatnya nol.",
    explanation: [`${b} ≠ 0, maka ${P(b, 0)} = 1.`],
    optionFeedback: { [o.options.indexOf("0")]: "Pangkat nol tidak membuat hasilnya nol. Hasilnya 1." },
  });
}

function genZeroSum(r: Rng): Question {
  const a = int(r, 2, 9), b = int(r, 10, 50), c = int(r, 2, 5);
  return short({
    id: nid("zs"), level: 2, indicator: "nol", label: "Menentukan Hasil",
    prompt: `Hitung ${P(a, 0)} + ${P(b, 0)} + ${P(c, 2)}.`, accept: [String(2 + c * c)], mode: "value", placeholder: "angka",
    hint: "Hitung setiap suku dulu.",
    explanation: [`${P(a, 0)} = 1 dan ${P(b, 0)} = 1`, `${P(c, 2)} = ${c * c}`, `1 + 1 + ${c * c} = ${2 + c * c}`],
  });
}

function genFindErrorMul(r: Rng): Question {
  const b = int(r, 2, 7), m = int(r, 2, 5), n = int(r, 2, 5);
  return findError({
    id: nid("fe2"), level: 2, indicator: "perkalian",
    prompt: `Seorang penjelajah menyederhanakan ${P(b, m)} × ${P(b, n)}. Langkah mana yang keliru?`,
    steps: [`Basisnya sama, yaitu ${b}.`, `Basisnya ikut dikalikan: ${b} × ${b} = ${b * b}.`, `Hasilnya ${P(b * b, m + n)}.`],
    wrongStep: 1,
    hint: "Apakah basisnya berubah?",
    explanation: ["Langkah 2 keliru: basis tetap, tidak ikut dikalikan.", `${P(b, m)} × ${P(b, n)} = ${P(b, m + n)}.`],
  });
}

const L2_MANUAL: Question[] = [
  mcq({ id: "l2-s1", level: 2, indicator: "perkalian", label: "Soal Cerita", scene: "box", prompt: "Sebuah gudang berisi 3^{2} rak. Setiap rak berisi 3^{3} kotak. Berapa banyak kotak seluruhnya dalam bentuk pangkat?", options: ["3^{5}", "3^{6}", "9^{5}", "6^{5}"], answer: 0, hint: "Banyak rak × isi tiap rak.", explanation: ["Total = 3^{2} × 3^{3}", "= 3^{2+3} = 3^{5} = 243 kotak"] }),
  short({ id: "l2-s2", level: 2, indicator: "pembagian", label: "Soal Cerita", scene: "mango", prompt: "Ada 2^{7} kelereng yang dibagi rata ke 2^{3} kantong. Berapa kelereng di tiap kantong?", accept: ["16"], mode: "value", placeholder: "angka", hint: "2^{7} : 2^{3}", explanation: ["2^{7} : 2^{3} = 2^{7−3} = 2^{4}", "2^{4} = 16 kelereng"] }),
  short({ id: "l2-s3", level: 2, indicator: "pangkat-pangkat", label: "Soal Cerita", scene: "garden", prompt: "Sebuah kebun persegi memiliki sisi 3^{2} meter. Berapa luasnya (dalam m²)?", accept: ["81"], mode: "value", placeholder: "angka", hint: "Luas = sisi^{2} = (3^{2})^{2}", explanation: ["Luas = (3^{2})^{2} = 3^{4}", "3^{4} = 81 m²"] }),
  tfq({ id: "l2-c1", level: 2, indicator: "perkalian", statement: "2^{3} × 3^{2} = 6^{5}", answer: false, hint: "Apakah basisnya sama?", explanation: ["Basisnya berbeda (2 dan 3), jadi sifat a^{m} × a^{n} tidak bisa dipakai.", "2^{3} × 3^{2} = 8 × 9 = 72, sedangkan 6^{5} = 7.776."] }),
  match({ id: "l2-m1", level: 2, indicator: "perkalian", label: "Memasangkan Sifat", prompt: "Pasangkan setiap bentuk dengan sifat yang dipakai.", pairs: [["a^{m} × a^{n}", "a^{m+n}"], ["a^{m} : a^{n}", "a^{m−n}"], ["(a^{m})^{n}", "a^{m×n}"], ["a^{0}", "1"]], hint: "Kali → tambah, bagi → kurang, kurung → kali.", explanation: ["a^{m} × a^{n} = a^{m+n}", "a^{m} : a^{n} = a^{m−n}", "(a^{m})^{n} = a^{m×n}", "a^{0} = 1 (a ≠ 0)"] }),
  findError({ id: "l2-fe1", level: 2, indicator: "nol", prompt: "Langkah mana yang keliru?", steps: ["6^{4} : 6^{4} = 6^{4−4}", "= 6^{0}", "= 0"], wrongStep: 2, hint: "Berapa nilai pangkat nol?", explanation: ["Langkah 3 keliru.", "6^{0} = 1, bukan 0."] }),
  tfq({ id: "l2-c2", level: 2, indicator: "nol", statement: "0^{0} = 1", answer: false, hint: "Perhatikan syarat a ≠ 0.", explanation: ["a^{0} = 1 hanya berlaku jika a ≠ 0.", "0^{0} tidak terdefinisi."] }),
];

// ───────────────────────── templat level 3 ─────────────────────────
function genNeg(r: Rng): Question {
  const b = pick(r, [2, 3, 4, 5, 10]);
  const n = b >= 5 ? int(r, 1, 3) : int(r, 2, 4);
  const den = plainVal(b, n);
  const o = options(r, `1/${den}`, [`−${den}`, `−1/${den}`, `1/${b * n}`]);
  return mcq({
    id: nid("neg"), level: 3, indicator: "negatif", label: "Menentukan Hasil",
    prompt: `Bentuk pecahan dari ${P(b, -n)} adalah …`, ...o,
    hint: "a^{−n} = 1/a^{n}",
    explanation: [`${P(b, -n)} = 1/${P(b, n)}`, `${P(b, n)} = ${val(b, n)}`, `Jadi ${P(b, -n)} = 1/${val(b, n)}`],
    optionFeedback: {
      [o.options.indexOf(`−${den}`)]: "Pangkat negatif tidak membuat hasil negatif. Artinya kebalikan.",
      [o.options.indexOf(`−1/${den}`)]: "Hasilnya positif karena basisnya positif.",
      [o.options.indexOf(`1/${b * n}`)]: `${P(b, n)} = ${repeatedProduct(b, n)}, bukan ${b} × ${n}.`,
    },
  });
}

function genNegShort(r: Rng): Question {
  const b = pick(r, [2, 3, 5, 6, 10]);
  const n = b === 2 ? int(r, 2, 5) : int(r, 1, 3);
  return short({
    id: nid("negs"), level: 3, indicator: "negatif", label: "Isian Singkat",
    prompt: `Ubah ${P(b, -n)} menjadi pecahan.`, accept: [`1/${plainVal(b, n)}`], mode: "value", placeholder: "contoh: 1/8",
    hint: `Pindahkan ke penyebut: 1/${P(b, n)}.`,
    explanation: [`${P(b, -n)} = 1/${P(b, n)} = 1/${val(b, n)}`],
  });
}

function genCombo(r: Rng): Question {
  const b = pick(r, [2, 3, 5]);
  let m = int(r, 2, 6), n = int(r, 1, 4), p = int(r, 2, 7);
  if (m + n - p > 4) p = m + n - int(r, 0, 3);
  const res = m + n - p;
  const accept = [`${b}^${res}`, plainVal(b, res)];
  if (res < 0) accept.push(`1/${b}^${-res}`);
  return short({
    id: nid("cmb"), level: 3, indicator: "gabungan", label: "Menyederhanakan Perpangkatan",
    prompt: `Sederhanakan ${P(b, m)} × ${P(b, n)} : ${P(b, p)}. (Boleh dalam bentuk pangkat atau nilai.)`, accept, mode: "text", placeholder: "contoh: 2^3 atau 1/4",
    hint: `Hitung pangkatnya: ${m} + ${n} − ${p}.`,
    explanation: [`= ${P(b, `${m}+${n}−${p}`)} = ${P(b, res)}`, res === 0 ? `${P(b, 0)} = 1` : res < 0 ? `${P(b, res)} = 1/${P(b, -res)} = ${val(b, res)}` : `${P(b, res)} = ${val(b, res)}`],
  });
}

function genComboPow(r: Rng): Question {
  const b = pick(r, [2, 3]);
  const m = int(r, 2, 3), n = 2, q = int(r, 3, 7);
  const res = m * n - q;
  const correct = P(b, res);
  const o = options(r, correct, [P(b, m + n - q), P(b, m * n + q), P(b, (m + n) * q)]);
  return mcq({
    id: nid("cmbp"), level: 3, indicator: "gabungan", label: "Soal Beberapa Langkah",
    prompt: `(${P(b, m)})^{${n}} : ${P(b, q)} = …`, ...o,
    hint: "Kerjakan kurung dulu (pangkat dikali), lalu bagi (pangkat dikurang).",
    explanation: [`(${P(b, m)})^{${n}} = ${P(b, m * n)}`, `${P(b, m * n)} : ${P(b, q)} = ${P(b, `${m * n}−${q}`)} = ${P(b, res)}`],
  });
}

const L3_MANUAL: Question[] = [
  short({ id: "l3-s1", level: 3, indicator: "gabungan", label: "Soal Cerita", scene: "fruit", prompt: "Ada 2^{5} pohon, tiap pohon berbuah 2^{4} buah. Semua buah dibagi rata ke 2^{6} penjelajah. Berapa buah yang diterima tiap penjelajah?", accept: ["8"], mode: "value", placeholder: "angka", hint: "2^{5} × 2^{4} : 2^{6}", explanation: ["Total buah = 2^{5} × 2^{4} = 2^{9}", "Bagian tiap penjelajah = 2^{9} : 2^{6} = 2^{3}", "2^{3} = 8 buah"] }),
  mcq({ id: "l3-s2", level: 3, indicator: "negatif", label: "Soal Cerita", scene: "ruler", prompt: "Tebal selembar kertas sekitar 10^{−4} meter. Dalam bentuk pecahan, tebalnya …", options: ["1/10.000 meter", "−10.000 meter", "1/40 meter", "−1/10.000 meter"], answer: 0, hint: "10^{−4} = 1/10^{4}", explanation: ["10^{−4} = 1/10^{4}", "= 1/10.000 meter"] }),
  findError({ id: "l3-fe1", level: 3, indicator: "negatif", prompt: "Langkah mana yang keliru saat menghitung 2^{−3}?", steps: ["2^{−3} = −2^{3}", "= −(2 × 2 × 2)", "= −8"], wrongStep: 0, hint: "Apa arti pangkat negatif?", explanation: ["Langkah 1 sudah keliru.", "2^{−3} = 1/2^{3} = 1/8, bukan −2^{3}."] }),
  findError({ id: "l3-fe2", level: 3, indicator: "gabungan", prompt: "Langkah mana yang keliru saat menyederhanakan 3^{2} : 3^{5}?", steps: ["Basis sama, yaitu 3.", "= 3^{5−2}", "= 3^{3} = 27"], wrongStep: 1, hint: "Pangkat yang dibagi dikurangi pangkat pembagi.", explanation: ["Langkah 2 keliru: urutannya 2 − 5, bukan 5 − 2.", "3^{2} : 3^{5} = 3^{2−5} = 3^{−3} = 1/27."] }),
  tfq({ id: "l3-c1", level: 3, indicator: "negatif", statement: "5^{−1} = 1/5", answer: true, hint: "a^{−1} = 1/a", explanation: ["5^{−1} = 1/5^{1} = 1/5. Pernyataan BENAR."] }),
  short({ id: "l3-c2", level: 3, indicator: "gabungan", prompt: "Berapa nilai 10^{3} × 10^{−5}? Tulis dalam pecahan.", accept: ["1/100"], mode: "value", placeholder: "contoh: 1/10", hint: "3 + (−5) = −2", explanation: ["= 10^{3+(−5)} = 10^{−2}", "= 1/10^{2} = 1/100"] }),
  mcq({ id: "l3-c3", level: 3, indicator: "gabungan", prompt: "Bentuk sederhana dari (a^{4} × a^{2}) : a^{6} adalah … (a ≠ 0)", options: ["1", "0", "a", "a^{12}"], answer: 0, hint: "Hitung pangkatnya: 4 + 2 − 6.", explanation: ["= a^{4+2−6} = a^{0}", "= 1"] }),
];

// ───────────────────────── perakitan bank ─────────────────────────
function build(): Question[] {
  const r = mulberry32(20250914);
  const out: Question[] = [];
  const seen = new Set<string>();
  const add = (gen: (r: Rng) => Question, n: number) => {
    let tries = 0;
    let made = 0;
    while (made < n && tries < n * 10) {
      tries++;
      const q = gen(r);
      const key = q.kind + q.prompt + ("statement" in q ? q.statement : "") + ("steps" in q ? q.steps.join() : "") + ("pairs" in q ? JSON.stringify(q.pairs) : "") + ("base" in q ? q.base + q.exp + q.target : "");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
      made++;
    }
  };
  add(genValue, 8); add(genRepeatToPow, 6); add(genPowToRepeat, 5); add(genIdentify, 6); add(genTfMultiply, 4); add(genMatchL1, 3);
  out.push(...L1_MANUAL);
  add(genMul, 7); add(genMulShort, 4); add(genDiv, 6); add(genDivValue, 4); add(genPowPow, 6); add(genPowPowTf, 4); add(genZero, 5); add(genZeroSum, 3); add(genFindErrorMul, 3);
  out.push(...L2_MANUAL);
  add(genNeg, 6); add(genNegShort, 5); add(genCombo, 7); add(genComboPow, 5);
  out.push(...L3_MANUAL);
  return out;
}

export const QUESTION_BANK: Question[] = build();

export const PRACTICE_SIZES = [5, 10, 15];

export function drawPractice(level: Difficulty, count: number, rng: Rng = Math.random): Question[] {
  const pool = QUESTION_BANK.filter((q) => q.level === level);
  // jaga variasi indikator: urutkan acak lalu ambil bergiliran per indikator
  const groups = new Map<string, Question[]>();
  for (const q of shuffle(pool, rng)) {
    const g = groups.get(q.indicator) ?? [];
    g.push(q);
    groups.set(q.indicator, g);
  }
  const lists = shuffle([...groups.values()], rng);
  const picked: Question[] = [];
  while (picked.length < Math.min(count, pool.length)) {
    for (const l of lists) {
      const q = l.shift();
      if (q && picked.length < count) picked.push(q);
    }
  }
  return shuffle(picked, rng);
}
