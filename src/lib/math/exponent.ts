/**
 * Perhitungan bilangan berpangkat secara EXACT (BigInt + pecahan),
 * dipakai oleh Laboratorium, generator soal, dan pemeriksaan jawaban.
 */

export interface Rational {
  num: bigint;
  den: bigint; // selalu > 0
}

export const LAB_LIMITS = {
  baseMin: -20,
  baseMax: 20,
  expMin: -10,
  expMax: 10,
  maxAbs: 10n ** 15n,
};

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

export function rational(num: bigint, den: bigint = 1n): Rational {
  if (den === 0n) throw new Error("Penyebut nol");
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den) || 1n;
  return { num: num / g, den: den / g };
}

export function rationalEquals(a: Rational, b: Rational): boolean {
  return a.num * b.den === b.num * a.den;
}

export type PowResult =
  | { ok: true; value: Rational }
  | { ok: false; reason: "undefined-zero" | "too-big" };

/** Menghitung base^exp secara exact. base & exp bilangan bulat. */
export function powExact(base: number, exp: number, maxAbs: bigint = LAB_LIMITS.maxAbs): PowResult {
  if (base === 0 && exp <= 0) return { ok: false, reason: "undefined-zero" };
  const b = BigInt(base);
  const e = Math.abs(exp);
  let acc = 1n;
  for (let i = 0; i < e; i++) {
    acc *= b;
    if ((acc < 0n ? -acc : acc) > maxAbs) return { ok: false, reason: "too-big" };
  }
  return { ok: true, value: exp >= 0 ? rational(acc) : rational(1n, acc) };
}

/** Format bigint dengan pemisah ribuan gaya Indonesia (1.000). */
export function formatInt(n: bigint): string {
  const neg = n < 0n;
  const s = (neg ? -n : n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "−" : "") + s;
}

export function formatRational(r: Rational): string {
  if (r.den === 1n) return formatInt(r.num);
  const neg = r.num < 0n;
  const abs = neg ? -r.num : r.num;
  return `${neg ? "−" : ""}${formatInt(abs)}/${formatInt(r.den)}`;
}

/** Basis negatif ditulis di dalam kurung: (−2). */
export function formatBase(base: number): string {
  return base < 0 ? `(−${Math.abs(base)})` : `${base}`;
}

/** Notasi MathText: "2^{3}", "(−2)^{3}", "2^{−3}". */
export function powText(base: number | string, exp: number | string): string {
  const b = typeof base === "number" ? formatBase(base) : base;
  const e = typeof exp === "number" ? (exp < 0 ? `−${Math.abs(exp)}` : `${exp}`) : exp;
  return `${b}^{${e}}`;
}

/** Bentuk perkalian berulang: 2 × 2 × 2 */
export function repeatedProduct(base: number, times: number): string {
  if (times <= 0) return "";
  return Array.from({ length: times }, () => formatBase(base)).join(" × ");
}

export interface LabInputResult {
  ok: boolean;
  base?: number;
  exp?: number;
  error?: string;
}

/** Validasi input Laboratorium (string dari kolom input). */
export function validateLabInput(baseRaw: string, expRaw: string): LabInputResult {
  const bs = baseRaw.trim().replace("−", "-").replace(",", ".");
  const es = expRaw.trim().replace("−", "-").replace(",", ".");
  if (bs === "" || es === "") return { ok: false, error: "Kolom basis dan pangkat tidak boleh kosong, ya." };
  if (!/^-?\d+(\.\d+)?$/.test(bs) || !/^-?\d+(\.\d+)?$/.test(es))
    return { ok: false, error: "Masukkan angka saja, tanpa huruf atau simbol lain." };
  const base = Number(bs);
  const exp = Number(es);
  if (!Number.isInteger(exp))
    return { ok: false, error: "Di materi SMP kita memakai pangkat bilangan bulat. Coba pangkat seperti 2, 0, atau −3." };
  if (!Number.isInteger(base))
    return { ok: false, error: "Untuk laboratorium ini, gunakan basis bilangan bulat, ya." };
  const L = LAB_LIMITS;
  if (base < L.baseMin || base > L.baseMax)
    return { ok: false, error: `Basis dibatasi dari ${L.baseMin} sampai ${L.baseMax} agar hasilnya tidak terlalu besar.` };
  if (exp < L.expMin || exp > L.expMax)
    return { ok: false, error: `Pangkat dibatasi dari ${L.expMin} sampai ${L.expMax} agar hasilnya tidak terlalu besar.` };
  if (base === 0 && exp === 0)
    return { ok: false, base, exp, error: "0⁰ tidak terdefinisi. Aturan a⁰ = 1 hanya berlaku jika a ≠ 0." };
  if (base === 0 && exp < 0)
    return {
      ok: false,
      base,
      exp,
      error: `0 pangkat negatif tidak terdefinisi, karena ${powText(0, exp)} = 1/${powText(0, -exp)} = 1/0, dan pembagian dengan nol tidak terdefinisi.`,
    };
  const r = powExact(base, exp);
  if (!r.ok) return { ok: false, error: "Hasilnya terlalu besar untuk ditampilkan. Coba angka yang lebih kecil." };
  return { ok: true, base, exp };
}

