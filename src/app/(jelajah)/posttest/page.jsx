"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";
import Naru from "@/components/characters/Naru";
import { ExamGate } from "@/components/quiz/ExamGate";
import { ExamRunner } from "@/components/quiz/ExamRunner";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, WoodSign } from "@/components/ui/Panels";
import { EXAM_TIMER_MINUTES, POSTTEST } from "@/data/exams";
import { useStore } from "@/lib/store/ProgressProvider";

export default function PosttestPage() {
  const s = useStore();
  const router = useRouter();
  const [started, setStarted] = useState(Boolean(s.journey?.posttestDraft));
  const [sending, setSending] = useState(false);

  if (sending) {
    return (
      <ExamGate tone="post">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-cream">
          <Naru pose="jump" width={190} />
          <p className="mt-2 font-display text-2xl font-bold">Kaciro sedang memeriksa jawabanmu...</p>
        </div>
      </ExamGate>
    );
  }

  return (
    <ExamGate tone="post">
      {!started ? (
        <div className="animate-pop">
          <div className="text-center">
            <WoodSign>UJI JEJAK AKHIR — POSTTEST</WoodSign>
          </div>
          <h1 className="mt-8 text-center font-display text-3xl font-extrabold text-sun sm:text-4xl" style={{ textShadow: "0 3px 0 #0f2a1c" }}>
            SAATNYA MEMBUKTIKAN PERKEMBANGANMU!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-cream">
            Soal posttest setara dengan pretest: jumlah, jenis, dan materinya sama, hanya angkanya berbeda. Hasilnya akan dibandingkan dengan pretest-mu.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Speech who="naru" pose="cheer" size={90} text="Kamu sudah menjelajahi seluruh hutan! Ayo tunjukkan semua yang sudah kamu pelajari!" />
            <Speech
              who="kaciro"
              pose="book"
              size={90}
              side="right"
              text="Kerjakan dengan teliti. Pembahasan lengkap akan muncul setelah kamu mengumpulkan jawaban."
            />
          </div>
          <Parchment className="mt-6">
            <ul className="list-disc space-y-1 pl-5 text-jungle">
              <li>
                <b>{POSTTEST.length} soal</b>: pilihan ganda dan isian singkat.
              </li>
              <li>Jawaban tersimpan otomatis sampai dikumpulkan; kunci jawaban tidak ditampilkan selama pengerjaan.</li>
              <li>{EXAM_TIMER_MINUTES > 0 ? `Waktu ${EXAM_TIMER_MINUTES} menit (sama seperti pretest).` : "Tanpa batas waktu, sama seperti pretest."}</li>
              <li>Posttest boleh dikerjakan ulang; setiap percobaan tersimpan di riwayat.</li>
            </ul>
            <GameButton size="lg" full className="mt-4" onClick={() => setStarted(true)} icon={<Play />}>
              MULAI POSTTEST
            </GameButton>
          </Parchment>
        </div>
      ) : (
        <ExamRunner
          title="POSTTEST"
          submitLabel="KUMPULKAN POSTTEST"
          questions={POSTTEST}
          draft={s.journey?.posttestDraft}
          timerMinutes={EXAM_TIMER_MINUTES}
          onDraft={(d) => s.saveExamDraft("posttest", d)}
          onSubmit={async (answers, startedAt) => {
            setSending(true);
            const a = await s.submitExam("posttest", answers, startedAt);
            if (a) router.push("/posttest/hasil");
            else setSending(false);
          }}
        />
      )}
    </ExamGate>
  );
}
