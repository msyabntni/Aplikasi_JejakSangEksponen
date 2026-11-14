"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { MathText } from "../ui/MathText";
import { GameButton } from "../ui/GameButton";
import { formatRational, powExact } from "@/lib/math/exponent";

function Stone({ label, crossed, color = "#e8e4d6" }) {
  return (
    <motion.span
      layout
      initial={{ scale: 0 }}
      animate={{ scale: 1, opacity: crossed ? 0.35 : 1 }}
      exit={{ scale: 0 }}
      className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-[#8a826b] font-display text-xl font-extrabold text-jungle shadow-[0_3px_0_#8a826b]"
      style={{ background: color }}
    >
      {label}
      {crossed && <span className="absolute h-1 w-12 rotate-45 rounded bg-coral" />}
    </motion.span>
  );
}

const val = (b, e) => {
  const r = powExact(b, e);
  return r.ok ? formatRational(r.value) : "?";
};

function Repeat() {
  const [n, setN] = useState(3);
  return (
    <div className="text-center">
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-1.5">
        <AnimatePresence>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="font-bold text-earth">×</span>}
              <Stone label={2} />
            </span>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-jungle">
        <MathText text={`2^{${n}} = ${val(2, n)}`} />
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          className="btn-game grid h-11 w-11 place-items-center rounded-full bg-earth text-white"
          onClick={() => setN((x) => Math.max(1, x - 1))}
          aria-label="Kurangi faktor"
        >
          <Minus />
        </button>
        <span className="font-bold text-earth">{n} faktor</span>
        <button
          className="btn-game grid h-11 w-11 place-items-center rounded-full bg-forest text-white"
          onClick={() => setN((x) => Math.min(8, x + 1))}
          aria-label="Tambah faktor"
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}

function Merge() {
  const [merged, setMerged] = useState(false);
  return (
    <div className="text-center">
      <div className={`flex flex-wrap items-center justify-center gap-3 ${merged ? "gap-1" : ""}`}>
        <motion.div layout className={`flex gap-1 rounded-2xl p-2 ${merged ? "" : "bg-[#fde6d0]"}`}>
          {[0, 1, 2].map((i) => (
            <Stone key={i} label={2} color="#ffd9b8" />
          ))}
        </motion.div>
        {!merged && <span className="font-display text-2xl font-extrabold text-earth">×</span>}
        <motion.div layout className={`flex gap-1 rounded-2xl p-2 ${merged ? "" : "bg-[#dcefd7]"}`}>
          {[0, 1].map((i) => (
            <Stone key={i} label={2} color="#cfe9c8" />
          ))}
        </motion.div>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-jungle">
        <MathText text={merged ? "2^{3} × 2^{2} = 2^{3+2} = 2^{5} = 32" : "2^{3} × 2^{2} = ?"} />
      </p>
      <GameButton
        size="sm"
        className="mt-2"
        variant={merged ? "cream" : "orange"}
        onClick={() => setMerged((m) => !m)}
        icon={merged ? <RotateCcw size={16} /> : undefined}
      >
        {merged ? "Pisahkan lagi" : "Gabungkan batu!"}
      </GameButton>
    </div>
  );
}

function Cancel() {
  const [k, setK] = useState(0);
  return (
    <div className="text-center">
      <div className="inline-block">
        <div className="flex justify-center gap-1.5 pb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Stone key={i} label={3} crossed={i < k} />
          ))}
        </div>
        <div className="h-1 rounded bg-earth" />
        <div className="flex justify-center gap-1.5 pt-2">
          {[0, 1].map((i) => (
            <Stone key={i} label={3} crossed={i < k} />
          ))}
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-jungle">
        <MathText text={k < 2 ? `3^{5} : 3^{2}  (tercoret ${k} pasang)` : "3^{5} : 3^{2} = 3^{5−2} = 3^{3} = 27"} />
      </p>
      <GameButton size="sm" className="mt-2" onClick={() => setK((x) => (x >= 2 ? 0 : x + 1))} variant={k >= 2 ? "cream" : "orange"}>
        {k >= 2 ? "Ulangi" : "Coret sepasang faktor"}
      </GameButton>
    </div>
  );
}

