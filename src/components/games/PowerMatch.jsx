"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { powerMatchPairs } from "@/data/games";
import { shuffle } from "@/data/questionBank";
import { MathText } from "../ui/MathText";
import { Speech } from "../ui/Panels";
import { play } from "@/lib/sound";

/** GAME 1 — cocokkan perkalian berulang dengan bentuk pangkat (ketuk dua kartu). */
export default function PowerMatch({ onEnd }) {
  const pairs = useMemo(() => powerMatchPairs(), []);
  const cards = useMemo(
    () =>
      shuffle(
        pairs.flatMap((p) => [
          { key: `r${p.id}`, pair: p.id, side: "repeat", text: p.repeat },
          { key: `p${p.id}`, pair: p.id, side: "power", text: p.power },
        ]),
      ),
    [pairs],
  );
  const [open, setOpen] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState("Ketuk satu kartu, lalu ketuk kartu pasangannya.");

  const tap = (c) => {
    if (matched.includes(c.pair) || wrong.length) return;
    play("tap");
    if (!open) return setOpen(c.key);
    if (open === c.key) return setOpen(null);
    const a = cards.find((x) => x.key === open);
    if (a.side === c.side) {
      setOpen(c.key);
      setMsg("Pilih kartu dari jenis yang berbeda: satu perkalian berulang dan satu bentuk pangkat.");
      return;
    }
    const rep = a.side === "repeat" ? a : c;
    const pow = a.side === "power" ? a : c;
    if (a.pair === c.pair) {
      play("correct");
      const next = [...matched, c.pair];
      setMatched(next);
      setOpen(null);
      setMsg(`Cocok! ${rep.text} = ${pow.text}`);
      if (next.length === pairs.length) {
        const raw = pairs.length * 10 - mistakes * 2;
        setTimeout(
          () =>
            onEnd({
              score: Math.max(0, Math.round((raw / (pairs.length * 10)) * 100)),
              correct: pairs.length,
              total: pairs.length,
              won: true,
              summary: `Semua ${pairs.length} pasangan ditemukan dengan ${mistakes} kesalahan.`,
            }),
          700,
        );
      }
    } else {
      play("wrong");
      setMistakes((m) => m + 1);
      const n = rep.text.split("×").length;
      const base = rep.text.split("×")[0].trim();
      setMsg(`Belum cocok. ${rep.text} punya ${n} faktor ${base}, jadi bentuk pangkatnya ${base}^{${n}}, bukan ${pow.text}.`);
      setWrong([a.key, c.key]);
      setTimeout(() => {
        setWrong([]);
        setOpen(null);
      }, 1100);
    }
  };

  return (
    <div>
      <div className="mb-3 flex justify-between font-display font-bold text-cream">
        <span>
          Pasangan: {matched.length}/{pairs.length}
        </span>
        <span>Poin: {matched.length * 10 - mistakes * 2 < 0 ? 0 : matched.length * 10 - mistakes * 2}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c) => {
          const done = matched.includes(c.pair);
          const isOpen = open === c.key;
          const isWrong = wrong.includes(c.key);
          return (
            <motion.button
              key={c.key}
              onClick={() => tap(c)}
              animate={isWrong ? { x: [0, -6, 6, -4, 0] } : done ? { scale: [1, 1.08, 1] } : {}}
              disabled={done}
              className={`min-h-20 rounded-2xl border-2 p-2 font-display text-base font-extrabold shadow-[0_4px_0_rgba(0,0,0,0.25)] sm:text-lg ${
                done
                  ? "border-leaf bg-[#e3f4dc] text-forest opacity-80"
                  : isWrong
                    ? "border-coral bg-[#fde6e2] text-[#7a2b2b]"
                    : isOpen
                      ? "border-sun bg-orange text-[#4a2410]"
                      : c.side === "repeat"
                        ? "border-[#d9c08f] bg-parchment text-jungle"
                        : "border-[#5fb5c9] bg-[#dff4f9] text-jungle"
              }`}
              aria-pressed={isOpen}
            >
              <MathText text={c.text} />
            </motion.button>
          );
        })}
      </div>
      <Speech who="kaciro" pose="tip" size={60} className="mt-4" text={msg} />
    </div>
  );
}
