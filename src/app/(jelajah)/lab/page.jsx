"use client";

import { useState } from "react";
import { CheckCircle2, FlaskConical } from "lucide-react";
import Kaciro from "@/components/characters/Kaciro";
import Naru from "@/components/characters/Naru";
import { Fireflies, HangingVines } from "@/components/scenery/Scenery";
import { Speech } from "@/components/ui/Panels";
import {
  Anatomy,
  ExponentDivider,
  ExponentMultiplier,
  PowerBuilder,
  PowerOfPower,
  RepeatAnimation,
  SliderLab,
  ZeroNegative,
} from "@/components/lab/Experiments";
import { useStore } from "@/lib/store/ProgressProvider";
import { LAB_IDS } from "@/lib/gamification";

const EXPS = [
  { id: "builder", code: "A", name: "Power Builder", C: PowerBuilder },
  { id: "multiplier", code: "B", name: "Exponent Multiplier", C: ExponentMultiplier },
  { id: "divider", code: "C", name: "Exponent Divider", C: ExponentDivider },
  { id: "power", code: "D", name: "Power of Power", C: PowerOfPower },
  { id: "zero-negative", code: "E", name: "Zero & Negative", C: ZeroNegative },
  { id: "anatomy", code: "F", name: "Anatomi Pangkat", C: Anatomy },
  { id: "slider", code: "G", name: "Pengatur Slider", C: SliderLab },
  { id: "animation", code: "H", name: "Animasi Perkalian", C: RepeatAnimation },
];

export default function LabPage() {
  const s = useStore();
  const [cur, setCur] = useState("builder");
  const tried = s.journey?.labTried ?? [];
  const e = EXPS.find((x) => x.id === cur);

  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_0%,#4fb3a9,#1f6b63_50%,#173F2A)] px-4 pb-6 pt-8">
        <HangingVines count={5} seed={7} />
        <Fireflies count={10} />
        <div className="relative z-20 mx-auto flex max-w-5xl items-end gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-2 font-display text-sm font-bold tracking-widest text-sun">
              <FlaskConical size={16} /> LABORATORIUM
            </p>
            <h1 className="font-display text-3xl font-extrabold text-cream sm:text-4xl">Laboratorium Sang Eksponen</h1>
            <Speech
              who="kaciro"
              pose="board"
              size={80}
              className="mt-3 max-w-xl"
              text="Selamat datang di laboratoriumku! Di sini kamu bisa bereksperimen dengan bilangan berpangkat dan melihat penjelasan setiap hasilnya."
            />
          </div>
          <div className="hidden w-28 md:block">
            <Naru pose="hang" width="100%" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-5">
        <div className="mb-2 flex items-center justify-between text-cream">
          <p className="font-display font-bold">Pilih eksperimen</p>
          <p className="text-sm">
            {tried.length}/{LAB_IDS.length} dicoba{tried.length === LAB_IDS.length && " · Lencana Peneliti Laboratorium!"}
          </p>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Daftar eksperimen">
          {EXPS.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={cur === x.id}
              onClick={() => setCur(x.id)}
              className={`btn-game flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left font-display font-bold ${cur === x.id ? "border-sun bg-[#1f6b63] text-white shadow-[0_4px_0_#0f3a35]" : "border-white/20 bg-white/10 text-cream"}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/20">{x.code}</span>
              <span className="min-w-0 flex-1 text-sm leading-tight">{x.name}</span>
              {tried.includes(x.id) && <CheckCircle2 size={16} className="shrink-0 text-lime" />}
            </button>
          ))}
        </div>
        <div role="tabpanel" key={e.id}>
          <e.C onTry={() => void s.labTry(e.id, e.name)} />
        </div>
        <div className="mt-5 flex justify-end">
          <Kaciro pose="think" width={90} />
        </div>
      </div>
    </div>
  );
}
