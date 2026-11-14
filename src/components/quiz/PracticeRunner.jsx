"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lightbulb, Clock } from "lucide-react";

import { correctAnswerText, gradeAnswer, isAnswered } from "@/lib/grading";
import { play } from "@/lib/sound";
import { QuestionView } from "./QuestionView";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech, VineProgress } from "../ui/Panels";
import { MathText } from "../ui/MathText";
import Naru from "../characters/Naru";

function Stars() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl text-sun"
          style={{ left: `${10 + i * 8}%`, top: "40%" }}
          initial={{ y: 0, opacity: 1, scale: 0.4 }}
          animate={{ y: -80 - (i % 3) * 30, opacity: 0, scale: 1.2, rotate: i * 36 }}
          transition={{ duration: 0.9, delay: i * 0.03 }}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Mode latihan: satu soal per layar, PERIKSA → umpan balik langsung.
 * Jawaban salah dijelaskan Kaciro (bagian yang keliru + langkah benar).
 */
export function PracticeRunner({ questions, onFinish, header, title = "Latihan", timerMinutes = 0, allowHint = true }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(null);
  const [hint, setHint] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [busy, setBusy] = useState(false);
  const [deadline] = useState(() => (timerMinutes > 0 ? Date.now() + timerMinutes * 60_000 : null));
  const [now, setNow] = useState(() => Date.now());
  const q = questions[i];
  const a = answers[q.id];

  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  const remaining = deadline ? Math.max(0, deadline - now) : null;

  const finish = async (ans, c) => {
    setBusy(true);
    await onFinish({ answers: ans, correct: c, total: questions.length });
    setBusy(false);
  };

  useEffect(() => {
    if (remaining === 0 && !busy) void finish(answers, correct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining === 0]);

  const check = () => {
    const ok = gradeAnswer(q, a);
    setChecked(ok);
    if (ok) setCorrect((c) => c + 1);
    play(ok ? "correct" : "wrong");
  };

  const next = () => {
    if (i === questions.length - 1) {
      void finish(answers, correct);
      return;
    }
    setI(i + 1);
    setChecked(null);
    setHint(false);
  };

  const fb = q.kind === "mcq" && typeof a === "number" ? q.optionFeedback?.[a] : undefined;

  return (
    <div>
      {header?.(correct, i, checked)}
      <div className="mb-3 flex items-center justify-between gap-2 font-display font-bold text-cream">
        <span>
          {title} · Soal {i + 1}/{questions.length}
        </span>
        <span className="flex items-center gap-2">
          {remaining !== null && (
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 ${remaining < 60_000 ? "bg-coral" : "bg-white/15"}`}>
              <Clock size={14} /> {Math.floor(remaining / 60000)}:{String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-leaf px-2.5 py-0.5">
            <CheckCircle2 size={14} /> {correct}
          </span>
        </span>
      </div>
      <VineProgress value={((i + (checked !== null ? 1 : 0)) / questions.length) * 100} className="mb-4" />

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
          <Parchment className="relative">
            {checked === true && <Stars />}
            <QuestionView
              q={q}
              value={a}
              onChange={(v) => setAnswers((x) => ({ ...x, [q.id]: v }))}
              disabled={checked !== null || busy}
              reveal={checked !== null}
            />

            {allowHint && checked === null && (
              <div className="mt-4">
                {hint ? (
                  <Speech who="kaciro" pose="tip" size={64} side="right" text={`Petunjuk: ${q.hint}`} />
                ) : (
                  <button
                    onClick={() => setHint(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-sun/60 px-3 py-1.5 text-sm font-bold text-earth hover:bg-sun"
                  >
                    <Lightbulb size={16} /> Minta petunjuk Kaciro
                  </button>
                )}
              </div>
            )}

            {checked === true && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#e3f4dc] p-3">
                <Naru pose="cheer" width="min(26vw, 100px)" />
                <div>
                  <p className="font-display text-lg font-extrabold text-forest">YEAH! Jawabanmu tepat!</p>
                  <p className="text-sm text-jungle">
                    <MathText text={q.explanation[q.explanation.length - 1]} />
                  </p>
                </div>
              </div>
            )}
            {checked === false && (
              <div className="mt-4">
                <Speech who="kaciro" pose="think" size={72} side="right">
                  <p className="font-bold">Hampir! Yuk, kita periksa bersama.</p>
                  {fb && (
                    <p className="mt-1">
                      <MathText text={fb} />
                    </p>
                  )}
                  <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                    {q.explanation.map((e, k) => (
                      <li key={k}>
                        <MathText text={e} />
                      </li>
                    ))}
                  </ol>
                  <p className="mt-1 text-sm">
                    Jawaban yang tepat:{" "}
                    <b>
                      <MathText text={correctAnswerText(q)} />
                    </b>
                  </p>
                </Speech>
              </div>
            )}
          </Parchment>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex justify-end">
        {checked === null ? (
          <GameButton size="lg" onClick={check} disabled={!isAnswered(q, a)}>
            PERIKSA
          </GameButton>
        ) : (
          <GameButton size="lg" variant="leaf" onClick={next} disabled={busy}>
            {i === questions.length - 1 ? (busy ? "Menyimpan..." : "LIHAT HASIL") : "LANJUT"} <ArrowRight />
          </GameButton>
        )}
      </div>
    </div>
  );
}
