/** Tipe data bersama untuk soal, wilayah, dan progres. */

export type Indicator =
  | "pengertian"
  | "basis-eksponen"
  | "perkalian-berulang"
  | "perkalian"
  | "pembagian"
  | "pangkat-pangkat"
  | "nol"
  | "negatif"
  | "gabungan";

export const INDICATOR_LABEL: Record<Indicator, string> = {
  pengertian: "Pengertian & nilai pangkat",
  "basis-eksponen": "Basis dan eksponen",
  "perkalian-berulang": "Perkalian berulang",
  perkalian: "Perkalian basis sama",
  pembagian: "Pembagian basis sama",
  "pangkat-pangkat": "Pangkat dari pangkat",
  nol: "Pangkat nol",
  negatif: "Pangkat negatif",
  gabungan: "Soal gabungan",
};

/** 1 = Penjelajah Pemula, 2 = Petualang Hutan, 3 = Penakluk Eksponen */
export type Difficulty = 1 | 2 | 3;

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: "Penjelajah Pemula",
  2: "Petualang Hutan",
  3: "Penakluk Eksponen",
};

interface BaseQuestion {
  id: string;
  level: Difficulty;
  indicator: Indicator;
  /** label jenis soal, mis. "Pilihan Ganda", "Soal Cerita" */
  label: string;
  /** teks soal; notasi pangkat memakai ^{..} (dirender MathText) */
  prompt: string;
  /** konteks cerita/ilustrasi opsional */
  scene?: "bacteria" | "fruit" | "box" | "garden" | "ruler" | "mango";
  hint: string;
  /** pembahasan langkah demi langkah */
  explanation: string[];
}

export interface McqQuestion extends BaseQuestion {
  kind: "mcq";
  options: string[];
  answer: number;
  /** penjelasan khusus jika memilih opsi tertentu (indeks -> teks) */
  optionFeedback?: Record<number, string>;
}

export interface TfQuestion extends BaseQuestion {
  kind: "tf";
  statement: string;
  answer: boolean;
}

export interface ShortQuestion extends BaseQuestion {
  kind: "short";
  /** "text": dibandingkan setelah normalisasi; "value": dibandingkan nilainya (pecahan/desimal) */
  mode: "text" | "value";
  accept: string[];
  placeholder?: string;
  /** daftar tombol bantu ketik, mis. ["×", "^", "/"] */
  keypad?: string[];
}

export interface MatchQuestion extends BaseQuestion {
  kind: "match";
  pairs: [string, string][];
}

export interface IdentifyQuestion extends BaseQuestion {
  kind: "identify";
  base: string;
  exp: string;
  target: "base" | "exp";
}

export interface FindErrorQuestion extends BaseQuestion {
  kind: "findError";
  steps: string[];
  /** indeks langkah yang keliru */
  wrongStep: number;
}

export type Question =
  | McqQuestion
  | TfQuestion
  | ShortQuestion
  | MatchQuestion
  | IdentifyQuestion
  | FindErrorQuestion;

/** Jawaban siswa per jenis soal */
export type AnswerValue =
  | number // mcq index / findError step
  | boolean // tf
  | string // short / identify
  | Record<number, number>; // match: indeks kiri -> indeks kanan

export type RegionId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
