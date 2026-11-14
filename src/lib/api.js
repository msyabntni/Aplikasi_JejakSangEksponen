/**
 * Penghubung frontend (JavaScript) ↔ backend Python (folder api/).
 *
 * - Di Vercel: /api/* dijalankan fungsi serverless Python.
 * - Di komputer sendiri: /api/* diteruskan ke `python backend/dev_server.py`.
 * Bila backend tidak terjangkau (offline, server Python tidak dijalankan),
 * fungsi di sini mengembalikan null dan aplikasi memakai penilaian cadangan
 * di browser (logikanya identik, dibuktikan oleh uji kesetaraan tests/test_backend.py).
 */
import { gradeAll } from "./grading";

const BATAS_WAKTU_MS = 6000;

async function kirim(url, body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), BATAS_WAKTU_MS);
  try {
    const res = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Menilai jawaban di server Python. null bila backend tidak tersedia. */
export async function nilaiDiServer(questions, answers) {
  const r = await kirim("/api/nilai", {
    soal: questions.map((q) => q.id),
    jawaban: Object.fromEntries(questions.map((q) => [q.id, answers[q.id] ?? null])),
  });
  if (!r || r.dinilai_oleh !== "python" || r.total !== questions.length || !Array.isArray(r.per_soal)) return null;
  return {
    score: r.skor,
    correct: r.benar,
    wrong: r.salah,
    total: r.total,
    perQuestion: r.per_soal,
    byIndicator: r.per_indikator ?? {},
    gradedBy: "python",
  };
}

/**
 * Penilaian utama aplikasi: backend Python lebih dulu, cadangan di browser.
 * Hasil: { score, correct, wrong, total, perQuestion, gradedBy: "python" | "browser" }
 */
export async function nilaiJawaban(questions, answers) {
  const server = await nilaiDiServer(questions, answers);
  if (server) return server;
  const g = gradeAll(questions, answers);
  return { score: g.score, correct: g.correct, wrong: g.wrong, total: g.total, perQuestion: g.perQuestion, gradedBy: "browser" };
}

/** Perhitungan Laboratorium di server Python. null bila backend tidak tersedia. */
export async function hitungPangkatDiServer(basis, pangkat) {
  const r = await kirim(`/api/pangkat?basis=${encodeURIComponent(basis)}&pangkat=${encodeURIComponent(pangkat)}`);
  return r && r.dihitung_oleh === "python" ? r : null;
}

/** Status backend Python (untuk ditampilkan di aplikasi). */
export async function statusBackend() {
  const r = await kirim("/api/status");
  return r && r.backend === "python" ? r : null;
}
