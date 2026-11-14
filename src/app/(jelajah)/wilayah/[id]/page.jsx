"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, BookMarked, CheckCircle2, Circle, Flag, Lightbulb, Lock, Map, Puzzle, Sparkles, Target } from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { RegionScene } from "@/components/region/RegionScene";
import { ConceptVisual } from "@/components/region/ConceptVisual";
import { RegionMission } from "@/components/region/RegionMission";
import { SceneArt } from "@/components/quiz/SceneArt";
import { GameButton } from "@/components/ui/GameButton";
import { FormulaBoard, MathText, toUnicodeSup } from "@/components/ui/MathText";
import { Parchment, Speech } from "@/components/ui/Panels";
import { getRegion, MISSION_PASS, SECTIONS } from "@/data/regions";
import { useStore } from "@/lib/store/ProgressProvider";
import { isRegionUnlocked, regionRequirements } from "@/lib/unlock";

import { play } from "@/lib/sound";

function Example({ ex, n }) {
  const [shown, setShown] = useState(0);
  const all = shown >= ex.steps.length;
  return (
    <div className="rounded-2xl border-2 border-[#d9c08f] bg-white p-4">
      <p className="font-display text-lg font-extrabold text-jungle">
        Contoh {n}: <MathText text={ex.question} />
      </p>
      <ol className="mt-2 space-y-1.5">
        {ex.steps.slice(0, shown).map((s, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 text-lg text-jungle">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest text-xs font-bold text-white">{i + 1}</span>
            <MathText text={s} />
          </motion.li>
        ))}
      </ol>
      {all ? (
        <p className="mt-3 rounded-xl bg-[#e3f4dc] px-3 py-2 font-display text-xl font-extrabold text-forest">
          Jawaban: <MathText text={ex.answer} />
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <GameButton size="sm" variant="leaf" onClick={() => setShown((s) => s + 1)}>
            {shown === 0 ? "Mulai penyelesaian" : "Langkah berikutnya"}
          </GameButton>
          <button className="text-sm font-bold text-earth underline" onClick={() => setShown(ex.steps.length)}>
            Tampilkan semua
          </button>
        </div>
      )}
    </div>
  );
}

