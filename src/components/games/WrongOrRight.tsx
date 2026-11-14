"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { caseRound } from "@/data/games";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech } from "../ui/Panels";
import { MathText } from "../ui/MathText";
import { play } from "@/lib/sound";
import type { GameEnd } from "./GameShell";

/** GAME 5 — periksa penyelesaian: benar atau salah? Jika salah, pilih langkah keliru. */
export default function WrongOrRight({ onEnd }: { onEnd: (r: GameEnd) => void }) {
  const cases = useMemo(() => caseRound(6), []);
  const [idx, setIdx] = useState(0);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [done, setDone] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const c = cases[idx];
  const actuallyRight = c.wrong === -1;

  const judge = (v: "right" | "wrong") => {
    setVerdict(v);
    play("tap");
    if (v === "right") finishCase(actuallyRight);
  };
  const pickStep = (k: number) => {
    setStep(k);
    finishCase(!actuallyRight && k === c.wrong);
  };
  const finishCase = (ok: boolean) => {
    setDone(ok);
    play(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
  };
  const next = () => {
    if (idx === cases.length - 1) {
      const s = score;
      onEnd({ score: Math.round((s / cases.length) * 100), correct: s, total: cases.length, won: s >= 4, summary: `${s} dari ${cases.length} kasus dianalisis dengan tepat.` });
      return;
    }
    setIdx(idx + 1);
    setVerdict(null);
    setStep(null);
    setDone(null);
  };

  return (
    <div>
      <div className="mb-3 flex justify-between font-display font-bold text-cream">
        <span className="flex items-center gap-1"><Search size={18} /> Kasus {idx + 1}/{cases.length}</span>
        <span>Tepat: {score}</span>
      </div>
      <Parchment>
        <p className="text-sm font-bold text-earth">Penyelesaian seorang penjelajah:</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-jungle"><MathText text={c.problem} /></p>
        <ol className="mt-3 space-y-2">
          {c.steps.map((s, k) => {
            const picking = verdict === "wrong" && done === null;
            const isWrongStep = done !== null && k === c.wrong;
            return (
              <li key={k}>
                <button
                  disabled={!picking}
                  onClick={() => pickStep(k)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left font-display text-xl font-bold ${
                    isWrongStep ? "border-coral bg-[#fde6e2]" : step === k ? "border-orange bg-[#fff1e2]" : picking ? "btn-game border-dashed border-orange/60 bg-white" : "border-[#d9c08f] bg-white"
                  } text-jungle`}
                >
                  <span className="rounded-lg bg-jungle px-2 py-0.5 text-sm text-sun">Langkah {k + 1}</span>
                  <MathText text={s} />
                </button>
              </li>
            );
          })}
        </ol>

        {verdict === null && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <GameButton variant="leaf" size="lg" onClick={() => judge("right")} icon={<Check />}>BENAR</GameButton>
            <GameButton size="lg" onClick={() => judge("wrong")} icon={<X />}>SALAH</GameButton>
          </div>
        )}
        {verdict === "wrong" && done === null && <p className="mt-3 font-bold text-[#a3521c]">Ketuk langkah yang menurutmu keliru.</p>}

        {done !== null && (
          <>
            <Speech who="kaciro" pose={done ? "cheer" : "think"} size={64} side="right" className="mt-4">
              <p className="font-bold">{done ? "Analisis yang tepat!" : "Belum tepat."}</p>
              <MathText text={c.fix} />
            </Speech>
            <div className="mt-3 flex justify-end">
              <GameButton variant="leaf" onClick={next}>{idx === cases.length - 1 ? "Lihat hasil" : "Kasus berikutnya"}</GameButton>
            </div>
          </>
        )}
      </Parchment>
    </div>
  );
}
