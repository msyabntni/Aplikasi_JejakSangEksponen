"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  BookOpen,
  Compass as CompassIcon,
  FlaskConical,
  Footprints as FootIcon,
  Gamepad2,
  LogIn,
  Mountain,
  Play,
  ScrollText,
  Swords,
  Trophy,
} from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { Butterfly, Footprints, Gem, JungleBackdrop, Monstera, Mushroom, TreasureChest, Waterfall } from "@/components/scenery/Scenery";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, WoodSign } from "@/components/ui/Panels";
import { Logo } from "@/components/ui/Logo";
import { TopControls } from "@/components/layout/TopControls";
import { AdventureMap } from "@/components/map/AdventureMap";
import { DeveloperCard, DeveloperFooterLine } from "@/components/ui/DeveloperCredit";
import { useStore } from "@/lib/store/ProgressProvider";
import { REGIONS } from "@/data/regions";

const FEATURES = [
  { icon: BookOpen, title: "Materi Interaktif bersama Kaciro", text: "Penjelasan bertahap, contoh, dan teka-teki singkat.", color: "#246B45" },
  {
    icon: CompassIcon,
    title: "Petualangan Tujuh Wilayah",
    text: "Jelajahi hutan ajaib bersama Naru, dari Forest Camp sampai Treasure Temple.",
    color: "#F39B57",
  },
  { icon: FlaskConical, title: "Laboratorium Sang Eksponen", text: "Delapan eksperimen: slider, simulasi, dan diagram anatomi pangkat.", color: "#4fb3a9" },
  { icon: Gamepad2, title: "Enam Mini-Game", text: "Power Match, Jungle Bridge, Exponent Puzzle, dan lainnya.", color: "#e57f9a" },
  { icon: Swords, title: "Jungle Challenge", text: "Tiga level tantangan akhir yang menggabungkan seluruh materi.", color: "#754B35" },
  { icon: ScrollText, title: "Pretest & Posttest", text: "Lihat perkembanganmu dari awal sampai akhir petualangan.", color: "#5f8fb8" },
  { icon: Trophy, title: "XP, Lencana, Permata", text: "Kumpulkan hadiah, naik level, dan lengkapi koleksi lencana.", color: "#e0b43c" },
];

const STEPS = [
  "Tekan “MULAI PETUALANGAN”.",
  "Masuk dengan nama dan kelas (tanpa password).",
  "Kerjakan pretest (uji jejak awal).",
  "Masuk Camp dan buka peta petualangan.",
  "Jelajahi tujuh wilayah bersama Naru dan Kaciro.",
  "Selesaikan latihan dan mini-game untuk XP dan lencana.",
  "Taklukkan Jungle Challenge.",
  "Kerjakan posttest dan lihat perkembanganmu.",
];

