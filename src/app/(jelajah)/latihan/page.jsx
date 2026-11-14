"use client";

import { useState } from "react";
import { BookOpenCheck, RotateCcw } from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { PracticeRunner } from "@/components/quiz/PracticeRunner";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech } from "@/components/ui/Panels";
import { Mushroom, Monstera } from "@/components/scenery/Scenery";
import { drawPractice, PRACTICE_SIZES, QUESTION_BANK } from "@/data/questionBank";
import { useStore } from "@/lib/store/ProgressProvider";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { fmtShort } from "@/lib/format";
import { GradedBy } from "@/components/ui/GradedBy";

const LEVEL_INFO = {
  1: { desc: "Pengertian, basis & eksponen, perkalian berulang, menentukan nilai.", color: "bg-[#e3f4dc]", shadow: "shadow-[0_6px_0_#62A66B]" },
  2: { desc: "Perkalian, pembagian, pangkat dari pangkat, pangkat nol.", color: "bg-[#fde6d0]", shadow: "shadow-[0_6px_0_#F39B57]" },
  3: { desc: "Pangkat negatif, soal gabungan, soal cerita, beberapa langkah.", color: "bg-[#efe9ff]", shadow: "shadow-[0_6px_0_#7b63c4]" },
};

export default function LatihanPage() {
  const s = useStore();
  const [level, setLevel] = useState(1);
  const [count, setCount] = useState(10);
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const history = [...(s.journey?.practice ?? [])].reverse().slice(0, 5);

  const start = () => {
    setResult(null);
    setSession({ qs: drawPractice(level, count), key: Date.now() });
  };

  if (session && !result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <PracticeRunner
          key={session.key}
          title={`Latihan ${DIFFICULTY_LABEL[level]}`}
          questions={session.qs}
          onFinish={async ({ answers }) => {
            const r = await s.recordPractice(level, session.qs, answers);
            setResult(r);
          }}
        />
      </div>
    );
  }

  if (session && result) {
    const good = result.score >= 70;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Parchment className="text-center">
          <div className="mx-auto w-40">
            <Naru pose={good ? "cheer" : "jump"} width="100%" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-jungle">Latihan selesai!</h1>
          <GradedBy by={result.gradedBy} className="mt-1" />
          <p className="mt-1 text-lg text-jungle">
            {DIFFICULTY_LABEL[level]} · {result.correct} dari {result.total} benar
          </p>
          <p className="my-3 font-display text-6xl font-extrabold text-orange">{result.score}</p>
          <Speech
            who="kaciro"
            pose={good ? "cheer" : "tip"}
            size={70}
            className="text-left"
            text={
              good
                ? "Bagus! Sekarang kamu sudah memahami konsepnya. Yuk, coba satu tingkat lagi!"
                : "Tidak apa-apa. Baca lagi pembahasan di setiap soal, lalu coba latihan baru. Soalnya diacak, jadi kamu akan mendapat soal berbeda."
            }
          />
          <p className="mt-2 text-xs text-earth">
            XP penuh hanya untuk sesi pertama di setiap tingkat. Sesi berikutnya memberi bonus kecil, maksimal sekali sehari.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <GameButton onClick={start} icon={<RotateCcw size={18} />}>
              Latihan lagi
            </GameButton>
            <GameButton
              variant="cream"
              onClick={() => {
                setSession(null);
                setResult(null);
              }}
            >
              Pilih tingkat lain
            </GameButton>
          </div>
        </Parchment>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <Monstera className="pointer-events-none absolute -right-10 top-10 w-40 rotate-12 opacity-70" />
      <div className="relative mx-auto max-w-4xl px-4 py-6">
        <p className="flex items-center gap-2 font-display text-sm font-bold tracking-widest text-sun">
          <BookOpenCheck size={16} /> LATIHAN SOAL
        </p>
        <h1 className="font-display text-3xl font-extrabold text-cream">Asah Kekuatan Pangkatmu</h1>
        <Speech
          who="kaciro"
          pose="tip"
          size={80}
          className="mt-3"
          text={`Bank soal kita berisi ${QUESTION_BANK.length} soal dari berbagai jenis: pilihan ganda, benar-salah, isian, pasangkan, identifikasi, temukan kesalahan, dan soal cerita. Soal diambil acak setiap sesi.`}
        />

        <h2 className="mt-6 font-display text-xl font-bold text-cream">1. Pilih tingkat kesulitan</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              aria-pressed={level === l}
              className={`btn-game relative rounded-3xl p-4 text-left text-jungle ${LEVEL_INFO[l].color} ${LEVEL_INFO[l].shadow} ${level === l ? "ring-4 ring-sun" : ""}`}
            >
              <span className="font-display text-sm font-bold text-earth">Tingkat {l}</span>
              <p className="font-display text-xl font-extrabold">{DIFFICULTY_LABEL[l]}</p>
              <p className="mt-1 text-sm">{LEVEL_INFO[l].desc}</p>
              <Mushroom className="absolute right-3 top-3 w-7" color={l === 1 ? "#62A66B" : l === 2 ? "#F39B57" : "#9b7fd1"} />
            </button>
          ))}
        </div>

        <h2 className="mt-6 font-display text-xl font-bold text-cream">2. Jumlah soal</h2>
        <div className="mt-3 flex gap-3">
          {PRACTICE_SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              aria-pressed={count === n}
              className={`btn-game h-14 w-16 rounded-2xl border-2 font-display text-2xl font-extrabold ${count === n ? "border-sun bg-orange text-[#4a2410]" : "border-white/30 bg-white/10 text-cream"}`}
            >
              {n}
            </button>
          ))}
        </div>

        <GameButton size="lg" className="mt-6" onClick={start}>
          MULAI LATIHAN
        </GameButton>

        <Parchment className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-jungle">Nilai latihan terakhir</h2>
            <Kaciro pose="book" width={88} />
          </div>
          {history.length === 0 ? (
            <p className="text-jungle">Belum ada latihan. Ayo mulai!</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {history.map((h) => (
                <li key={h.id} className="flex justify-between rounded-xl bg-white/70 px-3 py-2 text-jungle">
                  <span>
                    {DIFFICULTY_LABEL[h.level]} · {h.correct}/{h.total}
                  </span>
                  <span className="font-display font-extrabold">
                    {h.score} <span className="text-xs font-normal text-earth">· {fmtShort(h.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Parchment>
      </div>
    </div>
  );
}
