"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { quickQuestions } from "@/data/games";
import { gradeAnswer, isAnswered } from "@/lib/grading";
import type { AnswerValue } from "@/lib/types";
import { QuestionView } from "../quiz/QuestionView";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech } from "../ui/Panels";
import Naru from "../characters/Naru";
import { play } from "@/lib/sound";
import type { GameEnd } from "./GameShell";

const PLANKS = 6;

/** GAME 2 — jawab soal untuk memasang papan jembatan. */
export default function JungleBridge({ onEnd }: { onEnd: (r: GameEnd) => void }) {
  const qs = useMemo(() => quickQuestions(PLANKS, [1, 2]), []);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<AnswerValue | undefined>();
  const [built, setBuilt] = useState(0);
  const [points, setPoints] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [firstCorrect, setFirstCorrect] = useState(0);
  const [shake, setShake] = useState(0);
  const [hint, setHint] = useState(false);
  const [crossing, setCrossing] = useState(false);
  const q = qs[i];

  const check = () => {
    if (gradeAnswer(q, ans)) {
      play("correct");
      const nb = built + 1;
      setBuilt(nb);
      setPoints((p) => p + (firstTry ? 15 : 5));
      if (firstTry) setFirstCorrect((c) => c + 1);
      setHint(false);
      setAns(undefined);
      setFirstTry(true);
      if (nb === PLANKS) {
        setCrossing(true);
        const fc = firstCorrect + (firstTry ? 1 : 0);
        const total = points + (firstTry ? 15 : 5);
        setTimeout(() => onEnd({ score: Math.round((total / (PLANKS * 15)) * 100), correct: fc, total: PLANKS, won: true, summary: `Jembatan utuh! ${fc} papan dipasang pada percobaan pertama.` }), 2200);
      } else setI(i + 1);
    } else {
      play("wrong");
      setShake((s) => s + 1);
      setFirstTry(false);
      setHint(true);
    }
  };

  return (
    <div>
      {/* adegan jembatan */}
      <div className="relative mb-4 h-40 overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#9fd8c0,#e9f0d8)] sm:h-48">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[#8ED6E8]">
          <div className="river-flow absolute inset-0 opacity-70" />
        </div>
        <div className="absolute bottom-0 left-0 h-28 w-[14%] rounded-tr-3xl bg-[#62A66B]" />
        <div className="absolute bottom-0 right-0 h-28 w-[14%] rounded-tl-3xl bg-[#62A66B]" />
        <div className="absolute bottom-[104px] left-[14%] right-[14%] h-0.5 bg-[#754B35]" />
        <div className="absolute bottom-[86px] left-[14%] right-[14%] flex gap-1">
          {Array.from({ length: PLANKS }, (_, k) => (
            <motion.div
              key={k}
              className={`h-5 flex-1 rounded ${k < built ? "wood" : "border-2 border-dashed border-earth/40"}`}
              initial={false}
              animate={k < built ? { y: [-30, 0], opacity: [0, 1] } : k === built ? { rotate: shake % 2 ? [0, -8, 8, -4, 0] : [0, 8, -8, 4, 0] } : {}}
              transition={{ duration: 0.45 }}
            />
          ))}
        </div>
        <motion.div
          className="absolute bottom-[96px] w-16 sm:w-20"
          initial={false}
          animate={{ left: crossing ? "84%" : `${2 + (built / PLANKS) * 8}%` }}
          transition={{ duration: crossing ? 2 : 0.4, ease: "easeInOut" }}
        >
          <Naru pose={crossing ? "jump" : "idle"} width="100%" mood={crossing ? "cheer" : "neutral"} />
        </motion.div>
      </div>

      <div className="mb-2 flex justify-between font-display font-bold text-cream">
        <span>Papan: {built}/{PLANKS}</span>
        <span>Poin: {points}</span>
      </div>
      {!crossing && (
        <Parchment>
          <QuestionView q={q} value={ans} onChange={setAns} />
          {hint && <Speech who="kaciro" pose="tip" size={60} side="right" className="mt-3" text={`Papannya bergoyang! Petunjuk: ${q.hint} Coba lagi, ya.`} />}
          <div className="mt-4 flex justify-end">
            <GameButton onClick={check} disabled={!isAnswered(q, ans)}>PASANG PAPAN</GameButton>
          </div>
        </Parchment>
      )}
      {crossing && <p className="text-center font-display text-2xl font-extrabold text-sun">Jembatan utuh! Naru menyeberang!</p>}
    </div>
  );
}
