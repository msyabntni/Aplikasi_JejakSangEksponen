"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Lock, Swords, Trophy } from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { ExamRunner } from "@/components/quiz/ExamRunner";
import { ReviewList } from "@/components/quiz/ReviewList";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, VineProgress } from "@/components/ui/Panels";
import { Fireflies, Gem, HangingVines, TreasureChest } from "@/components/scenery/Scenery";
import { CHALLENGE_COUNT, CHALLENGE_LEVELS, CHALLENGE_PASS, CHALLENGE_TIMER_OPTIONS } from "@/data/challenge";
import { drawPractice } from "@/data/questionBank";
import { useStore } from "@/lib/store/ProgressProvider";
import { challengeLevelsPassed, REWARDS } from "@/lib/gamification";
import { challengeUnlocked, posttestUnlocked, regionsDone } from "@/lib/unlock";
import { GradedBy } from "@/components/ui/GradedBy";

export default function ChallengePage() {
  const s = useStore();
  const j = s.journey;
  const passed = challengeLevelsPassed(j);
  const [timer, setTimer] = useState(0);
  const [run, setRun] = useState(null);
  const [result, setResult] = useState(null);

  if (!challengeUnlocked(j)) {
    const done = regionsDone(j);
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Parchment className="text-center text-jungle">
          <Lock className="mx-auto" size={44} />
          <h1 className="mt-2 font-display text-2xl font-extrabold">Jungle Challenge masih terkunci</h1>
          <p className="mt-1">Selesaikan ketujuh wilayah dulu untuk membuka tantangan akhir.</p>
          <VineProgress value={(done / 7) * 100} label={`${done} dari 7 wilayah selesai`} className="mt-4 text-jungle" />
          <GameButton href="/peta" className="mt-4">
            Ke Peta Petualangan
          </GameButton>
        </Parchment>
      </div>
    );
  }

  if (run) {
    const L = CHALLENGE_LEVELS[run.level - 1];
    return (
      <div className="relative min-h-[80vh] bg-[radial-gradient(ellipse_at_50%_0%,#754B35,#173F2A_65%)] px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <Speech who="naru" pose="hang" size={70} className="mb-4" text={L.naru} />
          <ExamRunner
            key={run.key}
            title={`LEVEL ${run.level} — ${L.name}`}
            submitLabel="KIRIM JAWABAN"
            questions={run.qs}
            timerMinutes={timer}
            allowHint
            onDraft={() => {}}
            onSubmit={async (answers) => {
              const r = await s.recordChallenge(run.level, run.qs, answers);
              setResult({ level: run.level, ...r, answers, qs: run.qs });
              setRun(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (result) {
    const L = CHALLENGE_LEVELS[result.level - 1];
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Parchment className="text-center">
          <div className="flex items-end justify-center gap-2">
            <Naru pose={result.passed ? "cheer" : "idle"} mood={result.passed ? "cheer" : "worried"} width={110} />
            {result.passed && <TreasureChest open width={100} />}
          </div>
          <p className="font-display text-sm font-bold tracking-widest text-earth">
            LEVEL {result.level} — {L.name}
          </p>
          <h1 className="font-display text-3xl font-extrabold text-jungle">{result.passed ? "Level ditaklukkan!" : "Belum lulus, coba lagi!"}</h1>
          <p className="my-2 font-display text-6xl font-extrabold text-orange">{result.score}</p>
          <p className="text-jungle">
            {result.correct} benar · {result.total - result.correct} salah · syarat lulus {CHALLENGE_PASS}
          </p>
          <GradedBy by={result.gradedBy} className="mt-2" />
          {result.passed && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-earth">
              Hadiah level: +{REWARDS.challenge[result.level].xp} XP · +{REWARDS.challenge[result.level].gems} <Gem size={14} /> (penyelesaian pertama)
            </p>
          )}
        </Parchment>
        <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-cream">Ringkasan & pembahasan</h2>
        <ReviewList questions={result.qs} answers={result.answers} />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <GameButton onClick={() => setResult(null)}>Kembali ke Jungle Challenge</GameButton>
          {posttestUnlocked(s.journey) && (
            <GameButton href="/posttest" variant="leaf">
              Menuju Posttest
            </GameButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,#a06c48,#5a3a28_45%,#173F2A)] px-4 pb-8 pt-8">
        <HangingVines count={7} seed={13} />
        <Fireflies count={12} />
        <div className="relative z-20 mx-auto max-w-5xl">
          <p className="flex items-center gap-2 font-display text-sm font-bold tracking-widest text-sun">
            <Swords size={16} /> TANTANGAN AKHIR
          </p>
          <h1 className="font-display text-3xl font-extrabold text-cream sm:text-5xl">JUNGLE CHALLENGE</h1>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Speech
              who="naru"
              pose="point"
              size={80}
              text="Tiga level tantangan menunggumu! Taklukkan semuanya untuk membuka posttest dan lencana Legenda Sang Eksponen!"
            />
            <Speech
              who="kaciro"
              pose="tip"
              size={80}
              side="right"
              text="Kalau butuh bantuan saat mengerjakan, tekan tombol 'Minta bantuan Kaciro'. Pembahasan lengkap muncul setelah kamu mengirim jawaban."
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <VineProgress value={(passed.length / 3) * 100} label={`${passed.length} dari 3 level ditaklukkan`} className="mb-5 text-cream" />
        <div className="grid gap-4 md:grid-cols-3">
          {CHALLENGE_LEVELS.map((L) => {
            const open = L.level === 1 || passed.includes(L.level - 1);
            const done = passed.includes(L.level);
            const best = Math.max(0, ...j.challenge.filter((c) => c.level === L.level).map((c) => c.score));
            return (
              <div
                key={L.level}
                className={`relative rounded-3xl p-4 ${open ? "parchment" : "bg-white/10 text-cream"} ${L.level === 2 ? "md:-translate-y-3" : L.level === 3 ? "md:-translate-y-6" : ""}`}
              >
                <p className={`font-display text-sm font-bold tracking-widest ${open ? "text-earth" : ""}`}>
                  LEVEL {L.level} · {L.scene}
                </p>
                <h2 className={`font-display text-2xl font-extrabold ${open ? "text-jungle" : ""}`}>{L.name}</h2>
                <p className={`mt-1 text-sm ${open ? "text-jungle" : "opacity-80"}`}>{L.topics}</p>
                <p className={`mt-2 text-xs font-bold ${open ? "text-earth" : ""}`}>
                  {CHALLENGE_COUNT} soal · lulus ≥ {CHALLENGE_PASS} · hadiah +{REWARDS.challenge[L.level].xp} XP
                </p>
                {best > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-earth">
                    <Trophy size={14} /> Skor terbaik: {best}
                  </p>
                )}
                {done && <CheckCircle2 className="absolute right-4 top-4 text-forest" />}
                <GameButton
                  full
                  className="mt-3"
                  variant={open ? (done ? "leaf" : "orange") : "ghost"}
                  disabled={!open}
                  icon={open ? <Swords size={18} /> : <Lock size={18} />}
                  onClick={() => setRun({ level: L.level, qs: drawPractice(L.level, CHALLENGE_COUNT), key: Date.now() })}
                >
                  {!open ? "Terkunci" : done ? "Ulangi level" : "Mulai level"}
                </GameButton>
              </div>
            );
          })}
        </div>

        <Parchment className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-jungle">
            <Clock size={20} />
            <span className="font-display font-bold">Timer (opsional):</span>
            {CHALLENGE_TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTimer(t)}
                aria-pressed={timer === t}
                className={`rounded-full border-2 px-3 py-1 font-bold ${timer === t ? "border-orange bg-orange text-white" : "border-earth/30 bg-white"}`}
              >
                {t === 0 ? "Tanpa timer" : `${t} menit`}
              </button>
            ))}
          </div>
        </Parchment>

        {passed.length === 3 && (
          <div className="mt-6 flex items-center gap-4 rounded-3xl bg-sun p-4 text-earth">
            <Kaciro pose="cheer" width={90} />
            <div>
              <p className="font-display text-xl font-extrabold">Semua level ditaklukkan!</p>
              <p>Posttest sudah terbuka. Saatnya melihat perkembanganmu.</p>
              <GameButton href="/posttest" variant="leaf" className="mt-2">
                Kerjakan Posttest
              </GameButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
