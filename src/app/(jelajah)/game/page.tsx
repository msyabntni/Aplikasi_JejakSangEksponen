"use client";

import Link from "next/link";
import { CheckCircle2, Gamepad2, Trophy } from "lucide-react";
import Naru from "@/components/characters/Naru";
import { HangingVines, Fireflies } from "@/components/scenery/Scenery";
import { Speech } from "@/components/ui/Panels";
import { GAMES } from "@/data/games";
import { useStore } from "@/lib/store/ProgressProvider";

export default function GameHub() {
  const s = useStore();
  const j = s.journey!;
  return (
    <div>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#5a3a28,#173F2A)] px-4 pb-6 pt-8">
        <HangingVines count={6} seed={11} />
        <Fireflies count={8} />
        <div className="relative z-20 mx-auto flex max-w-5xl items-end gap-4">
          <div className="flex-1">
            <p className="flex items-center gap-2 font-display text-sm font-bold tracking-widest text-sun"><Gamepad2 size={16} /> ARENA MINI-GAME</p>
            <h1 className="font-display text-3xl font-extrabold text-cream sm:text-4xl">Main Sambil Belajar</h1>
            <Speech who="naru" pose="peek" size={70} className="mt-3 max-w-xl" text={`Enam permainan seru menunggumu! Kamu sudah menang di ${j.gamesWon.length} dari ${GAMES.length} game.`} />
          </div>
          <div className="hidden w-32 sm:block"><Naru pose="jump" width="100%" /></div>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => {
          const won = j.gamesWon.includes(g.id);
          const best = Math.max(0, ...j.games.filter((x) => x.game === g.id).map((x) => x.score));
          return (
            <Link
              key={g.id}
              href={`/game/${g.id}`}
              className={`btn-game group relative flex flex-col overflow-hidden rounded-3xl border-4 border-black/10 bg-parchment text-jungle shadow-[0_6px_0_rgba(0,0,0,0.3)] ${i % 3 === 1 ? "lg:translate-y-4" : ""}`}
            >
              <div className="relative h-24 p-3 text-white" style={{ background: g.color }}>
                <span className="font-display text-sm font-bold opacity-90">GAME {i + 1}</span>
                <p className="font-display text-2xl font-extrabold drop-shadow">{g.title}</p>
                {won && <CheckCircle2 className="absolute right-3 top-3" />}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-[15px]">{g.tagline}</p>
                <div className="mt-auto flex items-center justify-between pt-3 text-sm font-bold">
                  <span className="rounded-full bg-white px-2 py-0.5">{g.mechanic}</span>
                  {best > 0 && <span className="flex items-center gap-1 text-earth"><Trophy size={14} /> {best}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
