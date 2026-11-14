"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Award, BookOpenCheck, FlaskConical, Footprints as FootIcon, Gamepad2, Map, ScrollText, Swords, TrendingUp } from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { Fireflies, Gem, HangingVines, Monstera, Mushroom, TreasureChest } from "@/components/scenery/Scenery";
import { GameButton } from "@/components/ui/GameButton";
import { Modal, Parchment, Speech, VineProgress } from "@/components/ui/Panels";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { useStore } from "@/lib/store/ProgressProvider";
import { challengeUnlocked, isRegionUnlocked, learningPercent, nextRegion, posttestUnlocked, regionsDone } from "@/lib/unlock";
import { getRegion, REGIONS } from "@/data/regions";
import { BADGES } from "@/lib/gamification";
import { INDICATOR_LABEL, type Indicator, type RegionId } from "@/lib/types";
import { fmtShort } from "@/lib/format";

const IND_REGION: Record<Indicator, RegionId> = {
  pengertian: 1, "basis-eksponen": 1, "perkalian-berulang": 1, perkalian: 2, pembagian: 3, "pangkat-pangkat": 4, nol: 5, negatif: 6, gabungan: 7,
};

function Campfire() {
  return (
    <svg viewBox="0 0 120 100" className="w-24 sm:w-28" aria-hidden>
      <ellipse cx="60" cy="88" rx="50" ry="8" fill="#000" opacity="0.2" />
      <path d="M22 86 L98 70 M22 70 L98 86" stroke="#754B35" strokeWidth="10" strokeLinecap="round" />
      <path className="animate-bob" style={{ transformOrigin: "60px 80px", animationDuration: "1.2s" }} d="M60 76 Q30 50 54 14 Q58 36 72 34 Q90 54 60 76Z" fill="#F39B57" />
      <path d="M60 74 Q46 58 58 36 Q64 52 70 50 Q74 62 60 74Z" fill="#F4D77A" />
    </svg>
  );
}

function Tent() {
  return (
    <svg viewBox="0 0 160 120" className="w-36 sm:w-44" aria-hidden>
      <path d="M10 112 L80 10 L150 112 Z" fill="#F39B57" stroke="#a3521c" strokeWidth="4" />
      <path d="M80 10 L80 112" stroke="#a3521c" strokeWidth="3" />
      <path d="M58 112 L80 56 L102 112 Z" fill="#7a3b16" />
      <path d="M80 10 L80 0 L100 6 L80 12" fill="#e57f9a" />
    </svg>
  );
}

