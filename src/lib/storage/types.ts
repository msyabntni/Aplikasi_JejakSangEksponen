import type { AnswerValue, Difficulty, Indicator, RegionId } from "../types";

export const SAVE_VERSION = 2;

export interface Explorer {
  name: string;
  kelas: string;
  avatar: string;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  journeyId: string;
  explorerName: string;
  startedAt: string;
  finishedAt: string;
  answers: Record<string, AnswerValue>;
  perQuestion: boolean[];
  correct: number;
  wrong: number;
  score: number;
  /** indikator -> [benar, total] */
  byIndicator: Partial<Record<Indicator, [number, number]>>;
}

export interface ExamDraft {
  startedAt: string;
  answers: Record<string, AnswerValue>;
  current: number;
}

export interface RegionProgress {
  /** id bagian materi yang sudah dibuka/dibaca */
  read: string[];
  /** skor terbaik misi interaktif wilayah (0–100) */
  missionBest: number;
  completedAt?: string;
  lastVisitedAt?: string;
}

/** Catatan hadiah (ledger). XP & permata total = jumlah ledger. */
export interface RewardEntry {
  key: string; // penanda unik aktivitas
  xp: number;
  gems: number;
  at: string;
  repeat: boolean;
}

export interface ScoreRecord {
  id: string;
  at: string;
  score: number;
  correct: number;
  total: number;
  detail?: string;
  /** jawaban siswa per id soal (urutan soal = questionIds) */
  answers?: Record<string, AnswerValue>;
  questionIds?: string[];
  /** benar/salah per soal */
  perQuestion?: boolean[];
}

export interface MissionRecord extends ScoreRecord {
  region: RegionId;
}

export interface GameRecord extends ScoreRecord {
  game: string;
  won: boolean;
}

export interface PracticeRecord extends ScoreRecord {
  level: Difficulty;
}

export interface ChallengeRecord extends ScoreRecord {
  level: Difficulty;
  passed: boolean;
}

export type ActivityType =
  | "identitas"
  | "pretest"
  | "materi"
  | "misi-wilayah"
  | "wilayah-selesai"
  | "latihan"
  | "mini-game"
  | "laboratorium"
  | "jungle-challenge"
  | "posttest"
  | "lencana"
  | "level"
  | "profil";

export interface ActivityEntry {
  id: string;
  at: string;
  type: ActivityType;
  title: string;
  detail?: string;
  score?: number;
  status: "selesai" | "dicoba" | "info";
}

export interface Journey {
  id: string;
  startedAt: string;
  explorer: Explorer;
  pretestDraft?: ExamDraft;
  posttestDraft?: ExamDraft;
  regions: Partial<Record<RegionId, RegionProgress>>;
  rewards: RewardEntry[];
  practice: PracticeRecord[];
  games: GameRecord[];
  gamesWon: string[];
  labTried: string[];
  challenge: ChallengeRecord[];
  missions: MissionRecord[];
  activity: ActivityEntry[];
  seenBadges: string[];
  seenLevel: number;
}

export interface Settings {
  sound: boolean;
  /** "auto" = ikuti prefers-reduced-motion */
  motion: "auto" | "on" | "off";
}

export interface SaveData {
  version: number;
  activeJourneyId: string | null;
  journeys: Journey[];
  /** semua percobaan pretest/posttest dari seluruh perjalanan (riwayat tidak pernah ditimpa) */
  pretests: ExamAttempt[];
  posttests: ExamAttempt[];
  settings: Settings;
  /** id user Supabase yang sudah menerima impor progres guest (agar tidak ganda) */
  importedTo: string[];
}
