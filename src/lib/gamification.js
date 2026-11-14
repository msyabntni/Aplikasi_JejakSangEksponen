/** XP & permata untuk penyelesaian PERTAMA setiap jenis aktivitas. Pretest = 0. */
export const REWARDS = {
  region: { xp: 100, gems: 3 },
  practice: { xp: 60, gems: 2 },
  game: { xp: 80, gems: 3 },
  labExperiment: { xp: 10, gems: 0 },
  labAll: { xp: 50, gems: 2 },
  challenge: { 1: { xp: 100, gems: 3 }, 2: { xp: 150, gems: 4 }, 3: { xp: 200, gems: 5 } },
  posttest: { xp: 150, gems: 5 },
  /** mengulang aktivitas yang sudah selesai: XP kecil, maksimal sekali per hari */
  repeat: { xp: 5, gems: 0 },
};

export const LEVELS = [
  { level: 1, xp: 0, title: "Tunas Penjelajah" },
  { level: 2, xp: 200, title: "Pencari Jejak" },
  { level: 3, xp: 500, title: "Pengintai Hutan" },
  { level: 4, xp: 900, title: "Penjaga Rimba" },
  { level: 5, xp: 1400, title: "Pemecah Kode" },
  { level: 6, xp: 2000, title: "Ahli Eksponen" },
  { level: 7, xp: 2700, title: "Legenda Hutan" },
];

export function levelFor(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  const next = LEVELS.find((l) => l.xp > xp) ?? null;
  const progress = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { ...cur, next, progress };
}

export function totals(rewards) {
  return rewards.reduce((t, r) => ({ xp: t.xp + r.xp, gems: t.gems + r.gems }), { xp: 0, gems: 0 });
}

const dayOf = (iso) => iso.slice(0, 10);

/**
 * Menambahkan hadiah secara idempoten.
 * - key belum pernah ada  -> hadiah penuh
 * - key sudah ada         -> hadiah ulang kecil, maks. sekali per hari
 * Mengembalikan entry baru atau null bila tidak ada hadiah.
 */
export function rewardFor(rewards, key, full, now = new Date().toISOString()) {
  const first = rewards.some((r) => r.key === key && !r.repeat);
  if (!first) return { key, xp: full.xp, gems: full.gems, at: now, repeat: false };
  const repeatedToday = rewards.some((r) => r.key === key && r.repeat && dayOf(r.at) === dayOf(now));
  if (repeatedToday) return null;
  return { key, xp: REWARDS.repeat.xp, gems: REWARDS.repeat.gems, at: now, repeat: true };
}

export const GAME_IDS = ["power-match", "jungle-bridge", "exponent-puzzle", "mystery-chest", "wrong-or-right", "rescue-naru"];
export const LAB_IDS = ["builder", "multiplier", "divider", "power", "zero-negative", "anatomy", "slider", "animation"];

export function regionDone(j, id) {
  return Boolean(j.regions[id]?.completedAt);
}

export function challengeLevelsPassed(j) {
  return [1, 2, 3].filter((l) => j.challenge.some((c) => c.level === l && c.passed));
}

export const BADGES = [
  {
    id: "langkah-pertama",
    name: "Langkah Pertama",
    desc: "Menyelesaikan Wilayah 01 Forest Camp.",
    color: "#62A66B",
    icon: "footprint",
    earned: (j) => regionDone(j, 1),
  },
  {
    id: "ahli-perkalian",
    name: "Ahli Perkalian",
    desc: "Menyelesaikan Wilayah 02 dan latihannya.",
    color: "#F39B57",
    icon: "times",
    earned: (j) => regionDone(j, 2),
  },
  {
    id: "master-pembagian",
    name: "Master Pembagian",
    desc: "Menyelesaikan Wilayah 03 dan latihannya.",
    color: "#8ED6E8",
    icon: "divide",
    earned: (j) => regionDone(j, 3),
  },
  {
    id: "penjaga-gua",
    name: "Penjaga Gua Pangkat",
    desc: "Menyelesaikan Wilayah 04 Power Cave.",
    color: "#9b7fd1",
    icon: "cave",
    optional: true,
    earned: (j) => regionDone(j, 4),
  },
  {
    id: "pahlawan-nol",
    name: "Pahlawan Pangkat Nol",
    desc: "Menyelesaikan Wilayah 05 dan latihannya.",
    color: "#F4D77A",
    icon: "zero",
    earned: (j) => regionDone(j, 5),
  },
  {
    id: "penjelajah-negatif",
    name: "Penjelajah Pangkat Negatif",
    desc: "Menyelesaikan Wilayah 06 dan latihannya.",
    color: "#5f8fb8",
    icon: "mountain",
    earned: (j) => regionDone(j, 6),
  },
  {
    id: "legenda",
    name: "Legenda Sang Eksponen",
    desc: "Menyelesaikan Treasure Temple dan Jungle Challenge.",
    color: "#e0b43c",
    icon: "crown",
    earned: (j) => regionDone(j, 7) && challengeLevelsPassed(j).length === 3,
  },
  {
    id: "peneliti-lab",
    name: "Peneliti Laboratorium",
    desc: "Mencoba seluruh eksperimen Laboratorium.",
    color: "#4fb3a9",
    icon: "flask",
    optional: true,
    earned: (j) => LAB_IDS.every((id) => j.labTried.includes(id)),
  },
  {
    id: "jagoan-game",
    name: "Jagoan Mini-Game",
    desc: "Menyelesaikan keenam mini-game.",
    color: "#e57f9a",
    icon: "gamepad",
    optional: true,
    earned: (j) => GAME_IDS.every((id) => j.gamesWon.includes(id)),
  },
];

export function earnedBadges(j) {
  return BADGES.filter((b) => b.earned(j)).map((b) => b.id);
}
