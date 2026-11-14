/** Pembuat soal ringkas agar data soal mudah dibaca dan konsisten. */
import type {
  Difficulty,
  FindErrorQuestion,
  IdentifyQuestion,
  Indicator,
  MatchQuestion,
  McqQuestion,
  ShortQuestion,
  TfQuestion,
} from "@/lib/types";

type Common = { id: string; level: Difficulty; indicator: Indicator; hint: string; explanation: string[]; label?: string; scene?: McqQuestion["scene"] };

export const mcq = (c: Common & { prompt: string; options: string[]; answer: number; optionFeedback?: Record<number, string> }): McqQuestion => ({
  kind: "mcq",
  label: c.label ?? "Pilihan Ganda",
  ...c,
});

export const tfq = (c: Common & { statement: string; answer: boolean; prompt?: string }): TfQuestion => ({
  kind: "tf",
  label: c.label ?? "Benar atau Salah",
  prompt: c.prompt ?? "Apakah pernyataan berikut benar?",
  ...c,
});

export const short = (
  c: Common & { prompt: string; accept: string[]; mode?: "text" | "value"; placeholder?: string; keypad?: string[] },
): ShortQuestion => ({
  kind: "short",
  label: c.label ?? "Isian Singkat",
  mode: c.mode ?? "text",
  keypad: c.keypad ?? (c.mode === "value" ? ["/", "−"] : ["^", "×", "/", "−"]),
  ...c,
});

export const identify = (c: Common & { prompt?: string; base: string; exp: string; target: "base" | "exp" }): IdentifyQuestion => ({
  kind: "identify",
  label: c.label ?? "Identifikasi",
  prompt: c.prompt ?? (c.target === "base" ? "Ketuk bagian yang merupakan BASIS (bilangan pokok)." : "Ketuk bagian yang merupakan PANGKAT (eksponen)."),
  ...c,
});

export const findError = (c: Common & { prompt: string; steps: string[]; wrongStep: number }): FindErrorQuestion => ({
  kind: "findError",
  label: c.label ?? "Temukan Kesalahan",
  ...c,
});

export const match = (c: Common & { prompt: string; pairs: [string, string][] }): MatchQuestion => ({
  kind: "match",
  label: c.label ?? "Pasangkan",
  ...c,
});
