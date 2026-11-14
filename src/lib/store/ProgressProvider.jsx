"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BADGES, earnedBadges, levelFor, REWARDS, rewardFor, totals, LAB_IDS } from "../gamification";
import { gradeAll } from "../grading";
import { nilaiJawaban } from "../api";
import { emptySave, loadSave, newJourney, persistSave, STORAGE_KEY, uid } from "../storage/local";

import { getSupabase, isSupabaseConfigured } from "../supabase/client";
import { remote } from "../supabase/remote";

import { latestPosttest, latestPretest, regionRequirements } from "../unlock";
import { play, setSoundEnabled } from "../sound";
import { getRegion } from "@/data/regions";
import { POSTTEST, PRETEST } from "@/data/exams";
import { CHALLENGE_PASS } from "@/data/challenge";

function byIndicator(qs, per) {
  const out = {};
  qs.forEach((q, i) => {
    const cur = out[q.indicator] ?? [0, 0];
    out[q.indicator] = [cur[0] + (per[i] ? 1 : 0), cur[1] + 1];
  });
  return out;
}

/** Kirim semua id soal (yang kosong = null) agar server menilai seluruh soal. */
function withAll(qs, answers) {
  return Object.fromEntries(qs.map((q) => [q.id, answers[q.id] ?? null]));
}

/** Kunci pencocokan nama + kelas (tidak peka huruf besar/kecil & spasi). */
export function explorerKey(name, kelas) {
  const n = name.trim().toLowerCase().replace(/\s+/g, " ");
  const k = kelas
    .trim()
    .toLowerCase()
    .replace(/[\s._-]+/g, "");
  return `${n}|${k}`;
}

function activeJourney(s) {
  return s.journeys.find((j) => j.id === s.activeJourneyId) ?? null;
}

function pushActivity(j, e) {
  j.activity.push({ id: uid("act"), at: new Date().toISOString(), ...e });
  if (j.activity.length > 400) j.activity.splice(0, j.activity.length - 400);
}

/** Mengubah data server menjadi struktur Journey lokal (mode akun). */
function journeyFromRemote(st, userId) {
  const jid = `akun_${userId}`;
  const j = newJourney(st.profile.nickname || st.profile.full_name, st.profile.kelas, st.profile.avatar || "daun");
  j.id = jid;
  j.rewards = st.rewards ?? [];
  for (const r of st.regions ?? []) {
    j.regions[r.region_id] = {
      read: r.read_sections ?? [],
      missionBest: r.mission_best ?? 0,
      completedAt: r.completed_at ?? undefined,
    };
  }
  j.activity = st.activities ?? [];
  j.games = st.games ?? [];
  j.gamesWon = st.games_won ?? [];
  j.practice = st.practice ?? [];
  j.challenge = st.challenge ?? [];
  j.labTried = st.lab_tried ?? [];
  j.seenBadges = earnedBadges(j);
  j.seenLevel = levelFor(totals(j.rewards).xp).level;
  const fix = (a) => ({ ...a, journeyId: jid });
  return { journey: j, pretests: (st.pretests ?? []).map(fix), posttests: (st.posttests ?? []).map(fix) };
}