function Riddle({ r }) {
  const [pick, setPick] = useState(null);
  return (
    <div className="rounded-3xl bg-[#3a2c4f] p-4 text-cream">
      <p className="flex items-center gap-2 font-display text-lg font-extrabold text-sun">
        <Puzzle size={20} /> Teka-teki singkat
      </p>
      <p className="mt-1 text-lg">
        <MathText text={r.question} />
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {r.options.map((o, i) => (
          <button
            key={i}
            disabled={pick !== null}
            onClick={() => {
              setPick(i);
              play(i === r.answer ? "correct" : "wrong");
            }}
            className={`btn-game min-h-12 rounded-xl border-2 font-display text-xl font-extrabold ${
              pick === null
                ? "border-white/30 bg-white/10"
                : i === r.answer
                  ? "border-lime bg-leaf"
                  : pick === i
                    ? "border-coral bg-coral/40"
                    : "border-white/10 bg-white/5 opacity-60"
            }`}
          >
            <MathText text={o} />
          </button>
        ))}
      </div>
      {pick !== null && (
        <p className="mt-3 rounded-xl bg-white/10 p-2">
          {pick === r.answer ? "" : "Belum tepat. "}
          <MathText text={r.reveal} />
          {pick !== r.answer && (
            <button className="ml-2 font-bold text-sun underline" onClick={() => setPick(null)}>
              Coba lagi
            </button>
          )}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-extrabold text-jungle">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange text-white">{icon}</span>
      {children}
    </h2>
  );
}

export default function RegionPage() {
  const params = useParams();
  const router = useRouter();
  const s = useStore();
  const id = Number(params.id);
  const r = getRegion(id);
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState(null);
  const topRef = useRef(null);
  const j = s.journey;
  const unlocked = r ? isRegionUnlocked(j, s.pretestDone, r.id) : false;
  const sec = SECTIONS[step];

  useEffect(() => {
    if (r && unlocked) s.markSection(r.id, sec.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, r?.id, unlocked]);

  if (!r) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Parchment className="text-center text-jungle">
          Wilayah tidak ditemukan.{" "}
          <GameButton href="/peta" className="mt-3">
            Ke Peta
          </GameButton>
        </Parchment>
      </div>
    );
  }
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Parchment className="text-center text-jungle">
          <Lock className="mx-auto" size={40} />
          <h1 className="mt-2 font-display text-2xl font-extrabold">Wilayah {r.code} masih terkunci</h1>
          <p className="mt-1">{r.id === 7 ? "Selesaikan Wilayah 01–06 dulu." : `Selesaikan Wilayah ${getRegion(r.id - 1).code} dulu.`}</p>
          <GameButton href="/peta" className="mt-4" icon={<Map size={18} />}>
            Kembali ke Peta
          </GameButton>
        </Parchment>
      </div>
    );
  }

  const req = regionRequirements(j, r.id);
  const done = Boolean(j.regions[r.id]?.completedAt);
  const read = j.regions[r.id]?.read ?? [];
  const nextR = getRegion(r.id + 1);

  const goto = (k) => {
    play("page");
    setStep(k);
    setMsg(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const complete = async () => {
    const res = await s.completeRegion(r.id);
    if (!res.ok) setMsg(res.reason ?? "Belum bisa diselesaikan.");
    else setMsg(null);
  };

  return (
    <div>
      {/* ───── header wilayah ───── */}
      <header className="relative">
        <RegionScene region={r} className="h-52 sm:h-64" />
        <div className="pointer-events-none absolute right-2 top-0 w-24 sm:right-10 sm:w-36">
          <Naru pose="hang" width="100%" />
        </div>
        {/* nama wilayah di bawah ilustrasi agar tidak menutupi gambar */}
        <div className="px-4 pb-3 pt-3">
          <div className="mx-auto max-w-4xl">
            <span className="wood inline-block rounded-lg px-3 py-0.5 font-display text-sm font-extrabold tracking-widest">
              WILAYAH {r.code} dari 07 · {r.name}
            </span>
            <h1 className="mt-1 max-w-2xl font-display text-2xl font-extrabold leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] sm:text-4xl">
              {r.title}
            </h1>
          </div>
        </div>
      </header>

      {/* ───── penanda bagian ───── */}
      <div ref={topRef} className="sticky top-[60px] z-30 scroll-mt-16 border-b-2 border-bark/40 bg-jungle/95 motif-daun backdrop-blur">
        <ol className="no-scrollbar mx-auto flex max-w-4xl gap-1.5 overflow-x-auto px-3 py-2" aria-label="Bagian materi">
          {SECTIONS.map((x, k) => (
            <li key={x.id}>
              <button
                onClick={() => goto(k)}
                aria-current={k === step ? "step" : undefined}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 font-display text-sm font-bold transition ${
                  k === step ? "bg-orange text-[#4a2410]" : read.includes(x.id) ? "bg-leaf/80 text-white" : "bg-white/10 text-cream"
                }`}
              >
                {read.includes(x.id) && k !== step ? <CheckCircle2 size={14} /> : <span className="text-xs opacity-70">{k + 1}</span>}
                {x.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <motion.div key={sec.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {sec.id === "pembuka" && (
            <div className="space-y-5">
              <Parchment>
                <SectionTitle icon={<Target size={18} />}>Tujuan Pembelajaran</SectionTitle>
                <ul className="space-y-1.5 text-jungle">
                  {r.goals.map((g) => (
                    <li key={g} className="flex gap-2">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-forest" />
                      <MathText text={g} />
                    </li>
                  ))}
                </ul>
              </Parchment>
              <div className="rounded-3xl bg-[linear-gradient(135deg,#fbf3dc,#f3e3b8)] p-5 text-jungle shadow-[0_6px_0_#c8ab72]">
                <p className="font-display text-sm font-bold tracking-widest text-earth">CERITA PEMBUKA</p>
                <p className="mt-1 text-lg leading-relaxed">
                  <MathText text={r.story} />
                </p>
              </div>
              <Speech who="naru" pose="point" size={96} text={r.naruIntro} />
              <Speech who="kaciro" pose="book" size={96} side="right" text={r.kaciroIntro} />
            </div>
          )}

          {sec.id === "konsep" && (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-[auto_1fr]">
                <div className="hidden md:block">
                  <Kaciro pose="point" width={190} />
                </div>
                <Parchment>
                  <SectionTitle icon={<BookMarked size={18} />}>Konsep Dasar</SectionTitle>
                  <ol className="space-y-3">
                    {r.concept.map((c, k) => (
                      <li key={k} className="flex gap-3 text-lg text-jungle">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-jungle font-display text-sm font-bold text-sun">{k + 1}</span>
                        <MathText text={c} />
                      </li>
                    ))}
                  </ol>
                </Parchment>
              </div>
              <div>
                <p className="mb-2 font-display text-lg font-bold text-sun">Coba sendiri ilustrasinya:</p>
                <ConceptVisual kind={r.conceptVisual} />
              </div>
              <Parchment>
                <h3 className="font-display text-xl font-extrabold text-jungle">Istilah Penting</h3>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {r.terms.map(([t, d]) => (
                    <div key={t} className="rounded-xl bg-white/80 p-3">
                      <dt className="font-display font-extrabold text-forest">{t}</dt>
                      <dd className="text-[15px] text-jungle">
                        <MathText text={d} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Parchment>
            </div>
          )}

          {sec.id === "rumus" && (
            <div className="space-y-5">
              <div className="flex items-end gap-3">
                <Kaciro
                  pose="board"
                  width={130}
                  boardText={r.id === 7 ? "aᵐ⁺ⁿ⁻ᵖ" : toUnicodeSup(r.formula.expr.split("=")[0].trim())}
                  className="hidden shrink-0 sm:block"
                />
                <FormulaBoard expr={r.formula.expr} caption={r.formula.read} className="flex-1" />
              </div>
              <Parchment>
                <h3 className="font-display text-xl font-extrabold text-jungle">Arti setiap simbol</h3>
                <table className="mt-2 w-full text-left text-jungle">
                  <tbody>
                    {r.formula.symbols.map(([sym, mean]) => (
                      <tr key={sym} className="border-b border-earth/15 last:border-0">
                        <th className="w-1/3 py-2 pr-3 font-display text-xl font-extrabold text-forest">
                          <MathText text={sym} />
                        </th>
                        <td className="py-2">
                          <MathText text={mean} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {r.formula.condition && (
                  <p className="mt-3 rounded-xl bg-sun/40 px-3 py-2 font-semibold text-earth">
                    Syarat: <MathText text={r.formula.condition} />
                  </p>
                )}
              </Parchment>
              <div className="grid gap-3 sm:grid-cols-2">
                {r.tips.map((t) => (
                  <div key={t} className="flex gap-2 rounded-2xl bg-[#d5f0ec] p-3 text-[#1f4f4a]">
                    <Lightbulb className="shrink-0 text-[#1f6b63]" />
                    <p>
                      <b>Tips mengingat:</b> <MathText text={t} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sec.id === "contoh" && (
            <div className="space-y-5">
              <Speech
                who="kaciro"
                pose="tip"
                size={80}
                side="right"
                text="Ikuti penyelesaiannya langkah demi langkah. Tekan tombol untuk membuka langkah berikutnya."
              />
              {r.examples.map((ex, k) => (
                <Example key={k} ex={ex} n={k + 1} />
              ))}
              <Parchment>
                <p className="font-display text-sm font-bold tracking-widest text-earth">CONTOH DALAM KEHIDUPAN SEHARI-HARI</p>
                <h3 className="font-display text-2xl font-extrabold text-jungle">{r.application.title}</h3>
                <SceneArt scene={r.application.scene} className="my-3" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/80 p-3 text-jungle">
                    <b>Diketahui:</b>
                    <ul className="list-disc pl-5">
                      {r.application.known.map((k) => (
                        <li key={k}>
                          <MathText text={k} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3 text-jungle">
                    <b>Ditanya:</b>
                    <p>
                      <MathText text={r.application.asked} />
                    </p>
                  </div>
                </div>
                <Example ex={{ question: "Penyelesaian", steps: r.application.steps, answer: r.application.answer }} n={r.examples.length + 1} />
              </Parchment>
            </div>
          )}

          {sec.id === "waspada" && (
            <div className="space-y-5">
              <Parchment>
                <SectionTitle icon={<AlertTriangle size={18} />}>Kesalahan Umum</SectionTitle>
                <div className="space-y-3">
                  {r.mistakes.map((m) => (
                    <div key={m.wrong} className="grid gap-2 rounded-2xl bg-white/80 p-3 sm:grid-cols-2">
                      <p className="rounded-xl bg-[#fde6e2] px-3 py-2 font-display text-lg font-bold text-[#7a2b2b] line-through decoration-coral decoration-2">
                        <MathText text={m.wrong} />
                      </p>
                      <p className="rounded-xl bg-[#e3f4dc] px-3 py-2 font-display text-lg font-bold text-forest">
                        <MathText text={m.right} />
                      </p>
                      <p className="text-[15px] text-jungle sm:col-span-2">
                        <MathText text={m.why} />
                      </p>
                    </div>
                  ))}
                </div>
              </Parchment>
              <div className="flex items-end gap-3 rounded-3xl bg-[#f9dfe3] p-4 text-jungle">
                {r.fact.by === "naru" ? <Naru pose="sit" width="min(30vw, 130px)" /> : <Kaciro pose="cheer" width="min(30vw, 130px)" />}
                <div>
                  <p className="flex items-center gap-1 font-display text-lg font-extrabold text-[#8b3a4b]">
                    <Sparkles size={18} /> Fakta menarik dari {r.fact.by === "naru" ? "Naru" : "Kaciro"}
                  </p>
                  <p>
                    <MathText text={r.fact.text} />
                  </p>
                </div>
              </div>
              <Riddle r={r.riddle} />
            </div>
          )}

          {sec.id === "misi" && <RegionMission region={r} onDone={() => goto(6)} />}

          {sec.id === "rangkuman" && (
            <div className="space-y-5">
              <Parchment>
                <SectionTitle icon={<Flag size={18} />}>Rangkuman</SectionTitle>
                <ul className="space-y-2">
                  {r.summary.map((x) => (
                    <li key={x} className="flex gap-2 text-lg text-jungle">
                      <CheckCircle2 className="mt-1 shrink-0 text-forest" size={18} />
                      <MathText text={x} />
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-2xl bg-jungle motif-daun p-4 text-cream">
                  <b className="text-sun">Kesimpulan:</b> <MathText text={r.conclusion} />
                </p>
              </Parchment>

              <div className="wood rounded-3xl p-4">
                <p className="font-display text-lg font-extrabold text-sun">Syarat menyelesaikan wilayah</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    {req.readAll ? <CheckCircle2 size={18} className="text-lime" /> : <Circle size={18} />} Semua bagian materi dibuka
                  </li>
                  <li className="flex items-center gap-2">
                    {req.missionPassed ? <CheckCircle2 size={18} className="text-lime" /> : <Circle size={18} />} Misi wilayah skor ≥ {MISSION_PASS}
                    {!req.missionPassed && (
                      <button onClick={() => goto(5)} className="ml-1 font-bold text-sun underline">
                        kerjakan misi
                      </button>
                    )}
                  </li>
                </ul>
                {done ? (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl bg-black/20 p-3">
                    <Naru pose="cheer" width="min(26vw, 100px)" />
                    <p className="font-display text-lg font-bold">
                      LUAR BIASA! Wilayah ini sudah selesai{nextR ? ". Jalan menuju wilayah berikutnya sudah terbuka!" : "!"}
                    </p>
                  </div>
                ) : (
                  <GameButton size="lg" full className="mt-3" onClick={complete} disabled={!req.readAll || !req.missionPassed} icon={<Flag />}>
                    SELESAIKAN WILAYAH
                  </GameButton>
                )}
                {msg && (
                  <p className="mt-2 rounded-xl bg-white/90 px-3 py-2 font-semibold text-[#7a2b2b]" role="alert">
                    {msg}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-between gap-3">
                <GameButton href="/peta" variant="cream" icon={<Map size={18} />}>
                  Kembali ke Peta
                </GameButton>
                {nextR ? (
                  <GameButton
                    variant="leaf"
                    disabled={!done}
                    onClick={() => router.push(`/wilayah/${nextR.id}`)}
                    title={!done ? "Selesaikan wilayah ini dulu" : undefined}
                  >
                    {r.id === 6 ? "Menuju Treasure Temple" : `Wilayah ${nextR.code}`} <ArrowRight size={18} />
                  </GameButton>
                ) : (
                  <GameButton href="/challenge" variant="leaf">
                    Jungle Challenge <ArrowRight size={18} />
                  </GameButton>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {sec.id !== "rangkuman" && sec.id !== "misi" && (
          <div className="mt-6 flex justify-between gap-3">
            <GameButton variant="ghost" onClick={() => (step === 0 ? router.push("/peta") : goto(step - 1))} icon={<ArrowLeft size={18} />}>
              {step === 0 ? "Peta" : SECTIONS[step - 1].label}
            </GameButton>
            <GameButton onClick={() => goto(step + 1)}>
              {SECTIONS[step + 1].label} <ArrowRight size={18} />
            </GameButton>
          </div>
        )}
        {sec.id === "misi" && (
          <div className="mt-6 flex justify-between gap-3">
            <GameButton variant="ghost" onClick={() => goto(step - 1)} icon={<ArrowLeft size={18} />}>
              Waspada!
            </GameButton>
            <GameButton variant="ghost" onClick={() => goto(step + 1)}>
              Rangkuman <ArrowRight size={18} />
            </GameButton>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-cream/60">
          <Link href="/peta" className="underline">
            Peta
          </Link>{" "}
          · Wilayah {r.code} dari 07
        </p>
      </div>
    </div>
  );
}