function Landing() {
  const s = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [msg, setMsg] = useState(null);

  const continueJourney = () => {
    if (!s.ready) return;
    if (!s.journey) {
      if (s.explorers.length > 0) {
        router.push("/mulai");
        return;
      }
      setMsg("Belum ada jejak tersimpan di perangkat ini. Yuk, mulai petualangan baru dulu!");
      return;
    }
    router.push(s.pretestDone ? (next ?? "/camp") : "/pretest");
  };

  return (
    <div className="overflow-x-clip bg-jungle text-cream">
      {/* ───────── HERO ───────── */}
      <JungleBackdrop className="min-h-[100svh]" sky={["#9fd8c0", "#e9f0d8"]} fireflies={10}>
        <header className="relative z-30 flex items-center justify-between px-4 pt-3 sm:px-8">
          <span className="rounded-2xl bg-jungle/85 px-2.5 py-1.5 shadow-lg">
            <Logo />
          </span>
          <TopControls />
        </header>

        {/* air terjun di kejauhan */}
        <Waterfall className="right-[8%] top-[18%] -z-10 h-[38%] w-14 opacity-80 sm:right-[18%] sm:w-20" />
        <Butterfly className="left-[12%] top-[30%]" color="#F39B57" />
        <Butterfly className="right-[22%] top-[24%]" color="#e57f9a" style={{ animationDelay: "2s" }} />
        <Butterfly className="left-[46%] top-[62%] hidden sm:block" color="#8ED6E8" style={{ animationDelay: "3.4s" }} />

        {/* Naru bergelantungan di bagian atas */}
        <div className="pointer-events-none absolute left-[2%] top-16 z-20 w-[28vw] max-w-[240px] sm:left-[10%] sm:top-0">
          <Naru pose="hang" width="100%" title="Naru bergelantungan pada tanaman rambat" />
        </div>

        <div className="relative z-20 mx-auto flex max-w-6xl flex-col items-center px-4 pb-52 pt-44 text-center sm:pb-48 sm:pt-24 lg:pb-56">
          <p className="mb-3 rounded-full bg-jungle/80 px-4 py-1 font-display text-sm font-bold tracking-widest text-sun">
            IKUTI JEJAKNYA, TAKLUKKAN KEKUATAN PANGKAT!
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-jungle sm:text-6xl" style={{ textShadow: "0 3px 0 #fff7e0" }}>
            SIAP MENEMUKAN RAHASIA <span className="text-orange">SANG EKSPONEN?</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg font-semibold text-[#2d4a35] sm:text-xl">
            Jelajahi hutan ajaib, pecahkan teka-teki, dan kuasai kekuatan bilangan berpangkat!
          </p>
          <div className="mt-7 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <GameButton size="lg" href="/mulai" icon={<Play size={22} />}>
              MULAI PETUALANGAN
            </GameButton>
            <GameButton size="lg" variant="wood" onClick={continueJourney} icon={<FootIcon size={22} />}>
              LANJUTKAN JEJAK
            </GameButton>
          </div>
          {msg && (
            <div
              className="animate-pop mt-4 flex max-w-md items-center gap-2 rounded-2xl bg-white px-4 py-2 text-left text-sm font-semibold text-jungle shadow-lg"
              role="status"
            >
              <Naru pose="peek" width={60} /> {msg}
            </div>
          )}
          <div className="mt-4">
            {s.accountEnabled ? (
              <Link
                href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 font-display font-bold text-forest hover:bg-white"
              >
                <LogIn size={18} /> {s.user ? "Kamu sudah masuk — buka Camp" : "Masuk dengan akun email"}
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm font-semibold text-[#3e5a45]"
                title="Supabase belum dikonfigurasi"
              >
                <LogIn size={16} /> Mode akun belum dikonfigurasi — main sebagai tamu
              </span>
            )}
          </div>
        </div>

        {/* Kaciro di dekat papan petunjuk */}
        <div className="pointer-events-none absolute bottom-6 right-[3%] z-20 flex items-end sm:right-[8%]">
          <div className="mb-10 hidden sm:block">
            <WoodSign small>➜ HUTAN EKSPONEN</WoodSign>
          </div>
          <Kaciro pose="book" width="min(34vw, 220px)" />
        </div>

        {/* foreground */}
        <Monstera className="pointer-events-none absolute -bottom-6 -left-8 z-10 w-40 animate-sway sm:w-56" style={{ transformOrigin: "bottom left" }} />
        <Monstera
          className="pointer-events-none absolute -bottom-10 left-[30%] z-10 hidden w-32 animate-sway sm:block"
          color="#3c9b5e"
          style={{ animationDelay: "1s" }}
        />
        <Mushroom className="absolute bottom-3 left-[38%] z-10 w-10" glow />
        <Mushroom className="absolute bottom-2 left-[44%] z-10 w-7" color="#e57f9a" />
        <div className="absolute inset-x-0 bottom-0 z-0 h-16 bg-gradient-to-t from-[#2f6d35] to-transparent" />
      </JungleBackdrop>

      {/* ───────── PERKENALAN ───────── */}
      <section className="relative bg-[linear-gradient(180deg,#2f6d35,#173F2A)] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <WoodSign>TEMAN PERJALANANMU</WoodSign>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative rounded-[2rem] bg-[#f9dfe3] p-5 pt-2 text-jungle shadow-[0_8px_0_#c97586]">
              <div className="flex items-end gap-3">
                <Naru pose="jump" width="min(44vw, 180px)" />
                <div className="pb-4">
                  <h3 className="font-display text-3xl font-extrabold text-[#8b3a4b]">NARU</h3>
                  <p className="font-bold text-[#8b5a3c]">Monyet Penjelajah</p>
                </div>
              </div>
              <p className="mt-2 leading-relaxed">
                Ceria, pemberani, dan sedikit jahil. Naru suka bergelantungan dari dahan ke dahan dan akan memandumu menjelajahi setiap sudut hutan.
              </p>
              <p className="mt-3 rounded-xl bg-white/70 p-3 italic">“Halo, penjelajah! Siap mengikuti jejak rahasia di hutan ini?”</p>
            </div>
            <div className="relative rounded-[2rem] bg-[#dcefd7] p-5 pt-2 text-jungle shadow-[0_8px_0_#3E7C4F] md:mt-12">
              <div className="flex items-end gap-3">
                <Kaciro pose="tip" width="min(42vw, 170px)" />
                <div className="pb-4">
                  <h3 className="font-display text-3xl font-extrabold text-forest">KACIRO</h3>
                  <p className="font-bold text-earth">Kancil Cerdas</p>
                </div>
              </div>
              <p className="mt-2 leading-relaxed">
                Sabar, teliti, dan suka menjelaskan. Kaciro akan membantumu memahami setiap rumus, contoh soal, dan kesalahan yang sering terjadi.
              </p>
              <p className="mt-3 rounded-xl bg-white/70 p-3 italic">“Tenang, penjelajah! Aku akan membantumu memahami rahasia bilangan berpangkat.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TENTANG + FITUR ───────── */}
      <section className="relative overflow-hidden bg-cream px-4 py-16 text-jungle">
        <Monstera className="absolute -right-10 -top-6 w-44 rotate-180 opacity-90" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Tentang JEJAK SANG EKSPONEN</h2>
            <p className="mt-4 text-lg leading-relaxed">
              JEJAK SANG EKSPONEN adalah media pembelajaran interaktif berbentuk petualangan hutan untuk siswa SMP kelas VIII. Di sini kamu memahami
              <b> sifat-sifat bilangan berpangkat</b> sambil menyelesaikan misi, memecahkan teka-teki, dan mengumpulkan harta karun.
            </p>
            <div className="mt-6 flex items-end gap-4">
              <TreasureChest width={120} open />
              <Speech who="naru" pose="peek" size={70} text="Setiap misi yang kamu selesaikan membuka jalan ke wilayah baru!" />
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-display text-2xl font-extrabold">Fitur Unggulan</h3>
            <ol className="relative space-y-3 border-l-4 border-dashed border-earth/40 pl-6">
              {FEATURES.map((f, i) => (
                <li key={f.title} className={`relative rounded-2xl bg-white p-3 shadow-[0_4px_0_#d9c08f] ${i % 2 ? "sm:ml-8" : ""}`}>
                  <span className="absolute -left-[2.35rem] top-3 grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: f.color }}>
                    <f.icon size={17} />
                  </span>
                  <b className="font-display text-lg">{f.title}</b>
                  <p className="text-[15px] text-[#4b4636]">{f.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── PREVIEW PETA & CUPLIKAN ───────── */}
      <section className="bg-[linear-gradient(180deg,#173F2A,#246B45)] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <WoodSign>PETA PETUALANGAN</WoodSign>
            <p className="mt-4 text-cream/90">Tujuh wilayah terhubung oleh satu jalur. Selesaikan satu, wilayah berikutnya terbuka!</p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border-4 border-bark shadow-2xl">
            <AdventureMap preview />
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-[#3a2c4f] p-4 text-cream">
              <p className="font-display text-lg font-bold text-sun">Jungle Bridge</p>
              <div className="mt-3 flex items-end gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-4 flex-1 rounded ${i < 3 ? "wood" : "border-2 border-dashed border-white/30"}`} />
                ))}
              </div>
              <p className="mt-3 text-sm opacity-80">Jawab benar untuk memasang papan jembatan.</p>
            </div>
            <div className="rounded-3xl bg-parchment p-4 text-jungle">
              <p className="font-display text-lg font-bold text-earth">Mystery Chest</p>
              <div className="mt-2 flex items-center gap-3">
                <TreasureChest width={80} />
                <div className="flex gap-1 font-display text-2xl font-extrabold">
                  {["?", "?", "?"].map((d, i) => (
                    <span key={i} className="grid h-11 w-9 place-items-center rounded-lg bg-jungle text-sun">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm">Pecahkan kode dari hasil perpangkatan.</p>
            </div>
            <div className="rounded-3xl bg-[#ffe3d0] p-4 text-jungle">
              <p className="font-display text-lg font-bold text-[#a3521c]">Rescue Naru</p>
              <div className="mt-1 flex items-end justify-between">
                <Naru pose="idle" mood="worried" width={92} />
                <Mountain size={44} className="text-earth" />
              </div>
              <p className="mt-2 text-sm">Bantu Naru melewati lumpur, sungai, dan tebing!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── MATERI ───────── */}
      <section className="bg-cream px-4 py-16 text-jungle">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-extrabold sm:text-4xl">Materi yang Akan Dipelajari</h2>
          <p className="mt-2 text-center text-[#4b4636]">Sifat-sifat bilangan berpangkat, dibagi dalam tujuh wilayah.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {REGIONS.map((r) => (
              <div key={r.id} className="stone flex min-w-[240px] flex-1 items-center gap-3 rounded-2xl px-4 py-3 sm:max-w-[320px]">
                <span className="font-display text-3xl font-extrabold text-earth/70">{r.code}</span>
                <div>
                  <div className="font-display text-sm font-extrabold tracking-wider text-forest">{r.name}</div>
                  <div className="font-semibold leading-snug">{r.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CARA BERMAIN ───────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#246B45,#173F2A)] px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <WoodSign>CARA BERMAIN</WoodSign>
          </div>
          <Parchment>
            <ol className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {STEPS.map((st, i) => (
                <li key={st} className="flex items-start gap-3 text-jungle">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange font-display text-lg font-extrabold text-[#4a2410] shadow-[0_3px_0_#a3521c]">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 font-semibold">{st}</span>
                </li>
              ))}
            </ol>
            <Footprints className="mx-auto mt-6 w-24" />
          </Parchment>
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <Naru pose="cheer" width={160} />
            <GameButton size="lg" href="/mulai" icon={<Play size={22} />}>
              MULAI PETUALANGAN
            </GameButton>
          </div>
        </div>
      </section>

      {/* ───────── IDENTITAS PENGEMBANG ───────── */}
      <DeveloperCard />

      <footer className="border-t-4 border-bark bg-[#0f2a1c] px-4 py-6 text-center text-sm text-cream/70">
        <div className="flex items-center justify-center gap-2">
          <Gem size={16} /> JEJAK SANG EKSPONEN — media pembelajaran sifat-sifat bilangan berpangkat untuk SMP kelas VIII
        </div>
        <DeveloperFooterLine className="mt-2 text-cream/80" />
        <div className="mt-1">
          <Link href="/karakter" className="underline hover:text-sun">
            Lembar referensi karakter
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Landing />
    </Suspense>
  );
}
