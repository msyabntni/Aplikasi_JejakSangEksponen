"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Lightbulb, Send } from "lucide-react";

import { isAnswered } from "@/lib/grading";

import { QuestionView } from "./QuestionView";
import { GameButton } from "../ui/GameButton";
import { Modal, Parchment, Speech, VineProgress } from "../ui/Panels";
import Naru from "../characters/Naru";

/**
 * Pengerjaan ujian (pretest/posttest): navigasi nomor, draft tersimpan,
 * peringatan soal kosong, konfirmasi kumpulkan, timer opsional.
 * Tidak menampilkan kunci jawaban selama pengerjaan.
 */
export function ExamRunner({ questions, draft, onDraft, onSubmit, timerMinutes = 0, title, submitLabel = "KUMPULKAN", allowHint = false }) {
  const [hintFor, setHintFor] = useState(null);
  const [startedAt] = useState(() => draft?.startedAt ?? new Date().toISOString());
  const [answers, setAnswers] = useState(draft?.answers ?? {});
  const [cur, setCur] = useState(draft?.current ?? 0);
  const [dir, setDir] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const q = questions[cur];
  const answeredFlags = useMemo(() => questions.map((x) => isAnswered(x, answers[x.id])), [questions, answers]);
  const answered = answeredFlags.filter(Boolean).length;
  const unanswered = questions.length - answered;

  // simpan draft setiap perubahan (jawaban tetap tersimpan sampai dikumpulkan)
  useEffect(() => {
    onDraft({ startedAt, answers, current: cur });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, cur]);

  const deadline = timerMinutes > 0 ? new Date(startedAt).getTime() + timerMinutes * 60_000 : null;
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  const remaining = deadline ? Math.max(0, deadline - now) : null;

  const submit = async () => {
    setBusy(true);
    await onSubmit(answers, startedAt);
    setBusy(false);
  };

  useEffect(() => {
    if (remaining === 0 && !busy) void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining === 0]);

  const go = (i) => {
    setDir(i > cur ? 1 : -1);
    setCur(i);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-cream">
        <div className="font-display text-lg font-bold">
          {title} · Soal {cur + 1} dari {questions.length}
        </div>
        {remaining !== null && (
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-display font-bold ${remaining < 60_000 ? "bg-coral text-white" : "bg-white/15"}`}
          >
            <Clock size={16} /> {Math.floor(remaining / 60000)}:{String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}
          </div>
        )}
      </div>
      <VineProgress value={(answered / questions.length) * 100} label={`${answered} dari ${questions.length} terjawab`} className="mb-4 text-cream" />

      {/* navigasi nomor soal */}
      <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Nomor soal">
        {questions.map((x, i) => (
          <button
            key={x.id}
            onClick={() => go(i)}
            aria-current={i === cur ? "step" : undefined}
            aria-label={`Soal ${i + 1}${answeredFlags[i] ? ", sudah dijawab" : ", belum dijawab"}`}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 font-display font-extrabold transition ${
              i === cur
                ? "scale-110 border-sun bg-orange text-[#4a2410]"
                : answeredFlags[i]
                  ? "border-leaf bg-leaf text-white"
                  : "border-white/30 bg-white/10 text-cream"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={q.id}
          custom={dir}
          initial={{ opacity: 0, x: 40 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 * dir }}
          transition={{ duration: 0.22 }}
        >
          <Parchment>
            <QuestionView q={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} disabled={busy} />
            {allowHint && q.hint && (
              <div className="mt-4">
                {hintFor === q.id ? (
                  <Speech who="kaciro" pose="tip" size={60} side="right" text={`Petunjuk: ${q.hint}`} />
                ) : (
                  <button
                    onClick={() => setHintFor(q.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-sun/60 px-3 py-1.5 text-sm font-bold text-earth hover:bg-sun"
                  >
                    <Lightbulb size={16} /> Minta bantuan Kaciro
                  </button>
                )}
              </div>
            )}
          </Parchment>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between gap-3">
        <GameButton variant="ghost" onClick={() => go(cur - 1)} disabled={cur === 0} icon={<ArrowLeft size={18} />}>
          Sebelumnya
        </GameButton>
        {cur < questions.length - 1 ? (
          <GameButton variant="leaf" onClick={() => go(cur + 1)}>
            Berikutnya <ArrowRight size={18} />
          </GameButton>
        ) : (
          <GameButton onClick={() => setConfirm(true)} icon={<Send size={18} />}>
            {submitLabel}
          </GameButton>
        )}
      </div>
      {cur < questions.length - 1 && answered === questions.length && (
        <div className="mt-3 text-center">
          <GameButton size="sm" onClick={() => setConfirm(true)} icon={<Send size={16} />}>
            Semua terjawab — kumpulkan sekarang
          </GameButton>
        </div>
      )}

      <Modal open={confirm} onClose={() => !busy && setConfirm(false)} title={unanswered ? "Masih ada soal kosong" : "Kumpulkan jawaban?"}>
        <div className="flex items-start gap-3">
          <Naru pose="peek" width={80} mood={unanswered ? "worried" : "wink"} />
          <p className="text-[15px] leading-relaxed text-jungle">
            {unanswered ? (
              <>
                Hei, masih ada <b>{unanswered} soal</b> yang belum kamu jawab: nomor{" "}
                <b>
                  {answeredFlags
                    .map((a, i) => (!a ? i + 1 : null))
                    .filter(Boolean)
                    .join(", ")}
                </b>
                . Coba isi dulu, ya. Kalau memang tidak tahu, kamu tetap boleh mengumpulkan.
              </>
            ) : (
              <>
                Semua soal sudah terjawab. Periksa lagi kalau perlu. Setelah dikumpulkan, jawaban <b>dikunci</b> dan tidak bisa diubah.
              </>
            )}
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <GameButton variant="cream" onClick={() => setConfirm(false)} disabled={busy}>
            Periksa lagi
          </GameButton>
          <GameButton onClick={submit} disabled={busy} icon={<Send size={18} />}>
            {busy ? "Mengirim..." : "Ya, kumpulkan"}
          </GameButton>
        </div>
      </Modal>
    </div>
  );
}
