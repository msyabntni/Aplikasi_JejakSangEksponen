/**
 * Audit maskot: ukuran Naru & Kaciro di setiap halaman, dan apakah maskot MENUTUPI
 * teks (per glyph), tombol, tautan, input, soal, atau rumus.
 * node scripts/mascot-audit.mjs [baseUrl] [folderScreenshot]     (E2E_CHANNEL=msedge)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3123";
const OUT = process.argv[3];
if (OUT) mkdirSync(OUT, { recursive: true });
const WIDTHS = [
  [360, 780, "hp"],
  [412, 900, "hp-besar"],
  [700, 1000, "tablet-kecil"],
  [768, 1024, "tablet"],
  [1280, 800, "laptop"],
];
const PAGES = ["/", "/mulai", "/auth/login", "/pretest", "/pretest/hasil", "/camp", "/peta", "/lab", "/latihan", "/game", "/game/power-match", "/challenge", "/posttest", "/posttest/hasil", "/perkembangan", "/profil", "/riwayat"];
const SECTIONS = ["Pembuka", "Konsep", "Rumus", "Contoh", "Waspada!", "Misi", "Rangkuman"];

const browser = await chromium.launch({ ...(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {}), args: ["--autoplay-policy=user-gesture-required"] });

function state() {
  const now = new Date().toISOString();
  const read = ["pembuka", "konsep", "rumus", "contoh", "waspada", "misi", "rangkuman"];
  const regions = {};
  for (let r = 1; r <= 7; r++) regions[r] = { read, missionBest: 100, completedAt: now };
  const att = (score) => ({ id: "a" + score, journeyId: "j1", explorerName: "Dimas", startedAt: now, finishedAt: now, answers: {}, perQuestion: Array(10).fill(true), correct: score / 10, wrong: 10 - score / 10, score, byIndicator: { negatif: [score > 80 ? 1 : 0, 1], perkalian: [1, 1] } });
  return {
    version: 2, activeJourneyId: "j1",
    journeys: [{ id: "j1", startedAt: now, explorer: { name: "Dimas", kelas: "VIII A", avatar: "daun", createdAt: now }, regions, rewards: [{ key: "region:1", xp: 100, gems: 3, at: now, repeat: false }], practice: [{ id: "x", at: now, level: 1, score: 80, correct: 8, total: 10 }], games: [], gamesWon: [], labTried: [], challenge: [1, 2, 3].map((l) => ({ id: "c" + l, at: now, level: l, score: 100, correct: 6, total: 6, passed: true })), missions: [], activity: [{ id: "a", at: now, type: "materi", title: "Mulai Wilayah 01", status: "dicoba" }], seenBadges: ["langkah-pertama", "ahli-perkalian", "master-pembagian", "penjaga-gua", "pahlawan-nol", "penjelajah-negatif"], seenLevel: 1 }],
    pretests: [att(80)], posttests: [att(100)],
    settings: { sound: false, motion: "off", music: false, musicVolume: 0.18 }, importedTo: [],
  };
}

/** Diukur di dalam halaman: maskot vs teks/kontrol. */
function ukur() {
  const isMascot = (el) => /^(Naru|Kaciro)/.test(el.getAttribute("aria-label") || "");
  const mascots = [...document.querySelectorAll('svg[role="img"]')].filter(isMascot).map((svg) => ({ svg, r: svg.getBoundingClientRect(), name: svg.getAttribute("aria-label").split(",")[0] }));
  // maskot yang tembus-klik (pointer-events:none) tetap harus terdeteksi oleh elementFromPoint
  const pe = mascots.map((m) => m.svg.style.pointerEvents);
  mascots.forEach((m) => (m.svg.style.pointerEvents = "auto"));
  const visible = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    return true;
  };
  const inter = (a, b) => {
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 3 && h > 3 ? w * h : 0;
  };
  // kotak teks per baris glyph
  const texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (!n.textContent.trim() || n.parentElement.closest("svg") || !visible(n.parentElement)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) texts.push({ r, label: n.textContent.trim().slice(0, 40), el: n.parentElement });
  }
  const isMascotSvg = (el) => { const s = el.closest('svg[role="img"]'); return s && isMascot(s); };
  const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="radio"], [role="switch"], [data-penanda], [data-qid], table')].filter((el) => visible(el) && !isMascotSvg(el) && (!el.closest("svg") || el.hasAttribute("data-penanda"))).map((el) => ({ r: el.getBoundingClientRect(), label: (el.getAttribute("aria-label") || (el.dataset.penanda ? "penanda " + el.dataset.penanda + " " + (el.closest("[aria-label]")?.getAttribute("aria-label") || "") : "") || el.textContent || el.tagName).trim().slice(0, 50), el }));
  const masalah = [];
  for (const m of mascots) {
    if (m.r.width < 2) continue;
    for (const t of [...texts, ...controls]) {
      if (t.el.contains(m.svg) || m.svg.contains(t.el)) continue;
      // maskot di dalam jendela pop-up wajar menutupi halaman di belakangnya
      const dlg = m.svg.closest('[role="dialog"]');
      if (dlg && !dlg.contains(t.el)) continue;
      // maskot hanya "menutupi" bila berada DI ATAS elemen tersebut pada titik tengah irisan
      const a = inter(m.r, t.r);
      if (!a) continue;
      const cx = (Math.max(m.r.left, t.r.left) + Math.min(m.r.right, t.r.right)) / 2;
      const cy = (Math.max(m.r.top, t.r.top) + Math.min(m.r.bottom, t.r.bottom)) / 2;
      const top = document.elementFromPoint(cx, cy);
      const onTop = top && (top === m.svg || m.svg.contains(top));
      if (onTop) masalah.push(`${m.name} menutupi "${t.label}"`);
    }
  }
  mascots.forEach((m, i) => (m.svg.style.pointerEvents = pe[i]));
  return {
    ukuran: mascots.filter((m) => m.r.width > 2).map((m) => `${m.name.split(" ")[0]}:${Math.round(m.r.width)}`),
    masalah: [...new Set(masalah)].slice(0, 6),
  };
}

