"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { chestRound } from "@/data/games";
import { GameButton } from "../ui/GameButton";
import { Parchment, Speech } from "../ui/Panels";
import { MathText } from "../ui/MathText";
import { Gem, TreasureChest } from "../scenery/Scenery";
import { play } from "@/lib/sound";

const TRIES = 3;

/** GAME 4 — buka peti dengan kode dari hasil perpangkatan (roda angka). */
export default function MysteryChest({ onEnd }) {
  const chests = useMemo(() => chestRound(4), []);
  const [idx, setIdx] = useState(0);
  const c = chests[idx];
  const digits = Math.max(3, String(c.code).length);
  const [wheel, setWheel] = useState(() => Array(digits).fill(0));
  const [tries, setTries] = useState(0);
  const [opened, setOpened] = useState(0);
  const [state, setState] = useState("play");
  const [msg, setMsg] = useState(null);

  const spin = (k, d) => {
    play("tap");
    setWheel((w) => w.map((v, i) => (i === k ? (v + d + 10) % 10 : v)));
    setMsg(null);
  };

  const code = Number(wheel.join(""));
  const tryOpen = () => {
    const t = tries + 1;
    setTries(t);
    if (code === c.code) {
      play("reward");
      setOpened((o) => o + 1);
      setState("open");
    } else {
      play("wrong");
      if (t >= TRIES) {
        setState("fail");
      } else {
        setMsg(
          `Kode ${code} belum tepat. ${code < c.code ? "Hasilnya lebih besar dari itu." : "Hasilnya lebih kecil dari itu."} Sisa kesempatan: ${TRIES - t}.`,
        );
      }
    }
  };

  const nextChest = () => {
    if (idx === chests.length - 1) {
      const o = opened;
      onEnd({
        score: Math.round((o / chests.length) * 100),
        correct: o,
        total: chests.length,
        won: o >= 3,
        summary: `${o} dari ${chests.length} peti terbuka. Permata terkumpul: ${o}.`,
      });
      return;
    }
    const nc = chests[idx + 1];
    setIdx(idx + 1);
    setWheel(Array(Math.max(3, String(nc.code).length)).fill(0));
    setTries(0);
    setState("play");
    setMsg(null);
  };

  return (
    <div>
      <div className="mb-3 flex justify-between font-display font-bold text-cream">
        <span>
          Peti {idx + 1}/{chests.length}
        </span>
        <span className="flex items-center gap-1">
          <Gem size={18} /> {opened}
        </span>
      </div>
      <Parchment className="text-center">
        <motion.div
          key={`${idx}-${state}`}
          initial={{ scale: 0.9 }}
          animate={state === "fail" ? { x: [0, -8, 8, -6, 0] } : { scale: 1 }}
          className="mx-auto w-40"
        >
          <TreasureChest open={state === "open"} width={160} />
        </motion.div>
        <p className="mt-2 text-sm font-bold text-earth">Petunjuk kode peti:</p>
        <p className="font-display text-4xl font-extrabold text-jungle">
          <MathText text={`${c.clue} = ?`} />
        </p>

        <div className="mt-4 flex justify-center gap-2" aria-label="Roda angka">
          {wheel.map((v, k) => (
            <div key={k} className="flex flex-col items-center">
              <button
                onClick={() => spin(k, 1)}
                disabled={state !== "play"}
                className="rounded-t-xl bg-earth px-3 py-1 text-cream"
                aria-label={`Naikkan digit ${k + 1}`}
              >
                <ChevronUp />
              </button>
              <motion.span
                key={v}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="grid h-16 w-14 place-items-center bg-jungle font-display text-4xl font-extrabold text-sun"
                aria-live="polite"
              >
                {v}
              </motion.span>
              <button
                onClick={() => spin(k, -1)}
                disabled={state !== "play"}
                className="rounded-b-xl bg-earth px-3 py-1 text-cream"
                aria-label={`Turunkan digit ${k + 1}`}
              >
                <ChevronDown />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-earth">
          Kode dibaca dari kiri: {wheel.join("")} → {code}. Kesempatan: {TRIES - tries}
        </p>

        {msg && <Speech who="kaciro" pose="think" size={56} side="right" className="mt-3 text-left" text={msg} />}
        {state === "open" && (
          <Speech who="naru" pose="cheer" size={60} className="mt-3 text-left" text={`Peti terbuka! ${c.clue} = ${c.code}. Satu permata untukmu!`} />
        )}
        {state === "fail" && (
          <Speech
            who="kaciro"
            pose="tip"
            size={60}
            side="right"
            className="mt-3 text-left"
            text={`Kesempatan habis. Kodenya ${c.code}, karena ${c.clue} = ${c.code}. Peti berikutnya pasti bisa!`}
          />
        )}

        <div className="mt-4 flex justify-center">
          {state === "play" ? (
            <GameButton size="lg" onClick={tryOpen}>
              BUKA PETI
            </GameButton>
          ) : (
            <GameButton size="lg" variant="leaf" onClick={nextChest}>
              {idx === chests.length - 1 ? "Lihat hasil" : "Peti berikutnya"}
            </GameButton>
          )}
        </div>
      </Parchment>
    </div>
  );
}
