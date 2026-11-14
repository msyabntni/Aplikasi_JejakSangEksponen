"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, Lock, Play, RotateCcw, Star, Swords, ScrollText } from "lucide-react";
import Naru from "@/components/characters/Naru";
import { AdventureMap } from "@/components/map/AdventureMap";
import { RegionScene } from "@/components/region/RegionScene";
import { GameButton } from "@/components/ui/GameButton";
import { Modal } from "@/components/ui/Panels";
import { MathText } from "@/components/ui/MathText";
import { useStore } from "@/lib/store/ProgressProvider";
import { challengeUnlocked, nextRegion, posttestUnlocked, regionRequirements, regionStatus } from "@/lib/unlock";
import { MISSION_PASS, REGIONS, getRegion } from "@/data/regions";

import { play } from "@/lib/sound";

const STATUS_LABEL = { locked: "Terkunci", new: "Belum dimainkan", progress: "Sedang berlangsung", done: "Selesai" };

export default function PetaPage() {
  const s = useStore();
  const j = s.journey;
  const [sel, setSel] = useState(null);
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const f = () => setSmall(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  const statuses = Object.fromEntries(REGIONS.map((r) => [r.id, regionStatus(j, s.pretestDone, r.id)]));
  const r = sel ? getRegion(sel) : null;
  const st = sel ? statuses[sel] : "locked";
  const req = sel ? regionRequirements(j, sel) : null;

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
      <div className={`relative mb-4 flex flex-wrap items-end justify-between gap-3 text-cream ${small ? "min-h-[150px] pr-[32vw]" : ""}`}>
        {/* di HP penanda peta diperbesar, jadi Naru menemani di samping judul (tidak menutupi peta) */}
        {small && (
          <div className="pointer-events-none absolute -top-5 right-0 w-[30vw] max-w-[120px]">
            <Naru pose="hang" width="100%" title="Naru menunggumu di peta" />
          </div>
        )}
        <div>
          <p className="font-display text-sm font-bold tracking-widest text-sun">PETA PETUALANGAN</p>
          <h1 className="font-display text-3xl font-extrabold">Jejak Sang Eksponen</h1>
          <p className="text-cream/80">Ketuk penanda wilayah untuk melihat misinya.</p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs font-bold" aria-label="Keterangan status">
          <li className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
            <Lock size={12} /> Terkunci
          </li>
          <li className="rounded-full bg-lime/30 px-2.5 py-1">Belum dimainkan</li>
          <li className="rounded-full bg-orange/40 px-2.5 py-1">Berlangsung</li>
          <li className="flex items-center gap-1 rounded-full bg-sun/40 px-2.5 py-1">
            <Star size={12} /> Selesai
          </li>
        </ul>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,640px)_1fr]">
        <div className="max-h-[78vh] overflow-y-auto rounded-[2rem] border-4 border-bark shadow-2xl">
          <AdventureMap
            statuses={statuses}
            naruAt={nextRegion(j, s.pretestDone) ?? 7}
            markerScale={small ? 1.5 : 1}
            onSelect={(id) => {
              play("tap");
              setSel(id);
            }}
          />
        </div>
        <aside className="space-y-4">
          <div className="parchment rounded-3xl p-4 text-jungle">
            <h2 className="font-display text-xl font-extrabold">Syarat wilayah selesai</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
              <li>Buka semua bagian materi (Pembuka sampai Rangkuman).</li>
              <li>Selesaikan misi interaktif wilayah dengan skor minimal {MISSION_PASS}.</li>
              <li>
                Tekan tombol <b>Selesaikan Wilayah</b> di bagian Rangkuman.
              </li>
            </ol>
            <p className="mt-2 text-sm text-earth">
              Wilayah berikutnya terbuka setelah wilayah sebelumnya selesai. Treasure Temple terbuka setelah Wilayah 01–06 selesai. Wilayah yang sudah terbuka
              bisa diulang kapan saja.
            </p>
          </div>
          <div className="wood rounded-3xl p-4">
            <h2 className="font-display text-xl font-extrabold text-sun">Tantangan Akhir</h2>
            <div className="mt-2 grid gap-2">
              <GameButton
                href="/challenge"
                variant={challengeUnlocked(j) ? "orange" : "ghost"}
                icon={challengeUnlocked(j) ? <Swords size={18} /> : <Lock size={18} />}
              >
                Jungle Challenge
              </GameButton>
              <GameButton
                href={posttestUnlocked(j) ? "/posttest" : "/camp?kunci=posttest"}
                variant={posttestUnlocked(j) ? "leaf" : "ghost"}
                icon={posttestUnlocked(j) ? <ScrollText size={18} /> : <Lock size={18} />}
              >
                Posttest
              </GameButton>
            </div>
          </div>
        </aside>
      </div>

      <Modal open={Boolean(r)} onClose={() => setSel(null)} title={r ? `WILAYAH ${r.code} dari 07 — ${r.name}` : ""} wide>
        {r && req && (
          <div className="text-jungle">
            <RegionScene region={r} className="h-36 rounded-2xl" compact />
            <h3 className="mt-3 font-display text-2xl font-extrabold">{r.title}</h3>
            <div className="mt-1 flex flex-wrap gap-2 text-sm font-bold">
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-0.5">
                <Clock size={14} /> ± {r.minutes} menit
              </span>
              <span className={`rounded-full px-3 py-0.5 ${st === "done" ? "bg-sun" : st === "locked" ? "bg-earth/20" : "bg-lime"}`}>{STATUS_LABEL[st]}</span>
            </div>
            <p className="mt-3 font-bold">Materi:</p>
            <p>{r.topics.join(" · ")}</p>
            <p className="mt-2 font-bold">Tujuan pembelajaran:</p>
            <ul className="list-disc pl-5">
              {r.goals.map((g) => (
                <li key={g}>
                  <MathText text={g} />
                </li>
              ))}
            </ul>
            {st !== "locked" && (
              <ul className="mt-3 space-y-1 rounded-2xl bg-white/70 p-3 text-sm">
                <li className="flex items-center gap-2">
                  {req.readAll ? <CheckCircle2 size={16} className="text-forest" /> : <Circle size={16} />} Semua bagian materi dibuka
                </li>
                <li className="flex items-center gap-2">
                  {req.missionPassed ? <CheckCircle2 size={16} className="text-forest" /> : <Circle size={16} />} Misi wilayah skor ≥ {MISSION_PASS} (terbaik:{" "}
                  {j.regions[r.id]?.missionBest ?? 0})
                </li>
                <li className="flex items-center gap-2">
                  {st === "done" ? <CheckCircle2 size={16} className="text-forest" /> : <Circle size={16} />} Wilayah diselesaikan
                </li>
              </ul>
            )}
            <div className="mt-4">
              {st === "locked" ? (
                <p className="flex items-center gap-2 rounded-2xl bg-earth/10 p-3 font-semibold">
                  <Lock size={18} />{" "}
                  {r.id === 7
                    ? "Selesaikan Wilayah 01–06 untuk membuka Treasure Temple."
                    : `Selesaikan Wilayah ${getRegion(r.id - 1).code} dulu untuk membuka wilayah ini.`}
                </p>
              ) : (
                <GameButton href={`/wilayah/${r.id}`} size="lg" full icon={st === "done" ? <RotateCcw /> : <Play />}>
                  {st === "done" ? "ULANGI WILAYAH" : st === "progress" ? "LANJUTKAN" : "MULAI JELAJAH"}
                </GameButton>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