let total = 0;
const ringkas = {};
for (const [w, h, tag] of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + "/");
  await page.evaluate((s) => localStorage.setItem("jejak-sang-eksponen", JSON.stringify(s)), state());
  const targets = [...PAGES.map((p) => ({ p })), ...SECTIONS.map((s) => ({ p: "/wilayah/2", s }))];
  for (const t of targets) {
    await page.goto(BASE + t.p);
    await page.waitForTimeout(700);
    if (t.s) {
      await page.getByRole("button", { name: t.s }).first().click();
      await page.waitForTimeout(500);
    }
    // ukur di seluruh tinggi halaman (gulir per layar)
    const tinggi = await page.evaluate(() => document.documentElement.scrollHeight);
    const hasil = { ukuran: new Set(), masalah: new Set() };
    for (let y = 0; y < tinggi; y += h - 120) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
      const r = await page.evaluate(ukur);
      r.ukuran.forEach((u) => hasil.ukuran.add(u));
      r.masalah.forEach((m) => hasil.masalah.add(m));
    }
    const key = t.s ? `/wilayah/2 [${t.s}]` : t.p;
    ringkas[key] ??= {};
    ringkas[key][tag] = { ukuran: [...hasil.ukuran].join(" "), masalah: [...hasil.masalah] };
    total += hasil.masalah.size;
    if (OUT && hasil.masalah.size) await page.screenshot({ path: `${OUT}/${tag}${key.replace(/[^a-z0-9]+/gi, "-")}.png`, fullPage: true });
  }
  await page.close();
}
// peta: Naru di setiap wilayah aktif (1–7), HP & laptop
for (const [w, h, tag] of [WIDTHS[0], WIDTHS[2]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + "/");
  for (let aktif = 1; aktif <= 7; aktif++) {
    const st = state();
    for (let r = 1; r <= 7; r++) if (r >= aktif) delete st.journeys[0].regions[r].completedAt;
    await page.evaluate((s) => localStorage.setItem("jejak-sang-eksponen", JSON.stringify(s)), st);
    await page.goto(BASE + "/peta");
    await page.waitForTimeout(700);
    const masalah = new Set();
    const tinggi = await page.evaluate(() => document.documentElement.scrollHeight);
    // peta ada di kontainer bergulir; gulir kontainer & halaman
    for (let y = 0; y < 2400; y += 300) {
      await page.evaluate((yy) => { const c = document.querySelector(".overflow-y-auto"); if (c) c.scrollTop = yy; window.scrollTo(0, Math.min(yy, 99999)); }, y);
      await page.waitForTimeout(80);
      (await page.evaluate(ukur)).masalah.forEach((m) => masalah.add(m));
    }
    void tinggi;
    const key = `/peta [Naru di wilayah ${aktif}]`;
    ringkas[key] ??= {};
    ringkas[key][tag] = { ukuran: "", masalah: [...masalah] };
    total += masalah.size;
  }
  await page.close();
}
await browser.close();
for (const [k, v] of Object.entries(ringkas)) {
  console.log(`\n${k}`);
  for (const [tag, r] of Object.entries(v)) console.log(`  ${tag.padEnd(6)} ukuran px: ${r.ukuran || "-"}${r.masalah.length ? "\n         MENUTUPI: " + r.masalah.join(" | ") : ""}`);
}
console.log(`\nTOTAL temuan maskot menutupi teks/kontrol: ${total}`);
process.exit(0);
