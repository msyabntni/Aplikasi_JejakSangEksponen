/**
 * Uji efek suara (file milik pengguna) — Playwright + Microsoft Edge/Chromium.
 * node scripts/sfx-e2e.mjs [baseUrl]      (E2E_CHANNEL=msedge)
 * Memeriksa: URL file pengguna dipakai, volume 60–75% (> musik), klik/benar/salah/lencana
 * berbunyi sesuai aktivitas, tidak bertumpuk, tombol suara OFF, dan musik latar tidak berubah.
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3123";
const FILE = {
  correct: "1794662801605-ce192545-cc76-4092-b143-3f5644b2d74b.mp3",
  wrong: "1794662829499-43897551-516a-4dd5-a840-b694017d08be.mp3",
  badge: "1794662945511-d49936df-757f-42fb-9717-6e857d461a86.mp3",
  tap: "1794663109835-7b9e8038-4e5e-41b0-8474-089635da03b6.mp3",
  done: "1794668451189-427d1fe6-39ad-46d0-a553-05749fc11f95.mp3",
};
const MUSIC = "1794652154846-925cd5a1-20e2-48c0-a981-291eb73a030c.mp3";
let pass = 0, fail = 0;
const check = (n, ok, x = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`); };

const browser = await chromium.launch({ ...(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {}), args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// rekam setiap pemutaran audio
await page.addInitScript(() => {
  window.__log = [];
  const asli = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const sfx = this.dataset?.sfx || null;
    if (sfx) {
      window.__sfxEls = window.__sfxEls || new Set();
      window.__sfxEls.add(this);
      const berbunyi = [...window.__sfxEls].filter((a) => a !== this && !a.paused).map((a) => a.dataset.sfx);
      window.__log.push({ sfx, src: this.src, mulai: this.currentTime, vol: this.volume, lainBerbunyi: berbunyi, musikJalan: !!(window.__jseMusic && !window.__jseMusic.paused), t: performance.now() });
    }
    return asli.call(this);
  };
  window.__pauses = [];
  const asliPause = HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.pause = function () {
    if (this.dataset?.sfx) window.__pauses.push(`${this.dataset.sfx}@${this.currentTime.toFixed(2)}`);
    return asliPause.call(this);
  };
});
const ambilLog = () => page.evaluate(() => window.__log.splice(0));
const musik = () => page.evaluate(() => { const a = window.__jseMusic; return a ? { src: a.src, vol: Math.round(a.volume * 100), jalan: !a.paused, loop: a.loop } : null; });

// ── 1. halaman pembuka: musik tetap seperti semula ──
await page.goto(BASE);
await page.waitForFunction(() => window.__jseMusic && !window.__jseMusic.paused, null, { timeout: 20000 }).catch(() => {});
let m = await musik();
check("musik latar tetap file & volume yang sama (18%, loop)", m && m.src.endsWith(MUSIC) && m.vol === 18 && m.loop && m.jalan, JSON.stringify(m));
await ambilLog();

// ── 2. klik tombol ──
await page.getByRole("link", { name: /MULAI PETUALANGAN/ }).first().click();
await page.waitForURL(/\/mulai/);
await page.waitForTimeout(300);
let log = await ambilLog();
const taps = log.filter((l) => l.sfx === "tap");
check("klik tombol → tepat 1 suara klik", taps.length === 1, `${taps.length} kali`);
check("suara klik memakai file pengguna", taps[0]?.src.endsWith(FILE.tap), taps[0]?.src);
check("klik diputar dari klik pertama (detik ±1,02, tanpa jeda)", taps[0] && Math.abs(taps[0].mulai - 1.02) < 0.05, `mulai ${taps[0]?.mulai}`);
check("volume efek 60–75% dan lebih keras dari musik (18%)", taps[0] && taps[0].vol >= 0.6 && taps[0].vol <= 0.75, `vol ${taps[0]?.vol}`);
check("musik latar tetap berjalan saat suara klik", taps[0]?.musikJalan === true);

// klik cepat beruntun → tidak bertumpuk
for (let i = 0; i < 4; i++) await page.getByLabel("Kelas", { exact: true }).click();
await page.getByRole("button", { name: "MASUK", exact: true }).click();
await page.getByRole("button", { name: "MASUK", exact: true }).click();
await page.waitForTimeout(400);
log = await ambilLog();
check("klik beruntun tidak bertumpuk (tidak ada efek lain yang ikut berbunyi)", log.every((l) => l.lainBerbunyi.length === 0), JSON.stringify(log.map((l) => l.lainBerbunyi)));
check("input teks bukan tombol → tanpa suara klik", log.filter((l) => l.sfx === "tap").length === 2, `${log.filter((l) => l.sfx === "tap").length} klik untuk 2 tombol`);

// ── 3. jawaban benar & salah (misi Wilayah 01) ──
await page.evaluate(() => {
  const now = new Date().toISOString();
  localStorage.setItem("jejak-sang-eksponen", JSON.stringify({
    version: 2, activeJourneyId: "j1",
    journeys: [{ id: "j1", startedAt: now, explorer: { name: "Suara", kelas: "VIII A", avatar: "daun", createdAt: now }, regions: {}, rewards: [], practice: [], games: [], gamesWon: [], labTried: [], challenge: [], missions: [], activity: [], seenBadges: [], seenLevel: 1 }],
    pretests: [{ id: "p", journeyId: "j1", explorerName: "Suara", startedAt: now, finishedAt: now, answers: {}, perQuestion: [], correct: 5, wrong: 5, score: 50, byIndicator: {} }],
    posttests: [], settings: { sound: true, motion: "auto", music: true, musicVolume: 0.18 }, importedTo: [],
  }));
});
await page.goto(`${BASE}/wilayah/1`);
await page.getByText("WILAYAH 01 dari 07 ·").waitFor();
await page.getByRole("button", { name: "Misi" }).first().click();
await page.getByText(/Misi · Soal 1\/5/).waitFor();
await page.waitForTimeout(400);
await page.locator('[data-qid="m1-1"]').getByRole("radio").nth(0).click();
await page.waitForTimeout(300); // biarkan bunyi klik pilihan jawaban tercatat dulu
await ambilLog();
await page.getByRole("button", { name: "PERIKSA" }).click();
await page.waitForTimeout(400);
log = await ambilLog();
check("jawaban benar → suara 'benar' dari file pengguna", log.length === 1 && log[0].sfx === "correct" && log[0].src.endsWith(FILE.correct), JSON.stringify(log.map((l) => l.sfx)));
check("tombol PERIKSA tidak ikut berbunyi klik (tidak bertumpuk)", !log.some((l) => l.sfx === "tap"));
await page.getByRole("button", { name: "LANJUT" }).click();
await page.getByText(/Misi · Soal 2\/5/).waitFor();
await page.waitForTimeout(400);
await page.locator('[data-qid="m1-2"]').getByLabel("Jawaban").fill("7");
await page.waitForTimeout(300);
await ambilLog();
await page.getByRole("button", { name: "PERIKSA" }).click();
await page.waitForTimeout(400);
log = await ambilLog();
check("jawaban salah → suara 'salah' dari file pengguna", log.length === 1 && log[0].sfx === "wrong" && log[0].src.endsWith(FILE.wrong), JSON.stringify(log.map((l) => l.sfx)));
check("suara salah volume 60–75%", log[0] && log[0].vol >= 0.6 && log[0].vol <= 0.75, `${log[0]?.vol}`);
// klik saat suara 'salah' masih berbunyi → klik dilewati, tidak bertumpuk
await page.getByRole("button", { name: "LANJUT" }).click();
await page.waitForTimeout(300);
log = await ambilLog();
check("klik saat suara 'salah' berbunyi tidak menumpuk", !log.some((l) => l.sfx === "tap"), JSON.stringify(log.map((l) => l.sfx)));

// ── 4. lencana ──
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("jejak-sang-eksponen"));
  s.journeys[0].regions = { 1: { read: ["pembuka", "konsep", "rumus", "contoh", "waspada", "misi", "rangkuman"], missionBest: 100 } };
  localStorage.setItem("jejak-sang-eksponen", JSON.stringify(s));
});
await page.goto(`${BASE}/wilayah/1`);
await page.getByText("WILAYAH 01 dari 07 ·").waitFor();
await page.getByRole("button", { name: "Rangkuman" }).first().click();
await page.waitForTimeout(400);
await ambilLog();
await page.getByRole("button", { name: "SELESAIKAN WILAYAH" }).click();
await page.getByText("Lencana baru: Langkah Pertama").waitFor();
await page.waitForTimeout(300);
log = await ambilLog();
check("dapat lencana → suara 'lencana' dari file pengguna (sekali)", log.filter((l) => l.sfx === "badge").length === 1 && log.find((l) => l.sfx === "badge").src.endsWith(FILE.badge), JSON.stringify(log.map((l) => l.sfx)));
check("lencana dimulai dari frasa pembuka (±0,55 s)", Math.abs((log.find((l) => l.sfx === "badge")?.mulai ?? 9) - 0.55) < 0.05);
check("tombol SELESAIKAN tidak ikut berbunyi klik", !log.some((l) => l.sfx === "tap"));
const tBadge = log.find((l) => l.sfx === "badge")?.t ?? 0;
await page.getByRole("button", { name: "Pembuka" }).first().click(); // klik tombol saat lencana berbunyi
await page.waitForTimeout(300);
log = await ambilLog();
check("klik saat suara lencana berbunyi tidak menumpuk", !log.some((l) => l.sfx === "tap"), JSON.stringify(log.map((l) => l.sfx)));
const tungguSampai = async (ms) => {
  const now = await page.evaluate(() => performance.now());
  if (tBadge + ms > now) await page.waitForTimeout(tBadge + ms - now);
};
const badgeJalan = () => page.evaluate(() => [...(window.__sfxEls || [])].some((a) => a.dataset.sfx === "badge" && !a.paused));
await tungguSampai(5000);
check("suara lencana masih berbunyi di detik ke-5", await badgeJalan(), "dihentikan: " + JSON.stringify(await page.evaluate(() => window.__pauses.slice(-4))));
await tungguSampai(11500);
const posisiAkhir = await page.evaluate(() => [...window.__sfxEls].find((a) => a.dataset.sfx === "badge")?.currentTime);
check("suara lencana berhenti setelah frasa pembuka (±9,7 s), tidak 64 s", !(await badgeJalan()) && posisiAkhir > 9 && posisiAkhir < 10.5, `berhenti di detik ${posisiAkhir?.toFixed(2)} file`);
m = await musik();
check("musik latar tetap berjalan & volume 18% selama efek suara", m.jalan && m.vol === 18, JSON.stringify(m));

// ── 5. tombol suara OFF ──
await page.getByRole("button", { name: "Matikan suara" }).click();
await page.waitForTimeout(300);
await ambilLog();
await page.getByRole("link", { name: /Peta/ }).first().click();
await page.waitForTimeout(500);
log = await ambilLog();
check("tombol 'Matikan suara' → tidak ada efek suara", log.length === 0, JSON.stringify(log.map((l) => l.sfx)));
m = await musik();
check("mematikan efek suara tidak mematikan musik latar", m.jalan && m.vol === 18);
await page.getByRole("button", { name: "Hidupkan suara" }).click();
await page.waitForTimeout(300);
await ambilLog();
await page.getByRole("link", { name: /Lab/ }).first().click();
await page.waitForTimeout(400);
log = await ambilLog();
check("suara dihidupkan lagi → klik tombol berbunyi", log.some((l) => l.sfx === "tap"), JSON.stringify(log.map((l) => l.sfx)));

// ── 6. suara "soal selesai": hanya saat SELURUH rangkaian soal selesai ──
const siapkan = (pretest) =>
  page.evaluate((pretest) => {
    const now = new Date().toISOString();
    localStorage.setItem("jejak-sang-eksponen", JSON.stringify({
      version: 2, activeJourneyId: "j1",
      journeys: [{ id: "j1", startedAt: now, explorer: { name: "Selesai", kelas: "VIII A", avatar: "daun", createdAt: now }, regions: {}, rewards: [], practice: [], games: [], gamesWon: [], labTried: [], challenge: [], missions: [], activity: [], seenBadges: [], seenLevel: 1 }],
      pretests: pretest ? [{ id: "p", journeyId: "j1", explorerName: "Selesai", startedAt: now, finishedAt: now, answers: {}, perQuestion: [], correct: 5, wrong: 5, score: 50, byIndicator: {} }] : [],
      posttests: [], settings: { sound: true, motion: "off", music: true, musicVolume: 0.18 }, importedTo: [],
    }));
  }, pretest);

// 6a. misi wilayah: 5 soal
await siapkan(true);
await page.goto(`${BASE}/wilayah/1`);
await page.getByText("WILAYAH 01 dari 07 ·").waitFor();
await page.getByRole("button", { name: "Misi" }).first().click();
const jawabMisi = [
  async () => page.locator('[data-qid="m1-1"]').getByRole("radio").nth(0).click(),
  async () => page.locator('[data-qid="m1-2"]').getByLabel("Jawaban").fill("5^2"),
  async () => page.locator('[data-qid="m1-3"]').getByLabel("Jawaban").fill("16"),
  async () => page.locator('[data-qid="m1-4"]').getByRole("button", { name: /^Bagian bawah/ }).click(),
  async () => page.locator('[data-qid="m1-5"]').getByRole("button", { name: "SALAH", exact: true }).click(),
];
await ambilLog();
const perSoal = [];
for (let i = 0; i < 5; i++) {
  await page.getByText(new RegExp(`Misi · Soal ${i + 1}/5`)).waitFor();
  await page.waitForTimeout(350);
  await jawabMisi[i]();
  await page.getByRole("button", { name: "PERIKSA" }).click();
  await page.waitForTimeout(250);
  perSoal.push(...(await ambilLog()).map((l) => l.sfx));
  if (i < 4) await page.getByRole("button", { name: "LANJUT" }).click();
}
check("selama mengerjakan 5 soal misi: tidak ada suara 'soal selesai'", !perSoal.includes("done"), perSoal.join(","));
await page.getByRole("button", { name: "LIHAT HASIL" }).click();
await page.getByText("Misi berhasil!").waitFor();
await page.waitForTimeout(400);
log = await ambilLog();
const doneMisi = log.filter((l) => l.sfx === "done");
check("misi selesai (semua soal) → suara 'soal selesai' dari file pengguna, sekali", doneMisi.length === 1 && doneMisi[0].src.endsWith(FILE.done), JSON.stringify(log.map((l) => l.sfx)));
check("suara 'soal selesai' tidak bertumpuk & volume 60–75%", doneMisi[0] && doneMisi[0].lainBerbunyi.length === 0 && doneMisi[0].vol >= 0.6 && doneMisi[0].vol <= 0.75, JSON.stringify(doneMisi[0]));
check("suara 'soal selesai' langsung berbunyi (mulai ±0,25 s)", doneMisi[0] && Math.abs(doneMisi[0].mulai - 0.25) < 0.05);
check("musik latar tetap berjalan saat 'soal selesai'", doneMisi[0]?.musikJalan === true);

// 6b. pretest: dikumpulkan
await siapkan(false);
await page.goto(`${BASE}/pretest`);
await page.getByRole("button", { name: "MULAI PRETEST" }).click();
await page.getByRole("button", { name: /^Soal 10/ }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "KUMPULKAN PRETEST" }).click();
await ambilLog();
await page.getByRole("button", { name: "Ya, kumpulkan" }).click();
await page.waitForURL(/\/pretest\/hasil/);
await page.waitForTimeout(400);
log = await ambilLog();
check("pretest dikumpulkan → suara 'soal selesai' sekali", log.filter((l) => l.sfx === "done").length === 1, JSON.stringify(log.map((l) => l.sfx)));

// 6c. mini-game: Wrong or Right (6 kasus)
await page.goto(`${BASE}/game/wrong-or-right`);
await page.getByRole("button", { name: "MAIN SEKARANG" }).click();
await ambilLog();
const selamaGame = [];
for (let c = 0; c < 6; c++) {
  await page.getByRole("button", { name: "BENAR", exact: true }).click();
  await page.waitForTimeout(150);
  selamaGame.push(...(await ambilLog()).map((l) => l.sfx));
  await page.getByRole("button", { name: /Kasus berikutnya|Lihat hasil/ }).click();
}
await page.getByText(/Kamu berhasil!|Hampir berhasil!/).waitFor();
await page.waitForTimeout(400);
log = await ambilLog();
check("selama 6 kasus mini-game: tidak ada suara 'soal selesai'", !selamaGame.includes("done"), selamaGame.join(","));
check("mini-game selesai → suara 'soal selesai' sekali", log.filter((l) => l.sfx === "done").length === 1, JSON.stringify(log.map((l) => l.sfx)));

check("tidak ada error JavaScript", errors.length === 0, errors.slice(0, 2).join(" | "));
await browser.close();
console.log(`\n${pass}/${pass + fail} pemeriksaan efek suara lulus`);
process.exit(fail ? 1 : 0);
