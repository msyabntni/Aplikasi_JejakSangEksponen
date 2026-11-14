/**
 * Memainkan keenam mini-game sampai halaman hasil (mode tamu).
 * node scripts/games-e2e.mjs [baseUrl]   (E2E_CHANNEL=msedge untuk memakai Edge)
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3123";
const browser = await chromium.launch(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let pass = 0, fail = 0;
const check = (n, ok, x = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`); };
const btn = (name) => page.getByRole("button", { name, exact: false });
const now = new Date().toISOString();

await page.goto(BASE);
await page.evaluate((now) => {
  localStorage.setItem("jejak-sang-eksponen", JSON.stringify({
    version: 2, activeJourneyId: "j1",
    journeys: [{ id: "j1", startedAt: now, explorer: { name: "Uji", kelas: "", avatar: "daun", createdAt: now }, regions: {}, rewards: [], practice: [], games: [], gamesWon: [], labTried: [], challenge: [], activity: [], seenBadges: [], seenLevel: 1 }],
    pretests: [{ id: "p", journeyId: "j1", explorerName: "Uji", startedAt: now, finishedAt: now, answers: {}, perQuestion: [], correct: 5, wrong: 5, score: 50, byIndicator: {} }],
    posttests: [], settings: { sound: false, motion: "off" }, importedTo: [],
  }));
}, now);

async function start(slug) {
  await page.goto(`${BASE}/game/${slug}`);
  await btn("MAIN SEKARANG").click();
}
const resultVisible = async () => page.getByText(/Kamu berhasil!|Hampir berhasil!/).isVisible();

// 1. Power Match — pasangkan berdasarkan isi kartu
await start("power-match");
for (let k = 0; k < 6; k++) {
  const cards = page.locator("button[aria-pressed]:not([disabled])");
  const texts = await cards.allInnerTexts();
  const sup = { "²": 2, "³": 3, "⁴": 4, "⁵": 5 };
  const norm = (t) => t.replace(/\s/g, "");
  let done = false;
  for (let a = 0; a < texts.length && !done; a++) {
    const t = norm(texts[a]);
    if (!t.includes("×")) continue;
    const parts = t.split("×");
    const target = `${parts[0]}${parts.length}`;
    for (let b = 0; b < texts.length; b++) {
      if (norm(texts[b]) === target) {
        await cards.nth(a).click();
        await cards.nth(b).click();
        done = true;
        break;
      }
    }
  }
  void sup;
  await page.waitForTimeout(250);
}
await page.waitForTimeout(1200);
check("Power Match sampai hasil (menang)", await page.getByText("Kamu berhasil!").isVisible());

// 2. Jungle Bridge — coba semua opsi sampai benar
await start("jungle-bridge");
for (let planks = 0; planks < 6; planks++) {
  for (let tryN = 0; tryN < 4; tryN++) {
    const radios = page.getByRole("radio");
    const tf = page.getByRole("button", { name: /^(BENAR|SALAH)$/ });
    if (await radios.count()) await radios.nth(tryN).click();
    else await tf.nth(tryN % 2).click();
    await btn("PASANG PAPAN").click();
    await page.waitForTimeout(350);
    if (!(await page.getByText("Papannya bergoyang").isVisible())) break;
  }
}
await page.waitForTimeout(2600);
check("Jungle Bridge sampai hasil (jembatan utuh)", await page.getByText("Kamu berhasil!").isVisible());

// 3. Exponent Puzzle — isi asal, periksa 2x, lewati
await start("exponent-puzzle");
for (let p = 0; p < 6; p++) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const pieces = page.locator("button.wood:not([disabled])");
    while (await page.getByRole("button", { name: "Slot kosong" }).count()) {
      await pieces.first().click();
      await page.waitForTimeout(80);
    }
    await btn("PERIKSA").click();
    await page.waitForTimeout(250);
    const solved = await page.getByRole("button", { name: /Teka-teki berikutnya|Lihat hasil/ }).count();
    if (solved) break;
    if (attempt === 0) {
      // kosongkan slot untuk percobaan kedua
      while (await page.getByRole("button", { name: /Slot berisi/ }).count()) {
        await page.getByRole("button", { name: /Slot berisi/ }).first().click();
        await page.waitForTimeout(60);
      }
    }
  }
  const nextBtn = page.getByRole("button", { name: /Teka-teki berikutnya|Lihat hasil|Lewati/ }).first();
  await nextBtn.click();
  await page.waitForTimeout(200);
}
check("Exponent Puzzle sampai hasil", await resultVisible());

// 4. Mystery Chest — 3 percobaan salah per peti
await start("mystery-chest");
for (let c = 0; c < 4; c++) {
  for (let t = 0; t < 3; t++) {
    if (!(await btn("BUKA PETI").count())) break;
    await btn("BUKA PETI").click();
    await page.waitForTimeout(150);
  }
  await page.getByRole("button", { name: /Peti berikutnya|Lihat hasil/ }).click();
}
check("Mystery Chest sampai hasil", await resultVisible());

// 5. Wrong or Right — selalu jawab BENAR
await start("wrong-or-right");
for (let c = 0; c < 6; c++) {
  await page.getByRole("button", { name: "BENAR" }).click();
  await page.getByRole("button", { name: /Kasus berikutnya|Lihat hasil/ }).click();
}
check("Wrong or Right sampai hasil", await resultVisible());

// 6. Rescue Naru — jawab pilihan pertama sampai selesai
await start("rescue-naru");
await btn("AYO SELAMATKAN NARU").click();
for (let s = 0; s < 12; s++) {
  if (await resultVisible()) break;
  const radios = page.getByRole("radio");
  if (await radios.count()) await radios.first().click();
  else await page.getByRole("button", { name: /^(BENAR|SALAH)$/ }).first().click();
  await btn("LOMPAT!").click();
  await page.getByRole("button", { name: /^Lanjut|Lihat hasil/ }).click();
  await page.waitForTimeout(150);
}
check("Rescue Naru sampai hasil", await resultVisible());

await btn("Main lagi").click();
check("tombol Main lagi memulai ulang", await btn("AYO SELAMATKAN NARU").isVisible());

const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("jejak-sang-eksponen")).journeys[0]);
check("hasil 6 game tersimpan", new Set(saved.games.map((g) => g.game)).size === 6, `${saved.games.length} catatan, menang: ${saved.gamesWon.join(", ")}`);
const xpGame = saved.rewards.filter((r) => r.key.startsWith("game:")).reduce((t, r) => t + r.xp, 0);
check("XP game hanya untuk kemenangan pertama", xpGame === saved.gamesWon.length * 80, `${xpGame} XP`);
check("tidak ada error JavaScript", errors.length === 0, errors.slice(0, 2).join(" | "));
await browser.close();
console.log(`\n${pass}/${pass + fail} pemeriksaan game lulus`);
process.exit(fail ? 1 : 0);
