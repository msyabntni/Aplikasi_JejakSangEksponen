/**
 * Adaptor mode akun. Semua penilaian & XP dihitung oleh fungsi RPC di database
 * (lihat supabase/schema.sql). Frontend tidak pernah mengirim angka XP/skor.
 */

import { getSupabase } from "./client";

async function rpc(fn, args = {}) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
}

export const remote = {
  getState: () => rpc("get_my_state"),
  usernameAvailable: (username) => rpc("username_available", { p_username: username }),
  submitExam: (kind, answers, startedAt) =>
    rpc("submit_exam", {
      p_kind: kind,
      p_answers: answers,
      p_started_at: startedAt,
    }),
  submitQuiz: (kind, ref, answers) =>
    rpc("submit_quiz", {
      p_kind: kind,
      p_ref: ref,
      p_answers: answers,
    }),
  markSection: (region, section) => rpc("mark_section", { p_region: region, p_section: section }),
  completeRegion: (region) => rpc("complete_region", { p_region: region }),
  completeActivity: (kind, ref, score, won) => rpc("complete_activity", { p_kind: kind, p_ref: ref, p_score: score, p_won: won }),
  updateProfile: async (userId, patch) => {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from("profiles").update(patch).eq("id", userId);
    if (error) throw new Error(error.message);
  },
  importGuest: (payload) => rpc("import_guest_progress", { p_payload: payload }),
};
