import { SAVE_VERSION } from "./types";

/** volume awal musik latar: 18% (lembut) */
export const MUSIC_DEFAULT_VOLUME = 0.18;

export const STORAGE_KEY = "jejak-sang-eksponen";

export function uid(prefix = "id") {
  const r = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${r}`;
}

export function emptySave() {
  return {
    version: SAVE_VERSION,
    activeJourneyId: null,
    journeys: [],
    pretests: [],
    posttests: [],
    settings: { sound: true, motion: "auto", music: true, musicVolume: MUSIC_DEFAULT_VOLUME },
    importedTo: [],
  };
}

export function newJourney(name, kelas = "", avatar = "daun") {
  const now = new Date().toISOString();
  return {
    id: uid("jr"),
    startedAt: now,
    explorer: { name, kelas, avatar, createdAt: now },
    regions: {},
    rewards: [],
    practice: [],
    games: [],
    gamesWon: [],
    labTried: [],
    challenge: [],
    missions: [],
    activity: [],
    seenBadges: [],
    seenLevel: 1,
  };
}

const isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);

/** Membersihkan satu journey agar semua field ada (data lama/rusak sebagian). */
function sanitizeJourney(j) {
  if (!isObj(j) || typeof j.id !== "string" || !isObj(j.explorer)) return null;
  const ex = j.explorer;
  const base = newJourney(String(ex.name ?? "Penjelajah"), String(ex.kelas ?? ""), String(ex.avatar ?? "daun"));
  return {
    ...base,
    id: j.id,
    startedAt: typeof j.startedAt === "string" ? j.startedAt : base.startedAt,
    explorer: { ...base.explorer, createdAt: String(ex.createdAt ?? base.startedAt) },
    pretestDraft: isObj(j.pretestDraft) ? j.pretestDraft : undefined,
    posttestDraft: isObj(j.posttestDraft) ? j.posttestDraft : undefined,
    regions: isObj(j.regions) ? j.regions : {},
    rewards: arr(j.rewards),
    practice: arr(j.practice),
    games: arr(j.games),
    gamesWon: arr(j.gamesWon),
    labTried: arr(j.labTried),
    challenge: arr(j.challenge),
    missions: arr(j.missions),
    activity: arr(j.activity),
    seenBadges: arr(j.seenBadges),
    seenLevel: typeof j.seenLevel === "number" ? j.seenLevel : 1,
  };
}

/**
 * Migrasi data dari versi lama.
 * v1 (rilis awal): satu perjalanan datar { version:1, explorer, regions, rewards, ... , pretests }
 * v2: banyak perjalanan (journeys) + riwayat pretest/posttest global.
 */
export function migrate(raw) {
  if (!isObj(raw)) return emptySave();
  let data = raw;
  const version = typeof data.version === "number" ? data.version : 1;

  if (version < 2) {
    const fresh = emptySave();
    if (isObj(data.explorer)) {
      const j = sanitizeJourney({ ...data, id: uid("jr") });
      if (j) {
        fresh.journeys = [j];
        fresh.activeJourneyId = j.id;
      }
    }
    // percobaan lama belum punya journeyId: hubungkan ke perjalanan hasil migrasi
    const jid = fresh.activeJourneyId ?? "";
    const link = (x) => (isObj(x) ? { ...x, journeyId: typeof x.journeyId === "string" ? x.journeyId : jid } : x);
    fresh.pretests = arr(data.pretests).map(link);
    fresh.posttests = arr(data.posttests).map(link);
    if (isObj(data.settings)) fresh.settings = { ...fresh.settings, ...data.settings };
    data = fresh;
  }

  const out = emptySave();
  out.journeys = arr(data.journeys)
    .map(sanitizeJourney)
    .filter((j) => j !== null);
  out.activeJourneyId = typeof data.activeJourneyId === "string" && out.journeys.some((j) => j.id === data.activeJourneyId) ? data.activeJourneyId : null;
  out.pretests = arr(data.pretests);
  out.posttests = arr(data.posttests);
  out.importedTo = arr(data.importedTo);
  if (isObj(data.settings)) {
    const s = data.settings;
    out.settings = {
      sound: typeof s.sound === "boolean" ? s.sound : true,
      motion: s.motion === "on" || s.motion === "off" ? s.motion : "auto",
      music: typeof s.music === "boolean" ? s.music : true,
      musicVolume: typeof s.musicVolume === "number" && s.musicVolume >= 0 && s.musicVolume <= 1 ? s.musicVolume : MUSIC_DEFAULT_VOLUME,
    };
  }
  return out;
}

export function loadSave(key = STORAGE_KEY) {
  if (typeof window === "undefined") return emptySave();
  let text = null;
  try {
    text = window.localStorage.getItem(key);
  } catch {
    return emptySave();
  }
  if (!text) return emptySave();
  try {
    return migrate(JSON.parse(text));
  } catch {
    // data rusak: simpan cadangan lalu mulai bersih tanpa error
    try {
      window.localStorage.setItem(`${key}:rusak:${Date.now()}`, text);
    } catch {
      /* abaikan */
    }
    return emptySave();
  }
}

export function persistSave(data, key = STORAGE_KEY) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* penyimpanan penuh / diblokir: abaikan agar aplikasi tetap jalan */
  }
}