function CampInner() {
  const s = useStore();
  const params = useSearchParams();
  const [lockMsg, setLockMsg] = useState(params.get("kunci") === "posttest");
  const j = s.journey!;
  const done = regionsDone(j);
  const opened = REGIONS.filter((r) => isRegionUnlocked(j, s.pretestDone, r.id)).length;
  const next = nextRegion(j, s.pretestDone);
  const nr = next ? getRegion(next)! : null;
  const pct = learningPercent(j, Boolean(s.posttest));
  const weak = s.pretest
    ? (Object.entries(s.pretest.byIndicator) as [Indicator, [number, number]][]).filter(([, [b, t]]) => b < t).map(([k]) => k)
    : [];
  const weakNotDone = weak.filter((k) => !j.regions[IND_REGION[k]]?.completedAt);
  const recent = [...j.activity].reverse().slice(0, 5);
  const fresh = j.activity.length <= 2;

  let mission: { title: string; href: string; text: string };
  if (nr) mission = { title: `Wilayah ${nr.code}: ${nr.name}`, href: `/wilayah/${nr.id}`, text: nr.title };
  else if (!posttestUnlocked(j)) mission = { title: "Jungle Challenge", href: "/challenge", text: "Semua wilayah selesai! Taklukkan tantangan akhir." };
  else if (!s.posttest) mission = { title: "Posttest", href: "/posttest", text: "Saatnya membuktikan perkembanganmu!" };
  else mission = { title: "Lihat Hasil Belajar", href: "/perkembangan", text: "Bandingkan pretest dan posttest-mu." };

  const shortcuts = [
    { href: mission.href, label: "Lanjutkan Jejak", icon: FootIcon, color: "bg-orange text-[#4a2410]" },
    { href: "/peta", label: "Buka Peta Petualangan", icon: Map, color: "bg-[#f9dfe3] text-[#8b3a4b]" },
    { href: "/lab", label: "Laboratorium Sang Eksponen", icon: FlaskConical, color: "bg-[#d5f0ec] text-[#1f6b63]" },
    { href: "/latihan", label: "Mulai Latihan", icon: BookOpenCheck, color: "bg-[#e3f4dc] text-forest" },
    { href: "/game", label: "Main Mini-Game", icon: Gamepad2, color: "bg-[#fde6d0] text-[#a3521c]" },
    { href: "/challenge", label: "Mulai Jungle Challenge", icon: Swords, color: challengeUnlocked(j) ? "bg-sun text-earth" : "bg-white/60 text-earth/60" },
    { href: "/profil", label: "Lihat Lencana dan Profil", icon: Award, color: "bg-[#dfe7f5] text-[#2f4f7a]" },
  ];

  return (
    <div>
      {/* ───── adegan perkemahan ───── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#2c5a7a_0%,#4d7a52_45%,#2f6d35_75%)] px-4 pb-6 pt-6">
        <Fireflies count={14} />
        <HangingVines count={6} seed={5} />
        <div className="relative z-20 mx-auto max-w-5xl">
          <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
            <div className="pt-16 md:pt-4">
              <p className="font-display text-sm font-bold tracking-widest text-sun">CAMP PENJELAJAH</p>
              <h1 className="font-display text-3xl font-extrabold text-cream sm:text-4xl">Halo, {j.explorer.name}!</h1>
              <Speech
                who="naru"
                pose="peek"
                size={70}
                className="mt-3 max-w-xl"
                text={
                  fresh
                    ? "Selamat datang di camp! Peta sudah kubuka. Wilayah pertama, Forest Camp, sudah menunggumu!"
                    : nr
                      ? `Ayo, ayo! Kita sudah dekat dengan wilayah berikutnya: ${nr.name}!`
                      : "LUAR BIASA! Semua wilayah sudah kamu jelajahi!"
                }
              />
            </div>
            <div className="pointer-events-none absolute right-0 top-0 w-24 sm:w-32 md:static md:w-36">
              <Naru pose="hang" width="100%" />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <Tent />
            <Campfire />
            <div className="hidden sm:block"><TreasureChest width={90} /></div>
            <Kaciro pose="book" width={110} />
          </div>
        </div>
        <Monstera className="pointer-events-none absolute -bottom-10 -left-8 w-32" />
        <Mushroom className="absolute bottom-2 left-1/3 w-8" glow />
      </section>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 lg:grid-cols-[1.2fr_1fr]">
        {/* papan misi */}
        <div className="space-y-5">
          <div className="wood rounded-3xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-sun">PAPAN MISI</h2>
              <span className="rounded-full bg-black/20 px-3 py-0.5 text-sm font-bold">{opened} wilayah terbuka</span>
            </div>
            <p className="mt-2 text-sm text-cream/80">Misi berikutnya</p>
            <p className="font-display text-2xl font-extrabold">{mission.title}</p>
            <p className="text-cream/90">{mission.text}</p>
            <GameButton href={mission.href} className="mt-3" icon={<FootIcon size={18} />}>
              Lanjutkan Jejak
            </GameButton>
            {weakNotDone.length > 0 && (
              <div className="mt-4 rounded-2xl bg-black/20 p-3 text-sm">
                <b className="text-sun">Rekomendasi dari hasil pretest:</b> perhatikan baik-baik materi{" "}
                {weakNotDone.slice(0, 3).map((k) => INDICATOR_LABEL[k]).join(", ")} (Wilayah{" "}
                {[...new Set(weakNotDone.map((k) => IND_REGION[k]))].sort().map((r) => getRegion(r)!.code).join(", ")}).
              </div>
            )}
          </div>

          <Parchment>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2 rounded-2xl bg-jungle p-3 text-cream sm:col-span-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-extrabold text-sun">Level {s.level.level}</span>
                  <span className="text-sm">{s.level.title}</span>
                </div>
                <VineProgress value={s.level.progress * 100} className="mt-2" />
                <p className="mt-1 text-xs text-cream/80">{s.xp} XP{s.level.next ? ` · ${s.level.next.xp - s.xp} XP lagi ke Level ${s.level.next.level}` : " · level tertinggi!"}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 text-center">
                <div className="font-display text-3xl font-extrabold text-forest">{done}/7</div>
                <div className="text-xs font-bold text-earth">wilayah selesai</div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 text-center">
                <div className="flex items-center justify-center gap-1 font-display text-3xl font-extrabold text-[#1f6b63]"><Gem size={22} />{s.gems}</div>
                <div className="text-xs font-bold text-earth">permata</div>
              </div>
            </div>
            <VineProgress value={pct} label="Progres pembelajaran" className="mt-4 text-jungle" />
          </Parchment>

          {/* pintasan */}
          <nav aria-label="Pintasan" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shortcuts.map((x, i) => (
              <Link
                key={x.label}
                href={x.href}
                className={`btn-game flex min-h-20 flex-col justify-between rounded-2xl border-2 border-black/10 p-3 font-display font-bold shadow-[0_4px_0_rgba(0,0,0,0.25)] ${x.color} ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <x.icon size={24} />
                <span className="leading-tight">{x.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-5">
          <Parchment>
            <h2 className="font-display text-xl font-extrabold text-jungle">Lencana</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <div key={b.id} title={`${b.name}: ${b.desc}`}>
                  <BadgeIcon id={b.id} size={46} locked={!s.badges.includes(b.id)} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-earth">{s.badges.length} dari {BADGES.length} lencana diperoleh.</p>
          </Parchment>

          <Parchment>
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-jungle"><ScrollText size={20} /> Aktivitas terakhir</h2>
            {recent.length === 0 ? (
              <p className="mt-2 text-jungle">Belum ada aktivitas. Jejak pertamamu dimulai dari Forest Camp!</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-jungle">
                    <span>
                      <b>{a.title}</b>
                      {a.detail && <span className="text-earth"> · {a.detail}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-earth">{fmtShort(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/riwayat" className="mt-2 inline-block text-sm font-bold text-forest underline">Lihat semua riwayat</Link>
          </Parchment>

          <GameButton href="/perkembangan" variant="leaf" full icon={<TrendingUp />}>Lihat Hasil Belajar</GameButton>
        </div>
      </div>

      <Modal open={lockMsg} onClose={() => setLockMsg(false)} title="Posttest masih terkunci">
        <Speech who="kaciro" pose="tip" size={80} text="Posttest terbuka setelah ketujuh wilayah dan ketiga level Jungle Challenge selesai. Sedikit lagi, ya!" />
      </Modal>

      <Modal open={s.canImportGuest} onClose={s.declineImport} title="Pindahkan progres tamu?">
        <Speech who="naru" pose="point" size={80} text="Aku menemukan progres dari mode tamu di perangkat ini. Mau dipindahkan ke akunmu? Ini hanya bisa dilakukan satu kali, dan XP tidak akan digandakan." />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <GameButton variant="cream" onClick={s.declineImport}>Tidak usah</GameButton>
          <GameButton onClick={() => void s.importGuest()}>Ya, pindahkan</GameButton>
        </div>
      </Modal>
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense>
      <CampInner />
    </Suspense>
  );
}
