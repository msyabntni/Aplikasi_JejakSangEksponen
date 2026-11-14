"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Parchment } from "@/components/ui/Panels";
import { GameButton } from "@/components/ui/GameButton";
import Kaciro from "@/components/characters/Kaciro";
import { useStore } from "@/lib/store/ProgressProvider";

import { fmtShort } from "@/lib/format";

const TYPE_LABEL = {
  identitas: "Identitas",
  pretest: "Pretest",
  materi: "Materi",
  "misi-wilayah": "Misi wilayah",
  "wilayah-selesai": "Wilayah",
  latihan: "Latihan",
  "mini-game": "Mini-game",
  laboratorium: "Laboratorium",
  "jungle-challenge": "Jungle Challenge",
  posttest: "Posttest",
  lencana: "Lencana",
  level: "Level",
  profil: "Profil",
};

const FILTERS = [
  { id: "all", label: "Semua", types: null },
  { id: "materi", label: "Materi & wilayah", types: ["materi", "misi-wilayah", "wilayah-selesai"] },
  { id: "latihan", label: "Latihan", types: ["latihan"] },
  { id: "game", label: "Mini-game", types: ["mini-game"] },
  { id: "eval", label: "Evaluasi", types: ["pretest", "jungle-challenge", "posttest"] },
  { id: "hadiah", label: "Hadiah", types: ["lencana", "level"] },
];

export default function RiwayatPage() {
  const s = useStore();
  const j = s.journey;
  const [f, setF] = useState("all");
  const filter = FILTERS.find((x) => x.id === f);
  const items = [...j.activity].reverse().filter((a) => !filter.types || filter.types.includes(a.type));
  const otherJourneys = s.save.journeys.filter((x) => x.id !== j.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-sm font-bold tracking-widest text-sun">
            <ScrollText size={16} /> RIWAYAT
          </p>
          <h1 className="font-display text-3xl font-extrabold text-cream">Catatan Perjalanan</h1>
          <p className="text-cream/80">Hanya kamu yang bisa melihat riwayat ini.</p>
        </div>
        <Kaciro pose="book" width="min(28vw, 112px)" />
      </div>

      <div className="no-scrollbar my-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((x) => (
          <button
            key={x.id}
            onClick={() => setF(x.id)}
            aria-pressed={f === x.id}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 font-display text-sm font-bold ${f === x.id ? "bg-orange text-[#4a2410]" : "bg-white/10 text-cream"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <Parchment className="p-0 sm:p-0">
        {items.length === 0 ? (
          <div className="p-6 text-center text-jungle">
            Belum ada catatan di kategori ini.
            <div className="mt-3">
              <GameButton href="/peta" size="sm">
                Mulai menjelajah
              </GameButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm text-jungle">
              <thead className="bg-[#efe2bf] font-display">
                <tr>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Jenis</th>
                  <th className="px-3 py-2">Aktivitas</th>
                  <th className="px-3 py-2">Nilai</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-earth/10">
                    <td className="whitespace-nowrap px-3 py-2 text-earth">{fmtShort(a.at)}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold">{TYPE_LABEL[a.type]}</span>
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {a.title}
                      {a.detail && <span className="font-normal text-earth"> · {a.detail}</span>}
                    </td>
                    <td className="px-3 py-2 font-display font-extrabold">{a.score ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.status === "selesai" ? "bg-[#e3f4dc] text-forest" : a.status === "dicoba" ? "bg-[#fde6d0] text-[#a3521c]" : "bg-white text-earth"}`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Parchment>

      {otherJourneys.length > 0 && (
        <Parchment className="mt-5">
          <h2 className="font-display text-xl font-extrabold text-jungle">Perjalanan sebelumnya</h2>
          <ul className="mt-2 space-y-2">
            {otherJourneys.map((o) => {
              const pre = s.save.pretests.filter((p) => p.journeyId === o.id).at(-1);
              const post = s.save.posttests.filter((p) => p.journeyId === o.id).at(-1);
              return (
                <li key={o.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm text-jungle">
                  <b>{o.explorer.name}</b> · dimulai {fmtShort(o.startedAt)} · pretest {pre?.score ?? "—"} · posttest {post?.score ?? "—"} · {o.activity.length}{" "}
                  catatan
                </li>
              );
            })}
          </ul>
        </Parchment>
      )}
    </div>
  );
}
