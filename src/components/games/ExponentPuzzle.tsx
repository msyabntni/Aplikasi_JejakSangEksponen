"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { checkPuzzle, makePuzzles, type Puzzle } from "@/data/games";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech } from "../ui/Panels";
import { MathText } from "../ui/MathText";
import { play } from "@/lib/sound";
import type { GameEnd } from "./GameShell";

function Slot({ v, blank, active, onClick, big }: { v: number | null; blank: boolean; active?: boolean; onClick?: () => void; big?: boolean }) {
  const cls = big ? "h-16 min-w-14 text-4xl" : "h-10 min-w-10 text-2xl -mt-8";
  if (!blank)
    return <span className={`grid place-items-center rounded-xl px-1 font-display font-extrabold text-jungle ${cls}`}>{v}</span>;
  return (
    <button
      onClick={onClick}
      aria-label={v === null ? "Slot kosong" : `Slot berisi ${v}, ketuk untuk mengosongkan`}
      className={`grid place-items-center rounded-xl border-2 border-dashed px-1 font-display font-extrabold transition ${cls} ${
        v === null ? (active ? "border-orange bg-orange/20" : "border-earth/50 bg-white/60") : "border-solid border-forest bg-[#e3f4dc] text-forest"
      }`}
    >
      {v ?? "?"}
    </button>
  );
}

