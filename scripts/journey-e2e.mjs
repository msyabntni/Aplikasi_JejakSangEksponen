/**
 * Uji perjalanan PENUH lewat UI (mode tamu/lokal):
 * nama → pretest → Wilayah 01–07 (semua bagian + misi + selesai) → Jungle Challenge level 1–3
 * → posttest → perkembangan → profil (XP, level, lencana) → reload (data tetap).
 * Jalankan (server di port 3123): npx tsx scripts/journey-e2e.ts [baseUrl]
 * Windows tanpa Chromium Playwright: set E2E_CHANNEL=msedge
 */
import { chromium } from "playwright";
import { REGIONS } from "../src/data/regions";
import { PRETEST, POSTTEST } from "../src/data/exams";
import { QUESTION_BANK } from "../src/data/questionBank";

const BASE = process.argv[2] ?? "http://localhost:3123";
const ALL = new Map([...QUESTION_BANK, ...PRETEST, ...POSTTEST, ...REGIONS.flatMap((r) => r.mission.questions)].map((q) => [q.id, q]));
let pass = 0;
let fail = 0;
const check = (n, ok, x = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`);
};
const rendered = (t) =>
  t
    .replace(/\^\{([^}]*)\}/g, "$1")
    .replace(/\^(-?\w+)/g, "$1")
    .replace(/[−-]/g, "-")
    .replace(/\s+/g, "");

/** Menjawab satu soal dengan kunci yang benar lewat elemen UI. */
async function answer(page, q) {
  const box = page.locator(`[data-qid="${q.id}"]`).last();
  switch (q.kind) {
    case "mcq":
      await box.getByRole("radio").nth(q.answer).click();
      break;
    case "tf":
      await box.getByRole("button", { name: q.answer ? "BENAR" : "SALAH", exact: true }).click();
      break;
    case "short":
      await box.getByLabel("Jawaban").fill(q.accept[0]);
      break;
    case "identify":
      await box.getByRole("button", { name: q.target === "base" ? /^Bagian bawah/ : /^Bagian atas/ }).click();
      break;
    case "findError":
      await box.getByRole("button", { name: new RegExp(`^Langkah ${q.wrongStep + 1}`) }).click();
      break;
    case "match": {
      const cols = box.locator(".grid.grid-cols-2 > div");
      const left = cols.nth(0).locator("button");
      const right = cols.nth(1).locator("button");
      const rightTexts = (await right.allInnerTexts()).map(rendered);
      for (let i = 0; i < q.pairs.length; i++) {
        await left.nth(i).click();
        const k = rightTexts.indexOf(rendered(q.pairs[i][1]));
        if (k < 0) throw new Error(`pasangan tidak ditemukan: ${q.pairs[i][1]}`);
        await right.nth(k).click();
      }
      break;
    }
  }
}

/** Menunggu soal yang sedang tampil (setelah transisi), lalu mengembalikan datanya. */
async function current(page, label) {
  await page.getByText(label).first().waitFor();
  await page.waitForTimeout(450);
  const id = await page.locator("[data-qid]").last().getAttribute("data-qid");
  const q = ALL.get(id ?? "");
  if (!q) throw new Error("soal tidak dikenal: " + id);
  return q;
}

async function exam(page, total, submit, wrongIdx = []) {
  for (let i = 0; i < total; i++) {
    const q = await current(page, new RegExp(`Soal ${i + 1} dari ${total}`));
    if (!wrongIdx.includes(i)) await answer(page, q);
    if (i < total - 1) {
      try {
        await page.getByRole("button", { name: "Berikutnya" }).click({ timeout: 8000 });
      } catch (e) {
        const shot = `${process.env.SHOTS ?? "."}/gagal-soal-${q.id}.png`;
        await page.screenshot({ path: shot, fullPage: true });
        const boxes = [];
        for (let k = 0; k < 4; k++) {
          boxes.push(JSON.stringify(await page.getByRole("button", { name: "Berikutnya" }).boundingBox()));
          await page.waitForTimeout(120);
        }
        console.log(`DEBUG soal ${q.id} (${q.kind}) layar disimpan: ${shot}
  bbox: ${boxes.join(" | ")}`);
        throw e;
      }
    }
  }
  await page.getByRole("button", { name: submit }).click();
  await page.getByRole("button", { name: "Ya, kumpulkan" }).click();
}

const xpOf = async (page) => Number(((await page.locator("header").first().innerText()).match(/(\d+)\s*XP/) ?? [])[1] ?? -1);
async function click(l, tag = "klik") {
  try {
    await l.click({ timeout: 8000 });
  } catch (e) {
    const pg = l.page();
    const shot = `${process.env.SHOTS ?? "."}/gagal-${tag}.png`;
    await pg.screenshot({ path: shot });
    const boxes = [];
    for (let k = 0; k < 5; k++) {
      boxes.push(JSON.stringify(await l.boundingBox()));
      await pg.waitForTimeout(100);
    }
    const info = await pg.evaluate(() => ({
      scrollY: window.scrollY,
      docH: document.documentElement.scrollHeight,
      toasts: document.querySelectorAll('[role="status"]').length,
      anims: document.getAnimations().filter((a) => a.playState === "running").length,
    }));
    console.log(`DEBUG ${tag}: ${shot}
  bbox: ${boxes.join(" | ")}
  info: ${JSON.stringify(info)}`);
    throw e;
  }
}

const browser = await chromium.launch(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

// ── identitas & pretest (2 soal sengaja dikosongkan → skor 80) ──
await page.goto(`${BASE}/mulai`);
await page.getByLabel("Nama atau nama panggilan", { exact: true }).fill("Ayu Lestari");
await page.getByLabel("Kelas", { exact: true }).fill("VIII A");
await page.getByRole("button", { name: "MASUK", exact: true }).click();
await page.getByRole("button", { name: "MENUJU GERBANG PRETEST" }).click();
await page.getByRole("button", { name: "MULAI PRETEST" }).click();
await exam(page, 10, "KUMPULKAN PRETEST", [7, 9]);
await page.getByText("HASIL UJI JEJAK AWAL").waitFor();
check("pretest via UI: skor 80", (await page.locator("text=dari 100").locator("..").innerText()).includes("80"));
await page.getByRole("button", { name: "LANJUTKAN PETUALANGAN" }).click();
await page.waitForURL(/\/camp/);

// ── 7 wilayah lewat UI ──
for (const r of REGIONS) {
  await page.goto(`${BASE}/wilayah/${r.id}`);
  await page.getByText(`WILAYAH ${r.code} dari 07 ·`).waitFor();
  for (const next of ["Konsep", "Rumus", "Contoh", "Waspada!", "Misi"]) {
    await page.getByRole("button", { name: next }).last().click();
    await page.waitForTimeout(200);
  }
  for (let i = 0; i < r.mission.questions.length; i++) {
    const q = await current(page, new RegExp(`Misi · Soal ${i + 1}/5`));
    await answer(page, q);
    await page.getByRole("button", { name: "PERIKSA" }).click();
    await page
      .getByText(/YEAH! Jawabanmu tepat!|Hampir!/)
      .first()
      .waitFor();
    const ok = await page.getByText("YEAH! Jawabanmu tepat!").isVisible();
    if (!ok) check(`misi wilayah ${r.code} soal ${q.id} dijawab benar`, false);
    await page.getByRole("button", { name: i === 4 ? "LIHAT HASIL" : "LANJUT" }).click();
  }
  await page.getByText("Misi berhasil!").waitFor();
  await click(page.getByRole("button", { name: "Ke Rangkuman" }), `rangkuman-${r.code}`);
  const before = await xpOf(page);
  await click(page.getByRole("button", { name: "SELESAIKAN WILAYAH" }), `selesai-${r.code}`);
  await page.getByText("Wilayah ini sudah selesai").waitFor();
  await page.waitForTimeout(300);
  const after = await xpOf(page);
  check(`Wilayah ${r.code} ${r.name}: misi 100 & selesai (+${after - before} XP)`, after - before === 100);
}

// ── Jungle Challenge 3 level ──
await page.goto(`${BASE}/challenge`);
for (const level of [1, 2, 3]) {
  await page.getByRole("button", { name: "Mulai level" }).first().click();
  await exam(page, 6, "KIRIM JAWABAN");
  await page.getByText(/Level ditaklukkan!|Belum lulus/).waitFor();
  check(`Jungle Challenge level ${level} ditaklukkan`, await page.getByText("Level ditaklukkan!").isVisible());
  await page.getByRole("button", { name: "Kembali ke Jungle Challenge" }).click();
}
check("pesan semua level ditaklukkan", await page.getByText("Semua level ditaklukkan!").isVisible());

// ── posttest ──
await page.goto(`${BASE}/posttest`);
await page.getByRole("button", { name: "MULAI POSTTEST" }).click();
await exam(page, 10, "KUMPULKAN POSTTEST");
await page.getByText("HASIL POSTTEST").waitFor();
check("posttest 100, selisih +20 dari pretest", (await page.getByText("+20").count()) > 0);
await page.getByRole("link", { name: /LIHAT HASIL BELAJAR/ }).click();
try {
  await page.getByRole("heading", { name: "Rapor Penjelajah" }).waitFor({ timeout: 10000 });
} catch (e) {
  await page.screenshot({ path: `${process.env.SHOTS ?? "."}/gagal-hasil.png` });
  console.log("DEBUG url:", page.url(), "| teks:", (await page.locator("main").innerText()).slice(0, 200).replace(/\s+/g, " "));
  throw e;
}
const misiRows = await page.locator("table").first().locator("tbody tr").allInnerTexts();
check(
  "hasil belajar: nilai misi 100 & selesai di ketujuh wilayah",
  misiRows.length === 7 && misiRows.every((t) => /100/.test(t) && /Selesai/.test(t)),
  misiRows[0]?.replace(/\s+/g, " "),
);
check("hasil belajar: identitas nama + kelas", (await page.getByText("Kelas VIII A").count()) > 0);
check("hasil belajar: ketiga level challenge lulus", (await page.getByText(/· lulus/).count()) === 3);
const stored = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("jejak-sang-eksponen") ?? "{}");
  const j = s.journeys.find((x) => x.id === s.activeJourneyId);
  return {
    missions: j.missions.length,
    missionAnswers: j.missions.every((m) => m.answers && m.questionIds?.length === 5),
    challengeAnswers: j.challenge.every((c) => c.answers && c.perQuestion?.length === 6),
    pretestAnswers: Object.keys(s.pretests[0].answers).length,
    posttestAnswers: Object.keys(s.posttests[0].answers).length,
  };
});
check(
  "tersimpan: jawaban misi (7×5), challenge (3×6), pretest, posttest",
  stored.missions === 7 && stored.missionAnswers && stored.challengeAnswers && stored.pretestAnswers === 8 && stored.posttestAnswers === 10,
  JSON.stringify(stored),
);
await page.getByRole("tab", { name: "Tabel" }).click();
check(
  "tabel perkembangan: pangkat negatif naik 0% → 100%",
  (await page.getByRole("row", { name: /Pangkat negatif/ }).innerText()).replace(/\s+/g, " ").includes("0% (0/1) 100% (1/1) +100"),
);

// ── profil, lencana, XP, persistensi ──
await page.goto(`${BASE}/profil`);
const xp = await xpOf(page);
check("total XP = 700 wilayah + 450 challenge + 150 posttest = 1300", xp === 1300, `${xp}`);
check("level 4 (≥ 900 XP)", (await page.getByText("Level 4").count()) > 0);
for (const b of [
  "Langkah Pertama",
  "Ahli Perkalian",
  "Master Pembagian",
  "Penjaga Gua Pangkat",
  "Pahlawan Pangkat Nol",
  "Penjelajah Pangkat Negatif",
  "Legenda Sang Eksponen",
]) {
  check(`lencana ${b}`, (await page.getByRole("img", { name: `Lencana ${b}`, exact: true }).count()) > 0);
}
await page.reload();
await page.getByText("KARTU PENJELAJAH").waitFor();
check("setelah reload XP tetap 1300", (await xpOf(page)) === 1300);
await page.goto(`${BASE}/riwayat`);
const rows = await page.locator("tbody tr").count();
check("riwayat aktivitas tercatat", rows >= 20, `${rows} baris`);
// ── ganti penjelajah tanpa password (perangkat dipakai bergantian) ──
await page.goto(`${BASE}/profil`);
await page.getByRole("button", { name: "Keluar / Ganti Penjelajah" }).click();
await page.getByText("sudah keluar").waitFor();
const urlKeluar = await page.waitForURL(/\/mulai$/, { timeout: 8000 }).then(() => page.url(), () => page.url());
check("keluar: kembali ke halaman masuk, progres tidak dihapus", urlKeluar.endsWith("/mulai"), urlKeluar);
await page.goto(`${BASE}/camp`);
await page.waitForURL(/\?next=/);
check("setelah keluar, Camp terkunci (perlu masuk)", true);
await page.goto(`${BASE}/mulai`);
await page.getByLabel("Nama atau nama panggilan", { exact: true }).fill("Budi");
await page.getByLabel("Kelas", { exact: true }).fill("VIII B");
await page.getByRole("button", { name: "MASUK", exact: true }).click();
check("siswa kedua (nama + kelas baru) diarahkan ke pretest", await page.getByRole("button", { name: "MENUJU GERBANG PRETEST" }).isVisible());
await page.getByRole("button", { name: "MENUJU GERBANG PRETEST" }).click();
await page.waitForURL(/\/pretest$/);
const activeInfo = () =>
  page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("jejak-sang-eksponen") ?? "{}");
    const j = d.journeys.find((x) => x.id === d.activeJourneyId);
    return { name: j?.explorer.name, kelas: j?.explorer.kelas, xp: j?.rewards.reduce((t, r) => t + r.xp, 0) };
  });
const budi = await activeInfo();
check("siswa kedua aktif dengan 0 XP (perjalanan terpisah)", budi.name === "Budi" && budi.kelas === "VIII B" && budi.xp === 0, JSON.stringify(budi));
await page.goto(`${BASE}/mulai`);
await page.getByLabel("Nama atau nama panggilan", { exact: true }).fill("  ayu lestari ");
await page.getByLabel("Kelas", { exact: true }).fill("viii-a");
await page.getByRole("button", { name: "MASUK", exact: true }).click();
check("siswa pertama masuk kembali dengan nama + kelas (tanpa password)", await page.getByText("Selamat datang kembali").isVisible());
await page.getByRole("button", { name: "LANJUTKAN PETUALANGAN" }).click();
await page.waitForURL(/\/camp/);
check("progres siswa pertama utuh (1300 XP)", (await xpOf(page)) === 1300);
await page.goto(`${BASE}/mulai`);
check("daftar penjelajah di perangkat menampilkan 2 siswa", (await page.getByRole("button", { name: /^Masuk sebagai/ }).count()) === 2);
await page.getByRole("button", { name: /^Masuk sebagai Budi/ }).click();
await page.waitForURL(/\/pretest$/);
const picked = await activeInfo();
check("memilih siswa dari daftar langsung berpindah ke Budi", picked.name === "Budi" && picked.xp === 0, JSON.stringify(picked));

check("tidak ada error JavaScript", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass}/${pass + fail} pemeriksaan perjalanan lulus`);
process.exit(fail ? 1 : 0);