function useStoreValue() {
  const [save, setSave] = useState(emptySave);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [notes, setNotes] = useState([]);
  const saveRef = useRef(save);
  const keyRef = useRef(STORAGE_KEY);
  const userRef = useRef(null);
  const guestSnapshot = useRef(null);

  const notify = useCallback((n) => setNotes((xs) => [...xs, { id: uid("note"), ...n }]), []);
  const dismissNote = useCallback((id) => setNotes((xs) => xs.filter((n) => n.id !== id)), []);

  const commit = useCallback((next) => {
    saveRef.current = next;
    setSave(next);
    persistSave(next, keyRef.current);
  }, []);

  /** Mutasi state + deteksi lencana/level baru (dengan notifikasi). */
  const mutate = useCallback(
    (fn) => {
      const next = structuredClone(saveRef.current);
      const j = activeJourney(next);
      fn(next, j);
      const nj = activeJourney(next);
      const fresh = [];
      if (nj) {
        for (const id of earnedBadges(nj)) {
          if (!nj.seenBadges.includes(id)) {
            nj.seenBadges.push(id);
            const b = BADGES.find((x) => x.id === id);
            fresh.push({ kind: "badge", title: `Lencana baru: ${b.name}`, detail: b.desc, badgeId: id });
            pushActivity(nj, { type: "lencana", title: `Lencana ${b.name}`, status: "selesai" });
          }
        }
        const lv = levelFor(totals(nj.rewards).xp);
        if (lv.level > nj.seenLevel) {
          nj.seenLevel = lv.level;
          fresh.push({ kind: "level", title: `Naik ke Level ${lv.level}!`, detail: lv.title });
          pushActivity(nj, { type: "level", title: `Naik ke Level ${lv.level} — ${lv.title}`, status: "info" });
        }
      }
      commit(next);
      if (fresh.length) {
        play("reward");
        fresh.forEach(notify);
      }
    },
    [commit, notify],
  );

  const addReward = useCallback(
    (entry, label) => {
      if (!entry || (entry.xp === 0 && entry.gems === 0)) return;
      mutate((_, j) => j?.rewards.push(entry));
      notify({
        kind: "xp",
        title: `+${entry.xp} XP${entry.gems ? ` · +${entry.gems} permata` : ""}`,
        detail: entry.repeat ? `${label} (bonus latihan ulang)` : label,
      });
    },
    [mutate, notify],
  );

  /** Guest: hadiah dihitung lokal. Akun: hadiah diambil dari respons server. */
  const grant = useCallback(
    (key, full, label, serverXp) => {
      const j = activeJourney(saveRef.current);
      if (!j) return;
      if (userRef.current) {
        if (serverXp && serverXp > 0) {
          const repeat = j.rewards.some((r) => r.key === key && !r.repeat);
          addReward({ key, xp: serverXp, gems: repeat ? 0 : full.gems, at: new Date().toISOString(), repeat }, label);
        }
        return;
      }
      addReward(rewardFor(j.rewards, key, full), label);
    },
    [addReward],
  );

  const reportSyncError = useCallback(
    (e) => notify({ kind: "error", title: "Gagal menyimpan ke server", detail: e instanceof Error ? e.message : String(e) }),
    [notify],
  );

  // ─── muat data guest ───
  useEffect(() => {
    const s = loadSave(STORAGE_KEY);
    saveRef.current = s;
    setSave(s);
    setSoundEnabled(s.settings.sound);
    setReady(true);
  }, []);

  // ─── sesi Supabase (mode akun) ───
  const hydrateAccount = useCallback(
    async (u) => {
      setSyncing(true);
      keyRef.current = `${STORAGE_KEY}:akun:${u.id}`;
      if (!guestSnapshot.current) guestSnapshot.current = loadSave(STORAGE_KEY);
      const cache = loadSave(keyRef.current);
      try {
        const st = await remote.getState();
        setProfile(st.profile);
        const { journey, pretests, posttests } = journeyFromRemote(st, u.id);
        const next = {
          ...cache,
          activeJourneyId: journey.id,
          journeys: [journey],
          pretests,
          posttests,
          settings: guestSnapshot.current?.settings ?? cache.settings,
          importedTo: st.imported_guest ? [u.id] : [],
        };
        commit(next);
      } catch (e) {
        commit(cache);
        reportSyncError(e);
      } finally {
        setSyncing(false);
      }
    },
    [commit, reportSyncError],
  );

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const apply = (session) => {
      const u = session ? { id: session.user.id, email: session.user.email ?? "" } : null;
      const prev = userRef.current;
      userRef.current = u;
      setUser(u);
      if (u && u.id !== prev?.id) void hydrateAccount(u);
      if (!u && prev) {
        keyRef.current = STORAGE_KEY;
        const g = loadSave(STORAGE_KEY);
        guestSnapshot.current = null;
        setProfile(null);
        saveRef.current = g;
        setSave(g);
      }
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, session) => apply(session));
    return () => data.subscription.unsubscribe();
  }, [hydrateAccount]);

  // ─── nilai turunan ───
  const journey = activeJourney(save);
  const pretest = latestPretest(save.pretests, journey);
  const posttest = latestPosttest(save.posttests, journey);
  const { xp, gems } = journey ? totals(journey.rewards) : { xp: 0, gems: 0 };
  const level = levelFor(xp);
  const badges = journey ? earnedBadges(journey) : [];

  const guestHasProgress = (() => {
    const g = guestSnapshot.current;
    if (!user || !g) return false;
    const gj = activeJourney(g);
    return Boolean(gj && (gj.rewards.length > 0 || g.pretests.some((p) => p.journeyId === gj.id)));
  })();
  const canImportGuest = Boolean(user && guestHasProgress && !save.importedTo.includes(user.id));

  // ─── aksi ───
  const actions = useMemo(
    () => ({
      startJourney(name, kelas = "") {
        mutate((d) => {
          const prev = activeJourney(d);
          const j = newJourney(name.trim(), kelas, prev?.explorer.avatar ?? "daun");
          pushActivity(j, { type: "identitas", title: `Perjalanan dimulai sebagai ${name.trim()}`, status: "info" });
          d.journeys.push(j);
          d.activeJourneyId = j.id;
        });
      },

      /**
       * Masuk tanpa password dengan NAMA + KELAS (mode lokal).
       * Jika penjelajah dengan nama & kelas yang sama sudah ada di perangkat ini,
       * perjalanan terakhirnya dilanjutkan; jika belum, dibuat perjalanan baru.
       */
      loginExplorer(name, kelas) {
        const key = explorerKey(name, kelas);
        const match = [...saveRef.current.journeys].reverse().find((j) => explorerKey(j.explorer.name, j.explorer.kelas) === key);
        if (match) {
          mutate((d) => {
            d.activeJourneyId = match.id;
            const j = activeJourney(d);
            if (j) pushActivity(j, { type: "identitas", title: `Masuk kembali sebagai ${match.explorer.name}`, status: "info" });
          });
          return { resumed: true };
        }
        mutate((d) => {
          const j = newJourney(name.trim(), kelas.trim(), "daun");
          pushActivity(j, { type: "identitas", title: `Perjalanan dimulai sebagai ${name.trim()} (kelas ${kelas.trim()})`, status: "info" });
          d.journeys.push(j);
          d.activeJourneyId = j.id;
        });
        return { resumed: false };
      },

      /** Berpindah ke penjelajah lain yang tersimpan di perangkat ini. */
      switchJourney(id) {
        mutate((d) => {
          if (d.journeys.some((j) => j.id === id)) d.activeJourneyId = id;
        });
      },

      /** Keluar dari penjelajah aktif (mode lokal). Data tidak dihapus. */
      signOutExplorer() {
        mutate((d) => {
          d.activeJourneyId = null;
        });
      },

      /** Perjalanan baru: progres baru, riwayat lama tetap disimpan. */
      restartJourney() {
        mutate((d) => {
          const prev = activeJourney(d);
          if (!prev) return;
          const j = newJourney(prev.explorer.name, prev.explorer.kelas, prev.explorer.avatar);
          pushActivity(j, { type: "identitas", title: "Memulai perjalanan baru", status: "info" });
          d.journeys.push(j);
          d.activeJourneyId = j.id;
        });
      },

      saveExamDraft(kind, draft) {
        mutate((_, j) => {
          if (!j) return;
          if (kind === "pretest") j.pretestDraft = draft;
          else j.posttestDraft = draft;
        });
      },

      async submitExam(kind, answers, startedAt) {
        const j = activeJourney(saveRef.current);
        if (!j) return null;
        const qs = kind === "pretest" ? PRETEST : POSTTEST;
        // mode lokal: dinilai backend Python (/api/nilai), cadangan di browser
        const g = userRef.current ? { ...gradeAll(qs, answers), gradedBy: "supabase" } : await nilaiJawaban(qs, answers);
        let result = { score: g.score, correct: g.correct, wrong: g.wrong, per: g.perQuestion, id: uid(kind), gradedBy: g.gradedBy };
        let serverXp;
        if (userRef.current) {
          try {
            const r = await remote.submitExam(kind, answers, startedAt);
            result = { score: r.score, correct: r.correct, wrong: r.wrong, per: r.per_question, id: r.attempt_id, gradedBy: "supabase" };
            serverXp = r.xp_awarded;
          } catch (e) {
            reportSyncError(e);
            return null;
          }
        }
        const attempt = {
          id: result.id,
          journeyId: j.id,
          explorerName: j.explorer.name,
          startedAt,
          finishedAt: new Date().toISOString(),
          answers,
          perQuestion: result.per,
          correct: result.correct,
          wrong: result.wrong,
          score: result.score,
          byIndicator: byIndicator(qs, result.per),
          gradedBy: result.gradedBy,
        };
        mutate((d, jj) => {
          if (!jj) return;
          if (kind === "pretest") {
            d.pretests.push(attempt);
            jj.pretestDraft = undefined;
          } else {
            d.posttests.push(attempt);
            jj.posttestDraft = undefined;
          }
          pushActivity(jj, { type: kind, title: kind === "pretest" ? "Pretest dikumpulkan" : "Posttest dikumpulkan", score: attempt.score, status: "selesai" });
        });
        if (kind === "posttest") grant("posttest", REWARDS.posttest, "Posttest selesai", serverXp);
        return attempt;
      },

      markSection(region, section) {
        const j = activeJourney(saveRef.current);
        if (!j || j.regions[region]?.read.includes(section)) return;
        mutate((_, jj) => {
          if (!jj) return;
          const p = (jj.regions[region] ??= { read: [], missionBest: 0 });
          p.read.push(section);
          p.lastVisitedAt = new Date().toISOString();
          if (section === "pembuka" && p.read.length === 1) {
            pushActivity(jj, { type: "materi", title: `Mulai Wilayah ${getRegion(region)?.code} ${getRegion(region)?.name}`, status: "dicoba" });
          }
        });
        if (userRef.current) remote.markSection(region, section).catch(reportSyncError);
      },

      async submitMission(region, questions, answers) {
        let { score, correct, total, perQuestion, gradedBy } = userRef.current
          ? { ...gradeAll(questions, answers), gradedBy: "supabase" }
          : await nilaiJawaban(questions, answers);
        if (userRef.current) {
          try {
            const r = await remote.submitQuiz("mission", String(region), answers);
            ({ score, correct, total } = r);
          } catch (e) {
            reportSyncError(e);
          }
        }
        mutate((_, j) => {
          if (!j) return;
          const p = (j.regions[region] ??= { read: [], missionBest: 0 });
          p.missionBest = Math.max(p.missionBest, score);
          if (!p.read.includes("misi")) p.read.push("misi");
          j.missions.push({
            id: uid("misi"),
            at: new Date().toISOString(),
            region,
            score,
            correct,
            total,
            answers,
            questionIds: questions.map((q) => q.id),
            perQuestion,
            gradedBy,
          });
          pushActivity(j, {
            type: "misi-wilayah",
            title: `Misi ${getRegion(region)?.mission.title}`,
            detail: `${correct}/${total} benar`,
            score,
            status: "selesai",
          });
        });
        return { score, correct, total, gradedBy };
      },

      async completeRegion(region) {
        const j = activeJourney(saveRef.current);
        if (!j) return { ok: false };
        const req = regionRequirements(j, region);
        if (!req.readAll) return { ok: false, reason: "Buka semua bagian materi dulu, ya." };
        if (!req.missionPassed) return { ok: false, reason: "Selesaikan misi wilayah dengan skor minimal 60 dulu." };
        let serverXp;
        if (userRef.current) {
          try {
            const r = await remote.completeRegion(region);
            if (!r.ok) return { ok: false, reason: r.reason };
            serverXp = r.xp_awarded;
          } catch (e) {
            reportSyncError(e);
            return { ok: false, reason: "Tidak bisa terhubung ke server." };
          }
        }
        const first = !j.regions[region]?.completedAt;
        mutate((_, jj) => {
          if (!jj) return;
          const p = jj.regions[region];
          p.completedAt ??= new Date().toISOString();
          pushActivity(jj, {
            type: "wilayah-selesai",
            title: `Wilayah ${getRegion(region)?.code} ${getRegion(region)?.name} ${first ? "selesai" : "diulang"}`,
            status: "selesai",
          });
        });
        if (first) play("unlock");
        grant(`region:${region}`, REWARDS.region, `Wilayah ${getRegion(region)?.code} selesai`, serverXp);
        return { ok: true };
      },

      async recordPractice(level, questions, answers) {
        let { score, correct, total, perQuestion, gradedBy } = userRef.current
          ? { ...gradeAll(questions, answers), gradedBy: "supabase" }
          : await nilaiJawaban(questions, answers);
        let serverXp;
        if (userRef.current) {
          try {
            const r = await remote.submitQuiz("practice", String(level), withAll(questions, answers));
            ({ score, correct, total } = r);
            serverXp = r.xp_awarded;
          } catch (e) {
            reportSyncError(e);
          }
        }
        mutate((_, j) => {
          if (!j) return;
          j.practice.push({
            id: uid("lat"),
            at: new Date().toISOString(),
            level,
            score,
            correct,
            total,
            answers,
            questionIds: questions.map((q) => q.id),
            perQuestion,
            gradedBy,
          });
          pushActivity(j, {
            type: "latihan",
            title: `Latihan ${["", "Penjelajah Pemula", "Petualang Hutan", "Penakluk Eksponen"][level]}`,
            detail: `${correct}/${total} benar`,
            score,
            status: "selesai",
          });
        });
        grant(`practice:${level}`, REWARDS.practice, "Sesi latihan selesai", serverXp);
        return { score, correct, total, gradedBy };
      },

      async recordChallenge(level, questions, answers) {
        let { score, correct, total, perQuestion, gradedBy } = userRef.current
          ? { ...gradeAll(questions, answers), gradedBy: "supabase" }
          : await nilaiJawaban(questions, answers);
        let serverXp;
        if (userRef.current) {
          try {
            const r = await remote.submitQuiz("challenge", String(level), withAll(questions, answers));
            ({ score, correct, total } = r);
            serverXp = r.xp_awarded;
          } catch (e) {
            reportSyncError(e);
          }
        }
        const passed = score >= CHALLENGE_PASS;
        mutate((_, j) => {
          if (!j) return;
          j.challenge.push({
            id: uid("jc"),
            at: new Date().toISOString(),
            level,
            score,
            correct,
            total,
            passed,
            answers,
            questionIds: questions.map((q) => q.id),
            perQuestion,
            gradedBy,
          });
          pushActivity(j, {
            type: "jungle-challenge",
            title: `Jungle Challenge Level ${level}`,
            detail: passed ? "Lulus" : "Belum lulus",
            score,
            status: passed ? "selesai" : "dicoba",
          });
        });
        if (passed) grant(`challenge:${level}`, REWARDS.challenge[level], `Jungle Challenge Level ${level}`, serverXp);
        return { score, correct, total, passed, gradedBy };
      },

      async recordGame(game, title, score, correct, total, won) {
        let serverXp;
        if (userRef.current) {
          try {
            serverXp = (await remote.completeActivity("game", game, score, won)).xp_awarded;
          } catch (e) {
            reportSyncError(e);
          }
        }
        mutate((_, j) => {
          if (!j) return;
          j.games.push({ id: uid("gm"), at: new Date().toISOString(), game, score, correct, total, won });
          if (won && !j.gamesWon.includes(game)) j.gamesWon.push(game);
          pushActivity(j, { type: "mini-game", title: `Mini-game ${title}`, detail: `${correct}/${total}`, score, status: won ? "selesai" : "dicoba" });
        });
        if (won) grant(`game:${game}`, REWARDS.game, `${title} selesai`, serverXp);
      },

      async labTry(exp, title) {
        const j = activeJourney(saveRef.current);
        if (!j || j.labTried.includes(exp)) return;
        let serverXp;
        if (userRef.current) {
          try {
            serverXp = (await remote.completeActivity("lab", exp, 100, true)).xp_awarded;
          } catch (e) {
            reportSyncError(e);
          }
        }
        mutate((_, jj) => {
          if (!jj || jj.labTried.includes(exp)) return;
          jj.labTried.push(exp);
          pushActivity(jj, { type: "laboratorium", title: `Eksperimen ${title}`, status: "selesai" });
        });
        grant(`lab:${exp}`, REWARDS.labExperiment, `Eksperimen ${title}`, serverXp);
        const after = activeJourney(saveRef.current);
        if (!userRef.current && after && LAB_IDS.every((id) => after.labTried.includes(id))) {
          grant("lab:all", REWARDS.labAll, "Semua eksperimen dicoba");
        }
      },

      async updateProfile(p) {
        if (userRef.current) {
          try {
            await remote.updateProfile(userRef.current.id, { nickname: p.name, kelas: p.kelas, avatar: p.avatar });
          } catch (e) {
            reportSyncError(e);
            return false;
          }
        }
        mutate((_, j) => {
          if (!j) return;
          if (p.name !== undefined) j.explorer.name = p.name.trim();
          if (p.kelas !== undefined) j.explorer.kelas = p.kelas.trim();
          if (p.avatar !== undefined) j.explorer.avatar = p.avatar;
          pushActivity(j, { type: "profil", title: "Profil diperbarui", status: "info" });
        });
        return true;
      },

      setSettings(s) {
        mutate((d) => {
          d.settings = { ...d.settings, ...s };
        });
        if (s.sound !== undefined) setSoundEnabled(s.sound);
      },

      async logout() {
        const sb = getSupabase();
        if (sb) await sb.auth.signOut();
      },

      async importGuest() {
        const u = userRef.current;
        const g = guestSnapshot.current;
        if (!u || !g) return false;
        const gj = activeJourney(g);
        if (!gj) return false;
        try {
          await remote.importGuest({
            journey: gj,
            pretests: g.pretests.filter((p) => p.journeyId === gj.id),
            posttests: g.posttests.filter((p) => p.journeyId === gj.id),
          });
          g.importedTo = [...g.importedTo, u.id];
          persistSave(g, STORAGE_KEY);
          await hydrateAccount(u);
          notify({ kind: "info", title: "Progres tamu berhasil dipindahkan ke akunmu!" });
          return true;
        } catch (e) {
          reportSyncError(e);
          return false;
        }
      },

      declineImport() {
        const u = userRef.current;
        if (!u) return;
        mutate((d) => {
          if (!d.importedTo.includes(u.id)) d.importedTo.push(u.id);
        });
      },
    }),
    [mutate, grant, reportSyncError, notify, hydrateAccount],
  );

  /** penjelajah tersimpan di perangkat (perjalanan terakhir tiap nama + kelas) */
  const explorers = (() => {
    const seen = new Map();
    for (const j of save.journeys) seen.set(explorerKey(j.explorer.name, j.explorer.kelas), j);
    return [...seen.values()].reverse();
  })();

  return {
    ready,
    syncing,
    save,
    explorers,
    journey,
    pretest,
    posttest,
    pretestDone: Boolean(pretest),
    xp,
    gems,
    level,
    badges,
    settings: save.settings,
    user,
    profile,
    accountEnabled: isSupabaseConfigured,
    canImportGuest,
    notes,
    notify,
    dismissNote,
    ...actions,
  };
}

const StoreCtx = createContext(null);

export function ProgressProvider({ children }) {
  const value = useStoreValue();
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useStore harus di dalam ProgressProvider");
  return v;
}