/** Penjelasan tanda hasil untuk basis negatif. */
export function signNote(base: number, exp: number): string | null {
  if (base >= 0 || exp === 0) return null;
  const even = Math.abs(exp) % 2 === 0;
  return even
    ? `Basis negatif dengan pangkat genap menghasilkan bilangan positif, karena jumlah tanda negatifnya genap (berpasangan).`
    : `Basis negatif dengan pangkat ganjil menghasilkan bilangan negatif, karena ada satu tanda negatif yang tidak berpasangan.`;
}

/** Langkah-langkah penyelesaian untuk a^n (dipakai Lab & pembahasan). */
export function powSteps(base: number, exp: number): string[] {
  const steps: string[] = [];
  const p = powText(base, exp);
  if (base === 0 && exp <= 0) return [`${p} tidak terdefinisi.`];
  if (exp === 0) {
    steps.push(`${p} = 1, karena setiap bilangan (kecuali 0) berpangkat nol hasilnya 1.`);
    steps.push(`Asalnya: ${powText(base, 2)} : ${powText(base, 2)} = ${powText(base, "2−2")} = ${powText(base, 0)}, dan bilangan dibagi dirinya sendiri = 1.`);
    return steps;
  }
  if (exp > 0) {
    const r = powExact(base, exp);
    steps.push(`${p} artinya ${formatBase(base)} dikalikan sebanyak ${exp} kali.`);
    steps.push(`${p} = ${repeatedProduct(base, exp)}`);
    if (r.ok) steps.push(`${p} = ${formatRational(r.value)}`);
    return steps;
  }
  const n = -exp;
  const r = powExact(base, n);
  steps.push(`Pangkat negatif berarti kebalikan: ${p} = 1/${powText(base, n)}`);
  steps.push(`${powText(base, n)} = ${repeatedProduct(base, n)}${r.ok ? ` = ${formatRational(r.value)}` : ""}`);
  const full = powExact(base, exp);
  if (full.ok) steps.push(`Jadi ${p} = ${formatRational(full.value)}`);
  return steps;
}

/** Parsing jawaban nilai: "8", "-8", "1/8", "0,125", "1.000". */
export function parseRational(raw: string): Rational | null {
  let s = raw.trim().replace(/\s+/g, "").replace(/[−–]/g, "-");
  if (s === "") return null;
  const frac = s.match(/^(-?)(\d+)\/(-?)(\d+)$/);
  if (frac) {
    const sign = (frac[1] === "-") !== (frac[3] === "-") ? -1n : 1n;
    const den = BigInt(frac[4]);
    if (den === 0n) return null;
    return rational(sign * BigInt(frac[2]), den);
  }
  if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // pemisah ribuan
  s = s.replace(",", ".");
  const dec = s.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!dec) return null;
  const intPart = dec[2];
  const fracPart = dec[3] ?? "";
  const den = 10n ** BigInt(fracPart.length);
  const num = BigInt(intPart + fracPart) * (dec[1] === "-" ? -1n : 1n);
  return rational(num, den);
}
