"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Target } from "lucide-react";

import { MISSION_PASS } from "@/data/regions";
import { PracticeRunner } from "../quiz/PracticeRunner";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech } from "../ui/Panels";
import { useStore } from "@/lib/store/ProgressProvider";
import Naru from "../characters/Naru";
import { GradedBy } from "@/components/ui/GradedBy";

function Item({ kind, got }) {
  const common = { width: 40, height: 40, viewBox: "0 0 40 40", "aria-hidden": true };
  const dim = got ? 1 : 0.22;
  return (
    <motion.div animate={got ? { scale: [0.5, 1.25, 1], rotate: [0, -10, 0] } : {}} transition={{ duration: 0.5 }} style={{ opacity: dim }}>
      <svg {...common}>
        {kind === "wood" && (
          <g>
            <rect x="4" y="14" width="32" height="12" rx="6" fill="#8a5a3c" stroke="#5a3a28" strokeWidth="2" />
            <circle cx="32" cy="20" r="5" fill="#d9b48a" />
            <circle cx="18" cy="12" r="3" fill="#F4D77A" />
          </g>
        )}
        {kind === "stone" && (
          <g>
            <ellipse cx="20" cy="22" rx="15" ry="11" fill="#e8e4d6" stroke="#8a826b" strokeWidth="2" />
            <circle cx="26" cy="17" r="3" fill="#5fd0c4" />
          </g>
        )}
        {kind === "plank" && <rect x="3" y="15" width="34" height="10" rx="2" fill="#a06c48" stroke="#5a3a28" strokeWidth="2" />}
        {kind === "crystal" && <path d="M20 3 L30 16 L20 37 L10 16 Z" fill="#b7a3f0" stroke="#7b63c4" strokeWidth="2" />}
        {kind === "fruit" && (
          <g>
            <circle cx="20" cy="22" r="12" fill="#F4D77A" stroke="#c9a52a" strokeWidth="2" />
            <path d="M20 10 q4 -6 8 -4" stroke="#3f8a55" strokeWidth="3" fill="none" />
            <text x="20" y="27" textAnchor="middle" fontSize="12" fontWeight="900" fill="#754B35">
              1
            </text>
          </g>
        )}
        {kind === "rope" && <path d="M20 2 Q10 10 20 18 Q30 26 20 34 Q14 38 20 39" stroke="#c9a96a" strokeWidth="5" fill="none" strokeLinecap="round" />}
        {kind === "key" && (
          <g>
            <circle cx="13" cy="20" r="8" fill="none" stroke="#e0b43c" strokeWidth="4" />
            <path d="M21 20 H36 M30 20 V27 M35 20 V25" stroke="#e0b43c" strokeWidth="4" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

export function RegionMission({ region, onDone }) {
  const s = useStore();
  const [run, setRun] = useState(0);
  const [result, setResult] = useState(null);
  const best = s.journey?.regions[region.id]?.missionBest ?? 0;
  const m = region.mission;

  if (result) {
    const pass = result.score >= MISSION_PASS;
    return (
      <Parchment className="text-center">
        <div className="mx-auto w-32">
          <Naru pose={pass ? "cheer" : "idle"} mood={pass ? "cheer" : "worried"} width="100%" />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-jungle">{pass ? "Misi berhasil!" : "Misi belum berhasil"}</h3>
        <p className="text-jungle">
          Kamu mengumpulkan <b>{result.correct}</b> dari {result.total} {m.itemName}. Skor: <b>{result.score}</b>
        </p>
        <GradedBy by={result.gradedBy} className="mt-1" />
        <div className="my-3 flex justify-center gap-1">
          {Array.from({ length: result.total }, (_, k) => (
            <Item key={k} kind={m.item} got={k < result.correct} />
          ))}
        </div>
        <Speech
          who={pass ? "naru" : "kaciro"}
          pose={pass ? "jump" : "tip"}
          size={70}
          className="text-left"
          text={
            pass
              ? "YEAH! Satu jejak rahasia berhasil kita temukan! Lanjut ke Rangkuman untuk menyelesaikan wilayah."
              : `Tidak apa-apa! Butuh skor minimal ${MISSION_PASS}. Baca lagi bagian Contoh dan Waspada, lalu coba lagi, ya.`
          }
        />
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <GameButton
            variant="cream"
            onClick={() => {
              setResult(null);
              setRun((r) => r + 1);
            }}
            icon={<RotateCcw size={18} />}
          >
            Ulangi misi
          </GameButton>
          {pass && onDone && <GameButton onClick={() => onDone(result.score)}>Ke Rangkuman</GameButton>}
        </div>
      </Parchment>
    );
  }

  return (
    <div className="rounded-3xl bg-jungle p-3 sm:p-5">
      <div className="mb-4 flex items-start gap-3 text-cream">
        <Target className="mt-1 shrink-0 text-sun" />
        <div>
          <h3 className="font-display text-xl font-extrabold text-sun">MISI: {m.title}</h3>
          <p className="text-sm text-cream/90">{m.story}</p>
          <p className="mt-1 text-xs text-cream/70">
            Syarat lulus: skor minimal {MISSION_PASS}. Skor terbaikmu: {best}.
          </p>
        </div>
      </div>
      <PracticeRunner
        key={run}
        title="Misi"
        questions={m.questions}
        header={(c) => (
          <div className="mb-3 flex flex-wrap justify-center gap-1 rounded-2xl bg-white/10 p-2" aria-label={`${c} ${m.itemName} terkumpul`}>
            {m.questions.map((_, k) => (
              <Item key={k} kind={m.item} got={k < c} />
            ))}
          </div>
        )}
        onFinish={async ({ answers }) => {
          const r = await s.submitMission(region.id, m.questions, answers);
          setResult(r);
        }}
      />
    </div>
  );
}
