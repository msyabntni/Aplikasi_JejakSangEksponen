/**
 * Uji musik latar (Playwright + Microsoft Edge/Chromium).
 * node scripts/music-e2e.mjs [baseUrl]     (E2E_CHANNEL=msedge)
 * Memeriksa: URL musik dapat diputar, autoplay, autoplay diblokir → tombol, volume awal 18%,
 * tombol ON/OFF, pengatur volume, musik tetap berjalan saat pindah halaman, pengaturan tersimpan.
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3123";
let pass = 0, fail = 0;
const check = (n, ok, x = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`); };
const launch = (policy) => chromium.launch({ ...(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {}), args: [`--autoplay-policy=${policy}`] });
const audio = (page) =>
  page.evaluate(() => {
    const a = window.__jseMusic;
    return a ? { src: a.currentSrc || a.src, paused: a.paused, t: a.currentTime, vol: Math.round(a.volume * 100), dur: a.duration, err: a.error && a.error.code } : null;
  });
const waitPlaying = (page, ms = 20000) => page.waitForFunction(() => window.__jseMusic && !window.__jseMusic.paused && window.__jseMusic.currentTime > 0.3, null, { timeout: ms }).then(() => true, () => false);

// ── 1. autoplay diizinkan browser ──
let browser = await launch("no-user-gesture-required");
let page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE);
check("musik otomatis diputar saat website dibuka", await waitPlaying(page));
await page.getByRole("button", { name: "Pengaturan musik latar" }).click();
{
  const bx = await page.getByRole("dialog", { name: "Musik latar" }).boundingBox();
  check("panel musik utuh di layar HP (beranda)", bx && bx.x >= 0 && bx.x + bx.width <= 390.5, bx ? `x=${Math.round(bx.x)}..${Math.round(bx.x + bx.width)}` : "tidak tampil");
  if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + "/musik-panel.png" });
}
await page.keyboard.press("Escape");
let a = await audio(page);
check("URL musik milik pengguna dipakai", a?.src.includes("mp3tourl.com/audio/1794652154846-925cd5a1"), a?.src);
check("file MP3 benar-benar terbaca (durasi valid)", a && Number.isFinite(a.dur) && a.dur > 10 && !a.err, `durasi ${a?.dur?.toFixed(1)} detik`);
check("volume awal 18% (rentang 15–20%)", a?.vol >= 15 && a?.vol <= 20, `${a?.vol}%`);
check("musik diputar berulang (loop)", await page.evaluate(() => window.__jseMusic.loop));
check("tombol musik menunjukkan status 'playing'", (await page.locator('[data-music-state="playing"]').count()) === 1);

// tetap berjalan saat berpindah halaman (navigasi di dalam aplikasi)
await page.waitForTimeout(1500);
const t1 = (await audio(page)).t;
await page.getByRole("link", { name: /MULAI PETUALANGAN/ }).first().click();
await page.waitForURL(/\/mulai/);
await page.getByLabel("Nama atau nama panggilan", { exact: true }).fill("Musik");
await page.getByLabel("Kelas", { exact: true }).fill("VIII A");
await page.getByRole("button", { name: "MASUK", exact: true }).click();
await page.getByRole("button", { name: "MENUJU GERBANG PRETEST" }).click();
await page.waitForURL(/\/pretest/);
await page.waitForTimeout(1000);
const t2 = await audio(page);
check("musik tetap berjalan & tidak mengulang dari awal setelah pindah 2 halaman", t2 && !t2.paused && t2.t > t1, `${t1.toFixed(1)}s → ${t2?.t.toFixed(1)}s`);

// ON/OFF + volume
await page.getByRole("button", { name: "Pengaturan musik latar" }).click();
check("panel musik menampilkan volume 18%", (await page.locator("[data-music-volume]").innerText()) === "18%");
const dalamLayar = async () => {
  const bx = await page.getByRole("dialog", { name: "Musik latar" }).boundingBox();
  return bx && bx.x >= 0 && bx.x + bx.width <= 390 + 0.5;
};
check("panel musik utuh di layar HP (halaman aplikasi)", await dalamLayar());
await page.getByRole("switch", { name: "Matikan musik latar" }).click();
await page.waitForTimeout(300);
check("tombol OFF menghentikan musik", (await audio(page)).paused);
await page.getByRole("switch", { name: "Hidupkan musik latar" }).click();
check("tombol ON memutar musik lagi", await waitPlaying(page, 8000));
await page.locator("#music-volume").fill("40");
await page.waitForTimeout(200);
check("pengatur volume mengubah volume (40%)", (await audio(page)).vol === 40);
await page.locator("#music-volume").fill("18");
await page.getByRole("switch", { name: "Matikan musik latar" }).click();
await page.reload();
await page.waitForTimeout(2500);
check("pengaturan OFF tersimpan setelah reload (musik tidak diputar)", (await audio(page)).paused);
check("volume tersimpan setelah reload", (await audio(page)).vol === 18);
await browser.close();

// ── 2. autoplay diblokir browser ──
browser = await launch("user-gesture-required");
page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (e) => errors.push(e.message));
// Pastikan pemblokiran selalu terjadi (seperti Safari iOS): play() ditolak sampai ada sentuhan/tombol.
await page.addInitScript(() => {
  let gesture = false;
  window.addEventListener("pointerdown", () => (gesture = true), true);
  window.addEventListener("keydown", () => (gesture = true), true);
  const asli = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    return gesture ? asli.call(this) : Promise.reject(new DOMException("Autoplay diblokir", "NotAllowedError"));
  };
});
await page.goto(BASE);
await page.waitForTimeout(2500);
check("autoplay diblokir: musik belum berbunyi", (await audio(page)).paused);
check("autoplay diblokir: tombol 'Putar musik latar' tampil", await page.getByRole("button", { name: "Putar musik latar" }).isVisible());
if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + "/musik-diblokir.png" });
await page.getByRole("button", { name: "Putar musik latar" }).click();
check("setelah tombol ditekan, musik diputar", await waitPlaying(page, 15000));
check("ajakan musik hilang setelah diputar", (await page.locator("[data-music-prompt]").count()) === 0);
if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + "/musik-setelah-putar.png" });
await browser.close();

check("tidak ada error JavaScript", errors.length === 0, errors.slice(0, 2).join(" | "));
console.log(`\n${pass}/${pass + fail} pemeriksaan musik lulus`);
process.exit(fail ? 1 : 0);
