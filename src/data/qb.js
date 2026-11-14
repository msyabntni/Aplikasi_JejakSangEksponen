/** Pembuat soal ringkas agar data soal mudah dibaca dan konsisten. */

export const mcq = (c) => ({
  kind: "mcq",
  label: c.label ?? "Pilihan Ganda",
  ...c,
});

export const tfq = (c) => ({
  kind: "tf",
  label: c.label ?? "Benar atau Salah",
  prompt: c.prompt ?? "Apakah pernyataan berikut benar?",
  ...c,
});

export const short = (c) => ({
  kind: "short",
  label: c.label ?? "Isian Singkat",
  mode: c.mode ?? "text",
  keypad: c.keypad ?? (c.mode === "value" ? ["/", "−"] : ["^", "×", "/", "−"]),
  ...c,
});

export const identify = (c) => ({
  kind: "identify",
  label: c.label ?? "Identifikasi",
  prompt: c.prompt ?? (c.target === "base" ? "Ketuk bagian yang merupakan BASIS (bilangan pokok)." : "Ketuk bagian yang merupakan PANGKAT (eksponen)."),
  ...c,
});

export const findError = (c) => ({
  kind: "findError",
  label: c.label ?? "Temukan Kesalahan",
  ...c,
});

export const match = (c) => ({
  kind: "match",
  label: c.label ?? "Pasangkan",
  ...c,
});
