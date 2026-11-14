"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Tent, X } from "lucide-react";
import { ExamGate } from "@/components/quiz/ExamGate";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, WoodSign } from "@/components/ui/Panels";
import { HangingVines } from "@/components/scenery/Scenery";
import Naru from "@/components/characters/Naru";
import { scoreMessage } from "@/data/exams";
import { useStore } from "@/lib/store/ProgressProvider";
import { INDICATOR_LABEL } from "@/lib/types";
import { play } from "@/lib/sound";
import { fmtDate } from "@/lib/format";
import { GradedBy } from "@/components/ui/GradedBy";

export default function PretestResultPage() {
  const s = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transit, setTransit] = useState(false);
  const p = s.pretest;

  if (!p) {
    return (
      <ExamGate>
        <Parchment className="text-center text-jungle">
          Belum ada hasil pretest.{" "}
          <GameButton href="/pretest" className="mt-3">
            Ke Pretest
          </GameButton>
        </Parchment>
      </ExamGate>
    );
  }
  const msg = scoreMessage(p.score);
  const strong = Object.entries(p.byIndicator)
    .filter(([, [b, t]]) => b === t)
    .map(([k]) => INDICATOR_LABEL[k]);
  const weak = Object.entries(p.byIndicator)
    .filter(([, [b, t]]) => b < t)
    .map(([k]) => INDICATOR_LABEL[k]);

  const toCamp = () => {
    play("page");
    setTransit(true);
    setTimeout(() => router.push("/camp"), 1300);
  };

  if (transit) {
    return (
      <div className="relative grid min-h-[calc(100dvh-64px)] place-items-center overflow-hidden motif-daun [--bg:linear-gradient(180deg,#246B45,#173F2A)]">
        <HangingVines count={9} />
        <motion.div initial={{ x: "-60vw", rotate: -20 }} animate={{ x: "60vw", rotate: 20 }} transition={{ duration: 1.3, ease: "easeInOut" }}>
          <Naru pose="swing" width={180} />
        </motion.div>
        <p className="absolute bottom-24 font-display text-2xl font-bold text-cream">Menuju Camp Penjelajah...</p>
      </div>
    );
  }

  return (
    <ExamGate>
      <div className="text-center">
        <WoodSign>HASIL UJI JEJAK AWAL</WoodSign>
      </div>
      <Parchment className="mt-8">
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <div className="relative mx-auto grid h-40 w-40 place-items-center rounded-full border-8 border-earth bg-jungle text-center shadow-[0_6px_0_#3e2718]">
            <div>
              <div className="font-display text-6xl font-extrabold text-sun">{p.score}</div>
              <div className="text-sm font-bold text-cream">dari 100</div>
            </div>
          </div>
          <div className="text-jungle">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#e3f4dc] px-3 py-1 font-bold text-forest">
                <Check size={16} /> {p.correct} benar
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#fde6e2] px-3 py-1 font-bold text-[#7a2b2b]">
                <X size={16} /> {p.wrong} salah
              </span>
            </div>
            <p className="mt-2 text-sm text-earth">
              Dikerjakan oleh <b>{p.explorerName}</b> · mulai {fmtDate(p.startedAt)} · selesai {fmtDate(p.finishedAt)}
            </p>
            <GradedBy by={p.gradedBy} className="mt-2" />
            <h2 className="mt-3 font-display text-lg font-extrabold">Ringkasan kemampuan awal</h2>
            <p className="text-[15px]">
              {strong.length > 0 && (
                <>
                  Sudah kamu kenal: <b>{strong.join(", ")}</b>.{" "}
                </>
              )}
              {weak.length > 0 && (
                <>
                  Akan kita pelajari bersama: <b>{weak.join(", ")}</b>.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 font-display text-lg font-extrabold text-jungle"
          aria-expanded={open}
        >
          LIHAT HASIL <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="mt-2 grid grid-cols-5 gap-2">
            {p.perQuestion.map((ok, i) => (
              <div
                key={i}
                className={`flex flex-col items-center rounded-xl py-2 font-display font-bold ${ok ? "bg-[#e3f4dc] text-forest" : "bg-[#fde6e2] text-[#7a2b2b]"}`}
              >
                <span className="text-xs">No. {i + 1}</span>
                {ok ? <Check size={18} /> : <X size={18} />}
              </div>
            ))}
            <p className="col-span-5 text-sm text-earth">
              Pembahasan lengkap tidak ditampilkan di sini, karena materinya akan kamu temukan sendiri di hutan bersama Kaciro.
            </p>
          </div>
        )}
      </Parchment>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Speech who="naru" pose={msg.tone === "high" ? "cheer" : "jump"} size={90} text={msg.text} />
        <Speech
          who="kaciro"
          pose="tip"
          size={90}
          side="right"
          text="Ingat, hasil pretest ini hanya gambaran kemampuan awalmu, bukan nilai akhir. Nanti kita bandingkan dengan posttest untuk melihat perkembanganmu."
        />
      </div>

      <div className="mt-6 text-center">
        <GameButton size="lg" onClick={toCamp} icon={<Tent />}>
          LANJUTKAN PETUALANGAN
        </GameButton>
      </div>
    </ExamGate>
  );
}