/** GAME 3 — susun potongan menjadi persamaan pangkat yang benar. */
export default function ExponentPuzzle({ onEnd }: { onEnd: (r: GameEnd) => void }) {
  const puzzles = useMemo(() => makePuzzles(6), []);
  const [idx, setIdx] = useState(0);
  const [fill, setFill] = useState<Record<number, number | null>>({});
  const [usedPieces, setUsedPieces] = useState<Record<number, number>>({}); // slot -> piece index
  const [selPiece, setSelPiece] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [solved, setSolved] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const p: Puzzle = puzzles[idx];

  const valueAt = (slot: number) => (p.blanks.includes(slot) ? fill[slot] ?? null : p.values[slot]);
  const placed = new Set(Object.values(usedPieces));

  const placeIn = (slot: number, pieceIdx: number) => {
    setFill((f) => ({ ...f, [slot]: p.pieces[pieceIdx] }));
    setUsedPieces((u) => ({ ...u, [slot]: pieceIdx }));
    setSelPiece(null);
    setFeedback(null);
    play("tap");
  };

  const tapPiece = (k: number) => {
    if (placed.has(k)) return;
    const empty = p.blanks.find((b) => fill[b] == null);
    if (selPiece === k || empty === undefined) {
      setSelPiece(selPiece === k ? null : k);
      return;
    }
    // ketuk potongan langsung mengisi slot kosong pertama
    placeIn(empty, k);
  };

  const tapSlot = (slot: number) => {
    if (fill[slot] != null) {
      setFill((f) => ({ ...f, [slot]: null }));
      setUsedPieces((u) => {
        const n = { ...u };
        delete n[slot];
        return n;
      });
      return;
    }
    if (selPiece !== null) placeIn(slot, selPiece);
  };

  const next = (wasSolved: boolean) => {
    const s = solved + (wasSolved ? 1 : 0);
    if (idx === puzzles.length - 1) {
      onEnd({ score: Math.round((s / puzzles.length) * 100), correct: s, total: puzzles.length, won: s >= 4, summary: `${s} dari ${puzzles.length} teka-teki terpecahkan.` });
      return;
    }
    setSolved(s);
    setIdx(idx + 1);
    setFill({});
    setUsedPieces({});
    setSelPiece(null);
    setAttempt(0);
    setFeedback(null);
  };

  const check = () => {
    const filled = [0, 1, 2, 3, 4, 5].map((k) => valueAt(k) ?? 0);
    const r = checkPuzzle(p, filled);
    setFeedback({ ok: r.ok, text: r.explain });
    play(r.ok ? "correct" : "wrong");
    setAttempt((a) => a + 1);
  };

  const allFilled = p.blanks.every((b) => fill[b] != null);
  const answerText =
    p.op === "pow"
      ? `(${p.values[0]}^{${p.values[1]}})^{${p.values[3]}} = ${p.values[4]}^{${p.values[5]}}`
      : `${p.values[0]}^{${p.values[1]}} ${p.op} ${p.values[2]}^{${p.values[3]}} = ${p.values[4]}^{${p.values[5]}}`;

  return (
    <div>
      <div className="mb-3 flex justify-between font-display font-bold text-cream">
        <span>Teka-teki {idx + 1}/{puzzles.length}</span>
        <span>Terpecahkan: {solved}</span>
      </div>
      <Parchment>
        <p className="text-center text-sm font-bold text-earth">Lengkapi persamaan pada batu bertulis:</p>
        <motion.div key={idx} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="stone mx-auto mt-3 flex max-w-xl flex-wrap items-center justify-center gap-1 rounded-3xl px-3 py-6">
          {p.op === "pow" && <span className="font-display text-5xl font-extrabold text-jungle">(</span>}
          <Slot v={valueAt(0)} blank={p.blanks.includes(0)} big onClick={() => tapSlot(0)} active={selPiece !== null} />
          <Slot v={valueAt(1)} blank={p.blanks.includes(1)} onClick={() => tapSlot(1)} active={selPiece !== null} />
          {p.op === "pow" ? (
            <>
              <span className="font-display text-5xl font-extrabold text-jungle">)</span>
              <Slot v={valueAt(3)} blank={p.blanks.includes(3)} onClick={() => tapSlot(3)} active={selPiece !== null} />
            </>
          ) : (
            <>
              <span className="mx-1 font-display text-4xl font-extrabold text-earth">{p.op}</span>
              <Slot v={valueAt(2)} blank={p.blanks.includes(2)} big onClick={() => tapSlot(2)} active={selPiece !== null} />
              <Slot v={valueAt(3)} blank={p.blanks.includes(3)} onClick={() => tapSlot(3)} active={selPiece !== null} />
            </>
          )}
          <span className="mx-2 font-display text-4xl font-extrabold text-earth">=</span>
          <Slot v={valueAt(4)} blank={p.blanks.includes(4)} big onClick={() => tapSlot(4)} active={selPiece !== null} />
          <Slot v={valueAt(5)} blank={p.blanks.includes(5)} onClick={() => tapSlot(5)} active={selPiece !== null} />
        </motion.div>

        <p className="mt-4 text-center text-sm font-bold text-earth">Potongan angka</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {p.pieces.map((v, k) => (
            <button
              key={k}
              onClick={() => tapPiece(k)}
              disabled={placed.has(k)}
              aria-pressed={selPiece === k}
              className={`btn-game h-14 w-14 rounded-2xl border-2 font-display text-2xl font-extrabold shadow-[0_4px_0_#3e2718] ${
                placed.has(k) ? "invisible" : selPiece === k ? "border-sun bg-orange text-[#4a2410]" : "wood"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {feedback && (
          <Speech who={feedback.ok ? "naru" : "kaciro"} pose={feedback.ok ? "cheer" : "think"} size={60} className="mt-4" side={feedback.ok ? "left" : "right"}>
            <MathText text={feedback.text} />
            {!feedback.ok && attempt >= 2 && (
              <p className="mt-1 text-sm">Susunan yang benar, misalnya: <b><MathText text={answerText} /></b></p>
            )}
          </Speech>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {feedback?.ok ? (
            <GameButton variant="leaf" onClick={() => next(true)}>{idx === puzzles.length - 1 ? "Lihat hasil" : "Teka-teki berikutnya"}</GameButton>
          ) : attempt >= 2 ? (
            <GameButton variant="cream" onClick={() => next(false)}>Lewati</GameButton>
          ) : null}
          {!feedback?.ok && (
            <GameButton onClick={check} disabled={!allFilled}>PERIKSA</GameButton>
          )}
        </div>
        <p className="mt-2 text-xs text-earth">Kamu punya 2 kesempatan memeriksa setiap teka-teki. Menang jika minimal 4 teka-teki terpecahkan.</p>
      </Parchment>
    </div>
  );
}
