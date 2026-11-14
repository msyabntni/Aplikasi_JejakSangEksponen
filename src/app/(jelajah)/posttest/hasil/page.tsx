"use client";

import { Check, RotateCcw, TrendingUp, X } from "lucide-react";
import Naru from "@/components/characters/Naru";
import { ExamGate } from "@/components/quiz/ExamGate";
import { ReviewList } from "@/components/quiz/ReviewList";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, WoodSign } from "@/components/ui/Panels";
import { POSTTEST } from "@/data/exams";
import { useStore } from "@/lib/store/ProgressProvider";
import { fmtDate } from "@/lib/format";

export default function PosttestResultPage() {
  const s = useStore();
  const p = s.posttest;
  if (!p) {
    return (
      <ExamGate tone="post">
        <Parchment className="text-center text-jungle">
          Belum ada hasil posttest.
          <GameButton href="/camp" className="mt-3">Ke Camp</GameButton>
        </Parchment>
      </ExamGate>
    );
  }
  const diff = s.pretest ? p.score - s.pretest.score : null;
  return (
    <ExamGate tone="post">
      <div className="text-center"><WoodSign>HASIL POSTTEST</WoodSign></div>
      <Parchment className="mt-8">
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto grid h-40 w-40 place-items-center rounded-full border-8 border-earth bg-jungle text-center shadow-[0_6px_0_#3e2718]">
            <div>
              <div className="font-display text-6xl font-extrabold text-sun">{p.score}</div>
              <div className="text-sm font-bold text-cream">dari 100</div>
            </div>
          </div>
          <div className="text-jungle">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#e3f4dc] px-3 py-1 font-bold text-forest"><Check size={16} /> {p.correct} benar</span>
              <span className="flex items-center gap-1 rounded-full bg-[#fde6e2] px-3 py-1 font-bold text-[#7a2b2b]"><X size={16} /> {p.wrong} salah</span>
            </div>
            <p className="mt-2 text-sm text-earth">Selesai {fmtDate(p.finishedAt)}</p>
            {diff !== null && (
              <p className="mt-2 font-display text-xl font-extrabold">
                Dibanding pretest ({s.pretest!.score}): <span className={diff >= 0 ? "text-forest" : "text-[#a3521c]"}>{diff >= 0 ? `+${diff}` : diff}</span>
              </p>
            )}
          </div>
        </div>
      </Parchment>
      <div className="mt-5">
        <Speech who="naru" pose={diff !== null && diff > 0 ? "cheer" : "jump"} size={84} text={diff !== null && diff > 0 ? "Wihhh! Kamu makin kuat! Ternyata kekuatan pangkat tidak bisa dianggap remeh!" : "Kerja bagus sudah sampai sejauh ini! Lihat pembahasannya, lalu coba lagi kapan saja."} />
      </div>
      <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-cream">Ringkasan & pembahasan</h2>
      <ReviewList questions={POSTTEST} answers={p.answers} />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <GameButton href="/perkembangan" icon={<TrendingUp />}>LIHAT HASIL BELAJAR</GameButton>
        <GameButton href="/posttest" variant="cream" icon={<RotateCcw size={18} />}>Kerjakan lagi</GameButton>
      </div>
      <div className="mt-6 flex justify-center"><Naru pose="sit" width={90} /></div>
    </ExamGate>
  );
}
