/**
 * Uji alur end-to-end JEJAK SANG EKSPONEN (mode tamu) dengan Playwright.
 * Jalankan server dulu: npm run build && npm start -- -p 3123
 * Lalu: node scripts/e2e.mjs [baseUrl] [folderScreenshot]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3123";
const OUT = process.argv[3] ?? "e2e-screens";
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
};

const browser = await chromium.launch(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {});
const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: false });
const noHScroll = async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const btn = (name) => page.getByRole("button", { name, exact: false });

// ── 1. Landing ──
await page.goto(BASE);
await page.getByText("SIAP MENEMUKAN RAHASIA").waitFor();
await shot("01-landing-mobile");
check("landing tanpa scroll horizontal (360px)", await noHScroll());
{
  const kartu = page.getByRole("region", { name: "Identitas pengembang" });
  const teks = (await kartu.innerText()).replace(/\s+/g, " ");
  check(
    "identitas pengembang tampil di halaman pembuka",
    ["Dikembangkan oleh:", "Masya Bantani", "Program Studi Pendidikan Matematika", "Fakultas Keguruan dan Ilmu Pendidikan", "Universitas Sultan Ageng Tirtayasa", "2026"].every((t) => teks.toLowerCase().includes(t.toLowerCase())),
    teks,
  );
  await kartu.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/00-identitas-pengembang.png` });
  const footer = (await page.locator("footer").last().innerText()).replace(/\s+/g, " ");
  const terpotong = await page.evaluate(() =>
    [...document.querySelectorAll("footer p span.inline-block")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.left < 0 || r.right > document.documentElement.clientWidth + 0.5;
    }).length,
  );
  check("footer identitas tidak terpotong di layar HP (360px)", terpotong === 0, `${terpotong} bagian terpotong`);
  await page.locator("footer").last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/00-footer-hp.png` });
  check("identitas pengembang ada di footer halaman pembuka", footer.includes("Masya Bantani") && footer.includes("Dikembangkan oleh:") && footer.includes("Universitas Sultan Ageng Tirtayasa"), footer);
}
await btn("LANJUTKAN JEJAK").click();
check("lanjutkan jejak tanpa progres menampilkan pesan ramah", await page.getByText("Belum ada jejak tersimpan").isVisible());
check("tombol akun nonaktif tanpa Supabase", await page.getByText("Mode akun belum dikonfigurasi").first().isVisible());

// ── 2. Guard tanpa identitas ──
await page.goto(`${BASE}/camp`);
await page.waitForURL(/\/\?next=/);
check("halaman camp tanpa identitas diarahkan ke beranda", page.url().includes("next=%2Fcamp"));

// ── 3. Identitas ──
await page.goto(`${BASE}/mulai`);
await btn("MASUK").first().click();
check("validasi nama kosong", await page.getByText("Nama penjelajah belum diisi").isVisible());
check("validasi kelas wajib", await page.getByText("Kelas belum diisi").isVisible());
await page.getByLabel("Nama atau nama panggilan", { exact: true }).fill("Dimas");
await page.getByLabel("Kelas", { exact: true }).fill("VIII A");
await btn("MASUK").first().click();
await btn("MENUJU GERBANG PRETEST").click();
await page.waitForURL(/\/pretest$/);

// ── 4. Pretest wajib sebelum materi ──
await page.goto(`${BASE}/peta`);
await page.waitForURL(/\/pretest$/);
check("peta terkunci sebelum pretest (redirect ke /pretest)", page.url().endsWith("/pretest"));
await page.getByText("SEBELUM MENJELAJAH").waitFor();
check("pretest tidak menampilkan rumus materi", !(await page.getByText("a^m × a^n").count()));
await shot("02-pretest-gate");
await btn("MULAI PRETEST").click();
// jawab 8 PG (7 benar, 1 salah) + 2 isian
const keys = ["B", "C", "C", "A", "C", "B", "B", "A"];
for (let i = 0; i < 8; i++) {
  await page.getByText(`Soal ${i + 1} dari 10`).waitFor();
  await page.waitForTimeout(300);
  await page.getByRole("radio").nth("ABCD".indexOf(keys[i])).click();
  await btn("Berikutnya").click();
}
await page.getByText("Soal 9 dari 10").waitFor();
await page.waitForTimeout(300);
await page.getByLabel("Jawaban").fill("4 x 4 x 4");
await btn("Berikutnya").click();
await page.getByText("Soal 10 dari 10").waitFor();
await page.waitForTimeout(300);
await shot("03-pretest-question");
await btn("KUMPULKAN PRETEST").click();
check("peringatan soal kosong muncul", await page.getByText("Masih ada soal kosong").isVisible());
await btn("Periksa lagi").click();
await page.getByLabel("Jawaban").fill("2³");
await btn("KUMPULKAN PRETEST").click();
await btn("Ya, kumpulkan").click();
await page.waitForURL(/\/pretest\/hasil/);
await page.getByText("HASIL UJI JEJAK AWAL").waitFor();
const score = await page.locator("text=dari 100").locator("..").innerText();
check("skor pretest 90 (9 benar)", score.includes("90"), score.replace(/\s+/g, " "));
await shot("04-pretest-result");
check("pretest dinilai oleh backend Python", (await page.locator('[data-graded-by="python"]').count()) === 1);
await btn("LANJUTKAN PETUALANGAN").click();
await page.waitForURL(/\/camp/, { timeout: 10000 });
await page.getByText("Halo, Dimas!").waitFor();
check("camp menampilkan nama penjelajah aktif", true);
check("pretest tidak memberi XP", (await page.locator("header").first().innerText()).includes("0 XP"));
await shot("05-camp-mobile");
check("identitas pengembang ada di footer halaman aplikasi (Camp)", (await page.locator('footer[aria-label="Identitas pengembang"]').innerText()).includes("Universitas Sultan Ageng Tirtayasa"));
check("camp tanpa scroll horizontal", await noHScroll());

// ── 5. Peta ──
await page.goto(`${BASE}/peta`);
await page.getByLabel(/Wilayah 01 FOREST CAMP, belum dimainkan/).waitFor();
check("wilayah 02 terkunci", (await page.getByLabel(/Wilayah 02 .*terkunci/).count()) === 1);
await shot("06-peta-mobile");
await page.getByLabel(/Wilayah 01 FOREST CAMP/).click();
await page.getByText("Tujuan pembelajaran:").waitFor();
await shot("07-peta-panel");
await page.getByRole("link", { name: /MULAI JELAJAH/ }).click();

// ── 6. Wilayah 01 lengkap ──
await page.waitForURL(/\/wilayah\/1/);
await page.getByText("WILAYAH 01 dari 07 ·").waitFor();
await shot("08-wilayah-pembuka");
for (const next of ["Konsep", "Rumus", "Contoh", "Waspada!", "Misi"]) {
  await page.getByRole("button", { name: next }).last().click();
  await page.waitForTimeout(250);
  if (next === "Rumus") await shot("09-wilayah-rumus");
}
// misi wilayah 1
await page.getByRole("radio").first().click(); // 3^4 (opsi diacak? tidak: urutan tetap di data)
await btn("PERIKSA").click();
await btn("LANJUT").click();
await page.getByLabel("Jawaban").fill("5^2");
await btn("PERIKSA").click();
await btn("LANJUT").click();
await page.getByLabel("Jawaban").fill("16");
await btn("PERIKSA").click();
await btn("LANJUT").click();
await page.getByRole("button", { name: /Bagian bawah/ }).click();
await btn("PERIKSA").click();
await btn("LANJUT").click();
await page.getByRole("button", { name: "SALAH" }).click();
await btn("PERIKSA").click();
await shot("10-misi-feedback");
await btn("LIHAT HASIL").click();
await page.getByText("Misi berhasil!").waitFor();
await btn("Ke Rangkuman").click();
await btn("SELESAIKAN WILAYAH").click();
await page.getByText("Wilayah ini sudah selesai").waitFor();
await page.waitForTimeout(400);
const xpAfter = await page.locator("header").first().innerText();
check("XP bertambah 100 setelah wilayah 01 selesai", xpAfter.includes("100 XP"), xpAfter.replace(/\s+/g, " "));
await page.reload();
await page.getByText("WILAYAH 01 dari 07 ·").waitFor();
const xpReload = await page.locator("header").first().innerText();
check("XP tidak bertambah setelah refresh", xpReload.includes("100 XP"));
await page.goto(`${BASE}/profil`);
check("lencana Langkah Pertama diperoleh", (await page.getByRole("img", { name: "Lencana Langkah Pertama" }).count()) > 0);
await page.goto(`${BASE}/peta`);
check("wilayah 02 terbuka setelah 01 selesai", (await page.getByLabel(/Wilayah 02 .*belum dimainkan/).count()) === 1);
await page.goto(`${BASE}/wilayah/3`);
check("wilayah 03 masih terkunci", await page.getByText("Wilayah 03 masih terkunci").isVisible());

// ── 7. Laboratorium ──
await page.goto(`${BASE}/lab`);
await page.getByLabel("Basis").first().fill("0");
await page.getByLabel("Pangkat").first().fill("0");
await btn("Bangun!").click();
check("lab: 0^0 tidak terdefinisi", await page.getByText(/tidak terdefinisi/).first().waitFor().then(() => true, () => false));
await page.getByLabel("Basis").first().fill("2");
await page.getByLabel("Pangkat").first().fill("-3");
await btn("Bangun!").click();
check("lab: 2^-3 = 1/8 sebagai pecahan", await page.getByText("1/8").first().waitFor().then(() => true, () => false));
check("lab: dihitung oleh backend Python", (await page.locator('[data-computed-by="python"]').count()) === 1);
await page.getByLabel("Pangkat").first().fill("1.5");
await btn("Bangun!").click();
check("lab: pangkat desimal ditolak", await page.getByText(/bilangan bulat/).first().waitFor().then(() => true, () => false));
await shot("11-lab");
await page.getByRole("tab", { name: /Anatomi/ }).click();
await page.getByLabel("Bagian pangkat").click();
check("lab: anatomi menampilkan penjelasan pangkat", await page.getByText("Pangkat (eksponen)").first().isVisible());
await page.getByRole("tab", { name: /Animasi/ }).click();
await btn("Mulai").click();
await page.waitForTimeout(2200);
check("lab: animasi berjalan langkah demi langkah", (await page.getByText(/Langkah 2/).count()) > 0);
await btn("Jeda").click().catch(() => {});

// ── 8. Latihan & game ──
await page.goto(`${BASE}/latihan`);
await btn("MULAI LATIHAN").click();
await page.getByText(/Soal 1\/10/).waitFor();
check("latihan dimulai dengan 10 soal acak", true);
await shot("12-latihan");
await page.goto(`${BASE}/game`);
await shot("13-game-hub");
await page.goto(`${BASE}/game/mystery-chest`);
await btn("MAIN SEKARANG").click();
await page.getByText("Petunjuk kode peti").waitFor();
await shot("14-mystery-chest");
check("mini-game dapat dimulai", true);

// ── 9. Simulasi seluruh wilayah + challenge selesai, lalu posttest ──
await page.evaluate(() => {
  const k = "jejak-sang-eksponen";
  const s = JSON.parse(localStorage.getItem(k));
  const j = s.journeys.find((x) => x.id === s.activeJourneyId);
  for (let r = 1; r <= 7; r++) j.regions[r] = { read: ["pembuka", "konsep", "rumus", "contoh", "waspada", "misi", "rangkuman"], missionBest: 100, completedAt: new Date().toISOString() };
  for (let l = 1; l <= 3; l++) j.challenge.push({ id: "c" + l, at: new Date().toISOString(), level: l, score: 100, correct: 6, total: 6, passed: true });
  localStorage.setItem(k, JSON.stringify(s));
});
await page.goto(`${BASE}/posttest`);
await btn("MULAI POSTTEST").click();
const pkeys = ["C", "B", "C", "B", "C", "B", "D", "B"];
for (let i = 0; i < 8; i++) {
  await page.getByText(`Soal ${i + 1} dari 10`).waitFor();
  await page.waitForTimeout(300);
  await page.getByRole("radio").nth("ABCD".indexOf(pkeys[i])).click();
  await btn("Berikutnya").click();
}
await page.getByText("Soal 9 dari 10").waitFor();
await page.waitForTimeout(300);
await page.getByLabel("Jawaban").fill("5×5×5×5");
await btn("Berikutnya").click();
await page.getByText("Soal 10 dari 10").waitFor();
await page.waitForTimeout(300);
await page.getByLabel("Jawaban").fill("3^3");
await btn("KUMPULKAN POSTTEST").click();
await btn("Ya, kumpulkan").click();
await page.waitForURL(/\/posttest\/hasil/);
await page.getByText("HASIL POSTTEST").waitFor();
check("posttest 100 dan selisih +10 terhadap pretest", (await page.getByText("+10").count()) > 0);
await shot("15-posttest-result");
await page.goto(`${BASE}/perkembangan`);
await page.getByRole("heading", { name: "Rapor Penjelajah" }).waitFor();
await page.waitForTimeout(800);
await shot("16-perkembangan");
check("halaman perkembangan menampilkan grafik", (await page.locator(".recharts-surface").count()) > 0);
check("lencana Legenda muncul setelah challenge & temple", (await page.goto(`${BASE}/profil`), (await page.getByRole("img", { name: "Lencana Legenda Sang Eksponen" }).count()) > 0));

// ── 10. Tablet & desktop ──
for (const [w, h, tag] of [[360, 780, "hp"], [768, 1024, "tablet"], [1280, 800, "laptop"]]) {
  await page.setViewportSize({ width: w, height: h });
  for (const p of ["/", "/mulai", "/camp", "/peta", "/wilayah/2", "/lab", "/latihan", "/game", "/challenge", "/perkembangan", "/profil", "/riwayat", "/karakter"]) {
    await page.goto(BASE + p);
    await page.waitForTimeout(600);
    const ok = await noHScroll();
    check(`tanpa scroll horizontal ${tag} ${p}`, ok);
    await shot(`20-${tag}${p.replace(/\//g, "-") || "-home"}`);
  }
}

const realErrors = errors.filter((e) => !/favicon|Download the React DevTools/.test(e));
check("tidak ada error JavaScript di konsol", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} pemeriksaan lulus`);
process.exit(failed ? 1 : 0);

