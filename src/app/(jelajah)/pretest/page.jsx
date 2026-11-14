"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck, Play } from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { ExamGate } from "@/components/quiz/ExamGate";
import { ExamRunner } from "@/components/quiz/ExamRunner";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, WoodSign } from "@/components/ui/Panels";
import { EXAM_TIMER_MINUTES, PRETEST } from "@/data/exams";
import { useStore } from "@/lib/store/ProgressProvider";

export default function PretestPage() {
  const s = useStore();
  const router = useRouter();
  const [started, setStarted] = useState(Boolean(s.journey?.pretestDraft));
  const [leaving, setLeaving] = useState(false);

  if (s.pretestDone && !leaving) {
    return (
      <ExamGate>
        <Parchment className="text-center">
          <ClipboardCheck className="mx-auto text-forest" size={48} />
          <h1 className="mt-2 font-display text-2xl font-extrabold text-jungle">Pretest sudah dikumpulkan</h1>
          <p className="mt-2 text-jungle">
            Jawaban pretest perjalanan ini sudah dikunci. Ingin mencoba lagi? Mulai perjalanan baru dari halaman Profil. Riwayat lama tetap tersimpan.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <GameButton href="/pretest/hasil" variant="leaf">
              Lihat hasil
            </GameButton>
            <GameButton href="/camp">Ke Camp</GameButton>
          </div>
        </Parchment>
      </ExamGate>
    );
  }

  if (leaving) {
    return (
      <ExamGate>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-cream">
          <Naru pose="jump" width={190} />
          <p className="mt-2 font-display text-2xl font-bold">Jawabanmu sedang diperiksa...</p>
        </div>
      </ExamGate>
    );
  }

  return (
    <ExamGate>
      {!started ? (
        <div className="animate-pop">
          <div className="text-center">
            <WoodSign>UJI JEJAK AWAL — PRETEST</WoodSign>
          </div>
          <h1 className="mt-8 text-center font-display text-3xl font-extrabold text-sun sm:text-4xl" style={{ textShadow: "0 3px 0 #0f2a1c" }}>
            SEBELUM MENJELAJAH, UJI DULU KEMAMPUANMU!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-cream">
            Yuk, kerjakan tantangan awal ini untuk mengetahui seberapa jauh kamu mengenal bilangan berpangkat. Tenang, ini bukan ujian akhir. Coba jawab sesuai
            kemampuanmu sendiri!
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Speech
              who="naru"
              pose="hang"
              size={96}
              text="Hei, penjelajah! Sebelum kita masuk lebih dalam ke hutan, ada satu tantangan awal. Coba tunjukkan kemampuanmu, ya!"
            />
            <Speech
              who="kaciro"
              pose="book"
              size={96}
              side="right"
              text="Kerjakan dengan teliti sesuai pengetahuan yang sudah kamu miliki. Tidak perlu takut salah, karena kita akan belajar bersama setelah ini."
            />
          </div>
          <Parchment className="mt-6">
            <h2 className="font-display text-xl font-extrabold text-jungle">Petunjuk pengerjaan</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-jungle">
              <li>
                Ada <b>{PRETEST.length} soal</b>: pilihan ganda dan isian singkat.
              </li>
              <li>Pindah soal dengan tombol nomor, “Sebelumnya”, atau “Berikutnya”.</li>
              <li>
                Jawabanmu tersimpan otomatis sampai kamu menekan <b>KUMPULKAN PRETEST</b>.
              </li>
              <li>Setelah dikumpulkan, jawaban dikunci.</li>
              <li>{EXAM_TIMER_MINUTES > 0 ? `Waktu pengerjaan ${EXAM_TIMER_MINUTES} menit.` : "Tidak ada batas waktu. Kerjakan dengan tenang."}</li>
              <li>Pretest tidak memberi XP. Ini hanya untuk melihat kemampuan awalmu.</li>
            </ul>
            <GameButton size="lg" full className="mt-4" onClick={() => setStarted(true)} icon={<Play />}>
              MULAI PRETEST
            </GameButton>
          </Parchment>
        </div>
      ) : (
        <div>
          <div className="mb-4 hidden items-end justify-between sm:flex">
            <Naru pose="peek" width={112} />
            <Kaciro pose="book" width={100} />
          </div>
          <ExamRunner
            title="PRETEST"
            submitLabel="KUMPULKAN PRETEST"
            questions={PRETEST}
            draft={s.journey?.pretestDraft}
            timerMinutes={EXAM_TIMER_MINUTES}
            onDraft={(d) => s.saveExamDraft("pretest", d)}
            onSubmit={async (answers, startedAt) => {
              setLeaving(true);
              const a = await s.submitExam("pretest", answers, startedAt);
              if (a) router.push("/pretest/hasil");
              else setLeaving(false);
            }}
          />
        </div>
      )}
    </ExamGate>
  );
}
