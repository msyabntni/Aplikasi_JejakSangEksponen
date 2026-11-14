/**
 * Adaptor mode akun. Semua penilaian & XP dihitung oleh fungsi RPC di database
 * (lihat supabase/schema.sql). Frontend tidak pernah mengirim angka XP/skor.
 */
import type { AnswerValue } from "../types";
import type { ActivityEntry, ExamAttempt, Journey, RewardEntry } from "../storage/types";
import { getSupabase } from "./client";

export interface RemoteProfile {
  id: string;
  full_name: string;
  username: string;
  nickname: string;
  kelas: string;
  avatar: string;
  email?: string;
}

export interface RemoteState {
  profile: RemoteProfile;
  stats: { xp: number; gems: number };
  rewards: RewardEntry[];
  regions: { region_id: number; read_sections: string[]; mission_best: number; completed_at: string | null }[];
  pretests: ExamAttempt[];
  posttests: ExamAttempt[];
  activities: ActivityEntry[];
  games: Journey["games"];
  games_won: string[];
  practice: Journey["practice"];
  challenge: Journey["challenge"];
  lab_tried: string[];
  imported_guest: boolean;
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const remote = {
  getState: () => rpc<RemoteState>("get_my_state"),
  usernameAvailable: (username: string) => rpc<boolean>("username_available", { p_username: username }),
  submitExam: (kind: "pretest" | "posttest", answers: Record<string, AnswerValue>, startedAt: string) =>
    rpc<{ attempt_id: string; score: number; correct: number; wrong: number; per_question: boolean[]; xp_awarded: number }>("submit_exam", {
      p_kind: kind,
      p_answers: answers,
      p_started_at: startedAt,
    }),
  submitQuiz: (kind: "mission" | "practice" | "challenge", ref: string, answers: Record<string, AnswerValue>) =>
    rpc<{ score: number; correct: number; total: number; passed: boolean; xp_awarded: number }>("submit_quiz", {
      p_kind: kind,
      p_ref: ref,
      p_answers: answers,
    }),
  markSection: (region: number, section: string) => rpc<void>("mark_section", { p_region: region, p_section: section }),
  completeRegion: (region: number) => rpc<{ ok: boolean; xp_awarded: number; reason?: string }>("complete_region", { p_region: region }),
  completeActivity: (kind: "game" | "lab", ref: string, score: number, won: boolean) =>
    rpc<{ xp_awarded: number }>("complete_activity", { p_kind: kind, p_ref: ref, p_score: score, p_won: won }),
  updateProfile: async (userId: string, patch: { nickname?: string; kelas?: string; avatar?: string }) => {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from("profiles").update(patch).eq("id", userId);
    if (error) throw new Error(error.message);
  },
  importGuest: (payload: unknown) => rpc<{ imported: boolean; reason?: string }>("import_guest_progress", { p_payload: payload }),
};
