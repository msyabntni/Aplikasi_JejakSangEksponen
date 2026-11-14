"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { OBSTACLES, quickQuestions } from "@/data/games";
import { gradeAnswer, isAnswered, correctAnswerText } from "@/lib/grading";
import type { AnswerValue } from "@/lib/types";
import { QuestionView } from "../quiz/QuestionView";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech } from "../ui/Panels";
import { MathText } from "../ui/MathText";
import Naru from "../characters/Naru";
import { play } from "@/lib/sound";
import type { GameEnd } from "./GameShell";

const LIVES = 3;

function ObstacleIcon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 60 40" className="h-8 w-12" aria-hidden>
      {id === "lumpur" && <ellipse cx="30" cy="28" rx="26" ry="9" fill="#6b4228" />}
      {id === "sungai" && <path d="M0 26 Q15 18 30 26 T60 26 V40 H0Z" fill="#8ED6E8" />}
      {id === "akar" && <path d="M4 36 Q20 10 30 30 Q40 6 56 36" stroke="#754B35" strokeWidth="5" fill="none" />}
      {id === "tebing" && <path d="M10 40 L10 6 L50 6 L50 40Z" fill="#94a5b9" />}
      {id === "gua" && <path d="M6 40 Q6 6 30 6 Q54 6 54 40Z M20 40 Q20 20 30 20 Q40 20 40 40Z" fill="#5a4c80" fillRule="evenodd" />}
      {id === "jembatan" && <path d="M2 20 H58 M2 30 H58 M10 20 V30 M22 20 V30 M34 20 V30 M46 20 V30" stroke="#a06c48" strokeWidth="4" />}
    </svg>
  );
}

/** GAME 6 — bantu Naru melewati rintangan berurutan dengan sistem energi. */
export default function RescueNaru({ onEnd }: { onEnd: (r: GameEnd) => void }) {
  const qs = useMemo(() => quickQuestions(OBSTACLES.length + LIVES, [1, 2, 3]), []);
  const [pos, setPos] = useState(0); // rintangan yang sudah dilewati
  const [qi, setQi] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [ans, setAns] = useState<AnswerValue | undefined>();
  const [fb, setFb] = useState<{ ok: boolean; text: string } | null>(null);
  const [story, setStory] = useState(true);
  const q = qs[qi % qs.length];
  const ob = OBSTACLES[Math.min(pos, OBSTACLES.length - 1)];
  const finished = pos >= OBSTACLES.length || lives <= 0;

  const check = () => {
    const ok = gradeAnswer(q, ans);
    play(ok ? "correct" : "wrong");
    if (ok) {
      setPos((p) => p + 1);
      setFb({ ok, text: `Naru berhasil melewati ${ob.name}!` });
    } else {
      setLives((l) => l - 1);
      setFb({ ok, text: `Aduh, energi berkurang! ${q.explanation.join(" ")} Jawaban tepat: ${correctAnswerText(q)}.` });
    }
  };
  const next = () => {
    if (finished) {
      const won = pos >= OBSTACLES.length;
      onEnd({ score: Math.round((pos / OBSTACLES.length) * 100), correct: pos, total: OBSTACLES.length, won, summary: won ? `Naru selamat sampai camp dengan ${lives} energi tersisa!` : `Naru melewati ${pos} dari ${OBSTACLES.length} rintangan sebelum energinya habis.` });
      return;
    }
    setQi(qi + 1);
    setAns(undefined);
    setFb(null);
  };

  if (story) {
    return (
      <Parchment>
        <Speech who="naru" pose="idle" mood="worried" size={90} text="Tolong! Aku tersesat saat mencari buah emas. Jalan pulang ke camp penuh rintangan: lumpur, sungai, akar berduri, tebing, gua, dan jembatan gantung. Bantu aku, ya!" />
        <Speech who="kaciro" pose="map" size={80} side="right" className="mt-3" text="Setiap jawaban benar membuat Naru maju. Hati-hati, energimu hanya 3." />
        <GameButton size="lg" full className="mt-4" onClick={() => setStory(false)}>AYO SELAMATKAN NARU!</GameButton>
      </Parchment>
    );
  }

  return (
    <div>
      {/* jalur rintangan */}
      <div className="relative mb-4 overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#bfe6c9,#7fb685)] p-3">
        <div className="flex items-end justify-between gap-1">
          {OBSTACLES.map((o, k) => (
            <div key={o.id} className={`flex flex-1 flex-col items-center rounded-xl py-1 text-center ${k < pos ? "opacity-40" : k === pos ? "bg-white/60" : ""}`}>
              <ObstacleIcon id={o.id} />
              <span className="hidden text-[10px] font-bold text-jungle sm:block">{o.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center"><span className="text-[10px] font-bold text-jungle">CAMP</span></div>
        </div>
        <div className="relative mt-1 h-20">
          <motion.div className="absolute bottom-0 w-14" animate={{ left: `${(pos / OBSTACLES.length) * 86}%`, y: fb?.ok ? [0, -24, 0] : 0 }} transition={{ duration: 0.6 }}>
            <Naru pose={fb?.ok ? "jump" : "idle"} mood={fb && !fb.ok ? "worried" : undefined} width="100%" />
          </motion.div>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between font-display font-bold text-cream">
        <span>{pos < OBSTACLES.length ? `Rintangan: ${ob.name}` : "Sampai di camp!"}</span>
        <span className="flex gap-1" aria-label={`Energi ${lives} dari ${LIVES}`}>
          {Array.from({ length: LIVES }, (_, k) => <Heart key={k} size={22} className={k < lives ? "fill-coral text-coral" : "text-white/30"} />)}
        </span>
      </div>

      <Parchment>
        {!fb && <p className="mb-2 text-sm font-bold text-earth">{ob.desc}</p>}
        <QuestionView q={q} value={ans} onChange={setAns} disabled={Boolean(fb)} reveal={Boolean(fb)} />
        {fb && (
          <Speech who={fb.ok ? "naru" : "kaciro"} pose={fb.ok ? "cheer" : "tip"} size={56} side={fb.ok ? "left" : "right"} className="mt-3">
            <MathText text={fb.text} />
          </Speech>
        )}
        <div className="mt-4 flex justify-end">
          {!fb ? (
            <GameButton onClick={check} disabled={!isAnswered(q, ans)}>LOMPAT!</GameButton>
          ) : (
            <GameButton variant="leaf" onClick={next}>{finished ? "Lihat hasil" : "Lanjut"}</GameButton>
          )}
        </div>
      </Parchment>
    </div>
  );
}
