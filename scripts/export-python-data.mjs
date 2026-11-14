/**
 * Membuat api/_lib/data_soal.py (kunci jawaban untuk backend Python) dari data soal
 * frontend, agar backend & frontend selalu memakai soal dan kunci yang sama.
 * Jalankan: npm run py:data
 */
import { writeFileSync } from "node:fs";
import { REGIONS } from "../src/data/regions";
import { PRETEST, POSTTEST } from "../src/data/exams";
import { QUESTION_BANK } from "../src/data/questionBank";
import { gradeAnswer } from "../src/lib/grading";
import { formatRational, powExact, powSteps, signNote, validateLabInput } from "../src/lib/math/exponent";

const all = [...PRETEST, ...POSTTEST, ...REGIONS.flatMap((r) => r.mission.questions), ...QUESTION_BANK];
const soal = {};
for (const q of all) {
  const s = { kind: q.kind, indicator: q.indicator, level: q.level };
  if (q.kind === "mcq" || q.kind === "tf") s.kunci = q.answer;
  if (q.kind === "identify") s.kunci = q.target;
  if (q.kind === "findError") s.kunci = q.wrongStep;
  if (q.kind === "match") s.pasangan = q.pairs.length;
  if (q.kind === "short") {
    s.kunci = q.accept;
    s.mode = q.mode;
  }
  if (soal[q.id]) throw new Error("id soal ganda: " + q.id);
  soal[q.id] = s;
}
const kelompok = {
  pretest: PRETEST.map((q) => q.id),
  posttest: POSTTEST.map((q) => q.id),
  ...Object.fromEntries(REGIONS.map((r) => [`misi-${r.id}`, r.mission.questions.map((q) => q.id)])),
};

// JSON.stringify(JSON.stringify(x)) menghasilkan literal string yang juga sah di Python
const py = `"""DIBUAT OTOMATIS oleh scripts/export-python-data.mjs dari data soal frontend.
Jangan diedit manual; jalankan: npm run py:data"""

import json

SOAL = json.loads(${JSON.stringify(JSON.stringify(soal))})

KELOMPOK = json.loads(${JSON.stringify(JSON.stringify(kelompok))})
`;
writeFileSync(new URL("../api/_lib/data_soal.py", import.meta.url), py, "utf8");

// ── fixture uji kesetaraan: hasil penilaian & perhitungan versi JavaScript ──
const SUPS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻" };
const variasiIsian = (a) => {
  const v = [a, ` ${a} `, a.replace(/×/g, "x"), a.replace(/×/g, "*"), a.replace(/ /g, ""), a.toUpperCase(), a.replace(/\^(-?\d+)/g, (_, d) => [...d].map((c) => SUPS[c]).join("")),
    a.replace(/\^(-?\w+)/g, "^{$1}"), a.replace(/\^/g, " pangkat "), a + "0", "1" + a, "", "abc", "2/0", "0,5", "1.000", "-" + a, a.replace("/", ":"), "4.4.4", "3/9", "2/50"];
  return [...new Set(v)];
};
const kasus = [];
for (const q of all) {
  let cands = [];
  if (q.kind === "mcq") cands = [...q.options.keys(), -1, 99, "0", true];
  if (q.kind === "tf") cands = [true, false, 1, "true"];
  if (q.kind === "identify") cands = ["base", "exp", "", 0];
  if (q.kind === "findError") cands = [...q.steps.keys(), -1, "0"];
  if (q.kind === "match") {
    const n = q.pairs.length;
    const id = Object.fromEntries([...Array(n).keys()].map((i) => [i, i]));
    const swap = { ...id, 0: 1, 1: 0 };
    const kurang = Object.fromEntries([...Array(n - 1).keys()].map((i) => [i, i]));
    cands = [id, swap, kurang, {}];
  }
  if (q.kind === "short") cands = q.accept.flatMap(variasiIsian);
  for (const a of cands) kasus.push({ id: q.id, jawaban: a, benar: gradeAnswer(q, a) });
}
const pangkat = [];
for (let b = -6; b <= 12; b++) for (let e = -5; e <= 6; e++) {
  const r = powExact(b, e);
  pangkat.push({ basis: b, pangkat: e, hasil: r.ok ? formatRational(r.value) : null, langkah: powSteps(b, e), catatan: signNote(b, e) });
}
const inputLab = ["", " ", "a", "2.5", "2,0", "−3", "-3", "0", "21", "-21", "1e2", "10", "-10", "11", "3"];
const validasi = [];
for (const bs of inputLab) for (const es of inputLab) validasi.push({ basis: bs, pangkat: es, ...validateLabInput(bs, es) });
writeFileSync(new URL("../tests/fixtures/kesetaraan_js.json", import.meta.url), JSON.stringify({ kasus, pangkat, validasi }), "utf8");
console.log(`tests/fixtures/kesetaraan_js.json: ${kasus.length} kasus penilaian, ${pangkat.length} kasus pangkat, ${validasi.length} kasus validasi.`);
console.log(`api/_lib/data_soal.py dibuat: ${Object.keys(soal).length} soal, ${Object.keys(kelompok).length} kelompok.`);
