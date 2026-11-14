"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Gamepad2, Lock, Printer, ScrollText, Swords, BookOpenCheck, Map as MapIcon } from "lucide-react";
import Naru from "@/components/characters/Naru";
import Kaciro from "@/components/characters/Kaciro";
import { CompareChart } from "@/components/results/CompareChart";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, VineProgress } from "@/components/ui/Panels";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { Gem } from "@/components/scenery/Scenery";
import { useStore } from "@/lib/store/ProgressProvider";
import { BADGES, challengeLevelsPassed } from "@/lib/gamification";
import { learningPercent, posttestUnlocked, regionStatus, regionsDone } from "@/lib/unlock";
import { REGIONS, MISSION_PASS } from "@/data/regions";
import { GAMES } from "@/data/games";
import { CHALLENGE_LEVELS, CHALLENGE_PASS } from "@/data/challenge";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { fmtShort } from "@/lib/format";

function ScoreCard({ label, score, sub, tone = "parchment" }) {
  const bg = tone === "good" ? "bg-[#e3f4dc]" : tone === "warn" ? "bg-[#fde6d0]" : "parchment";
  return (
    <div className={`${bg} rounded-3xl p-2 text-center sm:p-4`}>
      <p className="text-xs font-bold text-earth sm:text-sm">{label}</p>
      <p className="font-display text-3xl font-extrabold text-jungle sm:text-5xl">{score}</p>
      {sub && <p className="text-[11px] text-earth sm:text-xs">{sub}</p>}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <Parchment className="break-inside-avoid">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-extrabold text-jungle">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange text-white">{icon}</span>
        {title}
      </h2>
      {children}
    </Parchment>
  );
}

