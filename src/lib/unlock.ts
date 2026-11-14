import { MISSION_PASS, REGIONS, SECTIONS } from "@/data/regions";
import { challengeLevelsPassed } from "./gamification";
import type { ExamAttempt, Journey } from "./storage/types";
import type { RegionId } from "./types";

export type RegionStatus = "locked" | "new" | "progress" | "done";

export function latestPretest(pretests: ExamAttempt[], j: Journey | null): ExamAttempt | null {
  if (!j) return null;
  const list = pretests.filter((p) => p.journeyId === j.id);
  return list[list.length - 1] ?? null;
}

export function latestPosttest(posttests: ExamAttempt[], j: Journey | null): ExamAttempt | null {
  if (!j) return null;
  const list = posttests.filter((p) => p.journeyId === j.id);
  return list[list.length - 1] ?? null;
}

/** Syarat selesai wilayah: semua bagian materi dibuka + misi wilayah ≥ MISSION_PASS. */
export function regionRequirements(j: Journey, id: RegionId) {
  const p = j.regions[id];
  const read = p?.read ?? [];
  const readAll = SECTIONS.filter((s) => s.id !== "misi").every((s) => read.includes(s.id));
  const missionPassed = (p?.missionBest ?? 0) >= MISSION_PASS;
  return { readAll, missionPassed, readCount: read.length };
}

export function isRegionUnlocked(j: Journey, pretestDone: boolean, id: RegionId): boolean {
  if (!pretestDone) return false;
  if (id === 1) return true;
  if (id === 7) return REGIONS.filter((r) => r.id < 7).every((r) => j.regions[r.id]?.completedAt);
  return Boolean(j.regions[(id - 1) as RegionId]?.completedAt);
}

export function regionStatus(j: Journey, pretestDone: boolean, id: RegionId): RegionStatus {
  if (!isRegionUnlocked(j, pretestDone, id)) return "locked";
  const p = j.regions[id];
  if (p?.completedAt) return "done";
  if (p && (p.read.length > 0 || p.missionBest > 0)) return "progress";
  return "new";
}

export function regionsDone(j: Journey): number {
  return REGIONS.filter((r) => j.regions[r.id]?.completedAt).length;
}

export function challengeUnlocked(j: Journey): boolean {
  return regionsDone(j) >= 7;
}

export function posttestUnlocked(j: Journey): boolean {
  return regionsDone(j) === 7 && challengeLevelsPassed(j).length === 3;
}

/** Persentase pembelajaran keseluruhan (wilayah 70%, challenge 20%, posttest 10%). */
export function learningPercent(j: Journey, hasPosttest: boolean): number {
  const sections = SECTIONS.length;
  let regionPart = 0;
  for (const r of REGIONS) {
    const p = j.regions[r.id];
    if (p?.completedAt) regionPart += 1;
    else if (p) regionPart += Math.min(0.9, (p.read.length / sections) * 0.9);
  }
  const pct = (regionPart / 7) * 70 + (challengeLevelsPassed(j).length / 3) * 20 + (hasPosttest ? 10 : 0);
  return Math.round(pct);
}

/** Wilayah yang direkomendasikan: wilayah terbuka pertama yang belum selesai. */
export function nextRegion(j: Journey, pretestDone: boolean): RegionId | null {
  for (const r of REGIONS) {
    if (isRegionUnlocked(j, pretestDone, r.id) && !j.regions[r.id]?.completedAt) return r.id;
  }
  return null;
}
