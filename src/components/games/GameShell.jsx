"use client";

import { useState } from "react";
import { ArrowLeft, Gamepad2, Play, RotateCcw, Trophy } from "lucide-react";

import { GameButton } from "../ui/GameButton";
import { Parchment, Speech, WoodSign } from "../ui/Panels";
import { Gem, TreasureChest } from "../scenery/Scenery";
import Naru from "../characters/Naru";
import { useStore } from "@/lib/store/ProgressProvider";
import { REWARDS } from "@/lib/gamification";

export function GameShell({ meta, Game }) {
  const s = useStore();
  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState(0);
  const [res, setRes] = useState(null);
  const [already, setAlready] = useState(false);
  const best = Math.max(0, ...(s.journey?.games.filter((g) => g.game === meta.id).map((g) => g.score) ?? []));

  const end = (r) => {
    setAlready(Boolean(s.journey?.gamesWon.includes(meta.id)));
    setRes(r);
    setPhase("result");
    void s.recordGame(meta.id, meta.title, r.score, r.correct, r.total, r.won);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <GameButton href="/game" variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
          Semua game
        </GameButton>
        <span className="rounded-full px-3 py-1 font-display text-sm font-bold text-white" style={{ background: meta.color }}>
          {meta.scene}
        </span>
      </div>

      {phase === "intro" && (
        <div className="animate-pop">
          <div className="text-center">
            <WoodSign>{meta.title.toUpperCase()}</WoodSign>
          </div>
          <Parchment className="mt-8">
            <p className="text-lg font-semibold text-jungle">{meta.tagline}</p>
            <h2 className="mt-4 font-display text-xl font-extrabold text-jungle">Petunjuk & Aturan</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-jungle">
              {meta.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
              <span className="rounded-full bg-white px-3 py-1 text-jungle">Mekanisme: {meta.mechanic}</span>
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-jungle">
                Hadiah menang pertama: +{REWARDS.game.xp} XP · +{REWARDS.game.gems} <Gem size={14} />
              </span>
              {best > 0 && <span className="rounded-full bg-sun px-3 py-1 text-earth">Skor terbaik: {best}</span>}
            </div>
            <Speech who="naru" pose="point" size={76} className="mt-4" text="Sudah baca aturannya? Ayo main! Aku yakin kamu bisa!" />
            <GameButton
              size="lg"
              full
              className="mt-4"
              onClick={() => {
                setRound((r) => r + 1);
                setPhase("play");
              }}
              icon={<Play />}
            >
              MAIN SEKARANG
            </GameButton>
          </Parchment>
        </div>
      )}

      {phase === "play" && <Game key={round} onEnd={end} />}

      {phase === "result" && res && (
        <Parchment className="animate-pop text-center">
          <div className="flex items-end justify-center gap-3">
            <Naru pose={res.won ? "cheer" : "idle"} mood={res.won ? "cheer" : "worried"} width={120} />
            {res.won && <TreasureChest open width={110} />}
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-jungle">{res.won ? "Kamu berhasil!" : "Hampir berhasil!"}</h2>
          <p className="text-jungle">{res.summary ?? `${res.correct} dari ${res.total} tepat`}</p>
          <p className="my-3 flex items-center justify-center gap-2 font-display text-6xl font-extrabold text-orange">
            <Trophy size={44} /> {res.score}
          </p>
          {res.won ? (
            <p className="text-sm text-earth">
              {already
                ? "Kamu sudah pernah menang di game ini, jadi XP-nya bonus kecil saja."
                : `Hadiah: +${REWARDS.game.xp} XP dan ${REWARDS.game.gems} permata!`}
            </p>
          ) : (
            <Speech
              who="kaciro"
              pose="tip"
              size={64}
              className="text-left"
              text="Tidak apa-apa! Coba lagi dan perhatikan penjelasan di setiap langkah. Hadiah diberikan saat kamu menang."
            />
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <GameButton
              onClick={() => {
                setRound((r) => r + 1);
                setPhase("play");
              }}
              icon={<RotateCcw size={18} />}
            >
              Main lagi
            </GameButton>
            <GameButton href="/game" variant="cream" icon={<Gamepad2 size={18} />}>
              Game lain
            </GameButton>
          </div>
        </Parchment>
      )}
    </div>
  );
}