function Nest() {
  const [n, setN] = useState(2);
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: n }, (_, g) => (
          <div key={g} className="flex gap-1 rounded-2xl border-2 border-dashed border-[#b7a3f0] bg-[#efe9ff] p-2">
            {[0, 1, 2].map((i) => (
              <Stone key={i} label={2} color="#ddd2ff" />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-jungle">
        <MathText text={`(2^{3})^{${n}} = 2^{3×${n}} = 2^{${3 * n}} = ${val(2, 3 * n)}`} />
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          className="btn-game grid h-11 w-11 place-items-center rounded-full bg-earth text-white"
          onClick={() => setN((x) => Math.max(1, x - 1))}
          aria-label="Kurangi pangkat luar"
        >
          <Minus />
        </button>
        <span className="font-bold text-earth">pangkat luar: {n}</span>
        <button
          className="btn-game grid h-11 w-11 place-items-center rounded-full bg-forest text-white"
          onClick={() => setN((x) => Math.min(4, x + 1))}
          aria-label="Tambah pangkat luar"
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}

function Pattern({ from, to }) {
  const [shown, setShown] = useState(from === 3 ? 4 : 4);
  const rows = [];
  for (let e = 3; e >= to; e--) rows.push(e);
  const visible = rows.slice(0, shown);
  return (
    <div className="text-center">
      <div className="mx-auto grid max-w-xs gap-1.5">
        {visible.map((e, i) => (
          <motion.div
            key={e}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center justify-between rounded-xl px-4 py-1.5 font-display text-xl font-extrabold ${e <= 0 ? "bg-sun text-earth" : "bg-white text-jungle"}`}
          >
            <MathText text={`2^{${e < 0 ? "−" + -e : e}}`} />
            <span>= {val(2, e)}</span>
            {i > 0 && <span className="text-sm font-bold text-earth">: 2</span>}
          </motion.div>
        ))}
      </div>
      <GameButton
        size="sm"
        className="mt-3"
        onClick={() => setShown((s) => (s >= rows.length ? 2 : s + 1))}
        variant={shown >= rows.length ? "cream" : "orange"}
      >
        {shown >= rows.length ? "Ulangi pola" : "Turunkan pangkat (bagi 2)"}
      </GameButton>
    </div>
  );
}

function Combo() {
  const [step, setStep] = useState(0);
  const steps = ["2^{3} × 2^{2} : 2^{4}", "= 2^{3+2−4}", "= 2^{1}", "= 2"];
  return (
    <div className="text-center">
      <div className="space-y-1 font-display text-2xl font-extrabold text-jungle">
        {steps.slice(0, step + 1).map((s) => (
          <motion.p key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <MathText text={s} />
          </motion.p>
        ))}
      </div>
      <GameButton
        size="sm"
        className="mt-3"
        onClick={() => setStep((s) => (s >= steps.length - 1 ? 0 : s + 1))}
        variant={step >= steps.length - 1 ? "cream" : "orange"}
      >
        {step >= steps.length - 1 ? "Ulangi" : "Langkah berikutnya"}
      </GameButton>
    </div>
  );
}

export function ConceptVisual({ kind }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-earth/30 bg-white/60 p-4">
      {kind === "repeat" && <Repeat />}
      {kind === "merge" && <Merge />}
      {kind === "cancel" && <Cancel />}
      {kind === "nest" && <Nest />}
      {kind === "zero" && <Pattern from={3} to={0} />}
      {kind === "negative" && <Pattern from={3} to={-3} />}
      {kind === "combo" && <Combo />}
    </div>
  );
}