/** HALAMAN HASIL BELAJAR: rapor lengkap nilai & progres penjelajah aktif. */
export default function HasilBelajarPage() {
  const s = useStore();
  const j = s.journey;
  const pre = s.pretest;
  const post = s.posttest;
  const diff = pre && post ? post.score - pre.score : null;
  const pct = learningPercent(j, Boolean(post));
  const passed = challengeLevelsPassed(j);
  const practiceAvg = j.practice.length ? Math.round(j.practice.reduce((t, p) => t + p.score, 0) / j.practice.length) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:bg-white print:p-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold tracking-widest text-sun print:text-earth">HASIL BELAJAR</p>
          <h1 className="font-display text-3xl font-extrabold text-cream print:text-jungle">Rapor Penjelajah</h1>
        </div>
        <GameButton variant="cream" size="sm" className="print:hidden" onClick={() => window.print()} icon={<Printer size={16} />}>
          Cetak / simpan PDF
        </GameButton>
      </div>

      {/* identitas */}
      <Parchment className="mt-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar id={j.explorer.avatar} size={72} />
          <div className="min-w-0 flex-1 text-jungle">
            <p className="font-display text-2xl font-extrabold">{j.explorer.name}</p>
            <p className="text-earth">
              Kelas {j.explorer.kelas || "—"} · mulai {fmtShort(j.startedAt)}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 font-bold">
              <span>
                Level {s.level.level} — {s.level.title}
              </span>
              <span>{s.xp} XP</span>
              <span className="flex items-center gap-1">
                <Gem size={16} /> {s.gems}
              </span>
              <span>{regionsDone(j)}/7 wilayah</span>
            </p>
          </div>
        </div>
        <VineProgress value={pct} label="Progres pembelajaran" className="mt-4 text-jungle" />
      </Parchment>

      {/* pretest & posttest */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <ScoreCard label="Pretest" score={pre?.score ?? "—"} sub={pre ? `${pre.correct}/${pre.correct + pre.wrong} benar` : "belum dikerjakan"} />
        <ScoreCard
          label="Posttest"
          score={post?.score ?? "—"}
          sub={post ? `${post.correct}/${post.correct + post.wrong} benar` : posttestUnlocked(j) ? "siap dikerjakan" : "belum terbuka"}
        />
        <ScoreCard
          label="Selisih"
          score={diff === null ? "—" : diff > 0 ? `+${diff}` : diff}
          sub={diff === null ? "menunggu posttest" : diff > 0 ? "naik" : diff === 0 ? "tetap" : "turun"}
          tone={diff === null ? "parchment" : diff >= 0 ? "good" : "warn"}
        />
      </div>

      <div className="mt-5 space-y-5">
        <Section icon={<ScrollText size={16} />} title="Perbandingan Pretest & Posttest">
          {pre && post ? (
            <>
              <p className="mb-3 text-sm text-earth">
                Pretest {fmtShort(pre.finishedAt)} · Posttest {fmtShort(post.finishedAt)}. Nilai pretest tidak pernah diubah.
              </p>
              <CompareChart pre={pre} post={post} />
              <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                <GameButton href="/posttest/hasil" size="sm" variant="leaf">
                  Pembahasan posttest
                </GameButton>
                <GameButton href="/pretest/hasil" size="sm" variant="cream">
                  Hasil pretest
                </GameButton>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 text-jungle">
              <Kaciro pose="tip" width={70} />
              <p>
                Grafik perbandingan muncul setelah pretest dan posttest dikerjakan.{" "}
                {!post &&
                  (posttestUnlocked(j) ? (
                    <Link href="/posttest" className="font-bold text-forest underline">
                      Kerjakan posttest sekarang.
                    </Link>
                  ) : (
                    <>Posttest terbuka setelah 7 wilayah dan 3 level Jungle Challenge selesai.</>
                  ))}
              </p>
            </div>
          )}
        </Section>

        <Section icon={<MapIcon size={16} />} title="Nilai Misi Tiap Wilayah">
          <div className="overflow-x-auto rounded-2xl bg-white">
            <table className="w-full min-w-[460px] text-left text-sm text-jungle">
              <thead className="bg-cream">
                <tr>
                  <th className="px-3 py-2">Wilayah</th>
                  <th className="px-3 py-2">Nilai misi terbaik</th>
                  <th className="px-3 py-2">Percobaan</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((r) => {
                  const st = regionStatus(j, s.pretestDone, r.id);
                  const best = j.regions[r.id]?.missionBest ?? 0;
                  const tries = j.missions.filter((m) => m.region === r.id).length;
                  return (
                    <tr key={r.id} className="border-t border-earth/10">
                      <td className="px-3 py-2 font-semibold">
                        {r.code} · {r.name}
                      </td>
                      <td className="px-3 py-2 font-display text-lg font-extrabold">
                        {tries || best ? best : "—"}
                        {best > 0 && best < MISSION_PASS && <span className="ml-1 text-xs font-normal text-[#a3521c]">(&lt; {MISSION_PASS})</span>}
                      </td>
                      <td className="px-3 py-2">{tries}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 font-bold">
                          {st === "done" ? <CheckCircle2 size={15} className="text-forest" /> : st === "locked" ? <Lock size={15} /> : <Circle size={15} />}
                          {{ done: "Selesai", progress: "Berlangsung", new: "Belum dimainkan", locked: "Terkunci" }[st]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="grid gap-5 md:grid-cols-2">
          <Section icon={<BookOpenCheck size={16} />} title="Latihan Soal">
            {j.practice.length === 0 ? (
              <p className="text-jungle">
                Belum ada latihan.{" "}
                <Link href="/latihan" className="font-bold text-forest underline">
                  Mulai latihan
                </Link>
              </p>
            ) : (
              <>
                <p className="text-jungle">
                  {j.practice.length} sesi · rata-rata <b>{practiceAvg}</b>
                </p>
                <ul className="mt-2 space-y-1">
                  {[1, 2, 3].map((l) => {
                    const list = j.practice.filter((p) => p.level === l);
                    return (
                      <li key={l} className="flex justify-between rounded-xl bg-white/80 px-3 py-1.5 text-sm text-jungle">
                        <span>{DIFFICULTY_LABEL[l]}</span>
                        <span className="font-bold">{list.length ? `terbaik ${Math.max(...list.map((p) => p.score))} · ${list.length} sesi` : "—"}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Section>

          <Section icon={<Swords size={16} />} title="Jungle Challenge">
            <ul className="space-y-1">
              {CHALLENGE_LEVELS.map((L) => {
                const list = j.challenge.filter((c) => c.level === L.level);
                const ok = passed.includes(L.level);
                return (
                  <li key={L.level} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-1.5 text-sm text-jungle">
                    <span>
                      Level {L.level} · {L.name}
                    </span>
                    <span className={`font-bold ${ok ? "text-forest" : ""}`}>
                      {list.length ? `${Math.max(...list.map((c) => c.score))}${ok ? " · lulus" : ` · belum (≥ ${CHALLENGE_PASS})`}` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        <Section icon={<Gamepad2 size={16} />} title="Mini-Game">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GAMES.map((g) => {
              const list = j.games.filter((x) => x.game === g.id);
              const won = j.gamesWon.includes(g.id);
              return (
                <div key={g.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm text-jungle">
                  <p className="font-bold">{g.title}</p>
                  <p className="text-earth">
                    {list.length ? `skor terbaik ${Math.max(...list.map((x) => x.score))} · ${list.length}x main${won ? " · menang" : ""}` : "belum dimainkan"}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section icon={<CheckCircle2 size={16} />} title="Lencana">
          <div className="flex flex-wrap gap-3">
            {BADGES.map((b) => (
              <div key={b.id} className="flex w-24 flex-col items-center text-center" title={b.desc}>
                <BadgeIcon id={b.id} size={48} locked={!s.badges.includes(b.id)} />
                <span className={`mt-1 text-xs font-bold ${s.badges.includes(b.id) ? "text-jungle" : "text-jungle/40"}`}>{b.name}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 print:hidden">
        <Speech
          who="naru"
          pose={diff !== null && diff > 0 ? "cheer" : "jump"}
          size={84}
          text={
            diff !== null && diff > 0
              ? `LUAR BIASA! Skormu naik ${diff} poin! Kamu benar-benar sudah menaklukkan kekuatan pangkat!`
              : "Setiap jejak yang kamu selesaikan tercatat di sini. Ayo lanjutkan petualangan!"
          }
        />
        <Speech
          who="kaciro"
          pose="tip"
          size={84}
          side="right"
          text="Lihat nilai yang masih rendah. Ulangi wilayahnya di peta atau coba latihan di tingkat yang sesuai."
        />
      </div>
      <div className="mt-6 flex items-end justify-center gap-4 print:hidden">
        <Naru pose="sit" width={90} />
        <GameButton href="/camp">Kembali ke Camp</GameButton>
      </div>
    </div>
  );
}
