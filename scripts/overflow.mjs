/** Mencari elemen yang melebihi lebar layar (debug responsif). node scripts/overflow.mjs <url> [lebar] */
import { chromium } from "playwright";

const url = process.argv[2];
const width = Number(process.argv[3] ?? 360);
const browser = await chromium.launch(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {});
const page = await browser.newPage({ viewport: { width, height: 800 } });
await page.goto("http://localhost:3123/");
await page.evaluate(() => {
  localStorage.setItem(
    "jejak-sang-eksponen",
    JSON.stringify({
      version: 2,
      activeJourneyId: "j1",
      journeys: [{ id: "j1", startedAt: "2026-01-01T00:00:00Z", explorer: { name: "Dimas", kelas: "", avatar: "daun", createdAt: "" }, regions: {}, rewards: [], practice: [], games: [], gamesWon: [], labTried: [], challenge: [], activity: [], seenBadges: [], seenLevel: 1 }],
      pretests: [{ id: "p", journeyId: "j1", explorerName: "Dimas", startedAt: "", finishedAt: "", answers: {}, perQuestion: [], correct: 5, wrong: 5, score: 50, byIndicator: {} }],
      posttests: [],
      settings: { sound: false, motion: "off" },
      importedTo: [],
    }),
  );
});
await page.goto(url);
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const W = document.documentElement.clientWidth;
  const res = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.right > W + 1 && r.width > 0) {
      let clipped = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX !== "visible" && p !== document.body && p !== document.documentElement) { clipped = true; break; }
      }
      if (!clipped) res.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 80)} right=${Math.round(r.right)}`);
    }
  }
  return { W, scroll: document.documentElement.scrollWidth, res: res.slice(0, 15) };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
