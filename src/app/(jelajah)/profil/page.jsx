"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, History, LogOut, Pencil, RefreshCw, TrendingUp } from "lucide-react";
import Naru from "@/components/characters/Naru";
import { Avatar, AVATARS } from "@/components/ui/Avatar";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { GameButton } from "@/components/ui/GameButton";
import { Modal, Parchment, Speech, VineProgress } from "@/components/ui/Panels";
import { Gem, HangingVines } from "@/components/scenery/Scenery";
import { useStore } from "@/lib/store/ProgressProvider";
import { BADGES } from "@/lib/gamification";
import { learningPercent, regionsDone } from "@/lib/unlock";
import { validateName } from "@/lib/validation";

export default function ProfilPage() {
  const s = useStore();
  const router = useRouter();
  const j = s.journey;
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(j.explorer.name);
  const [kelas, setKelas] = useState(j.explorer.kelas);
  const [avatar, setAvatar] = useState(j.explorer.avatar);
  const [err, setErr] = useState(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const practiceAvg = j.practice.length ? Math.round(j.practice.reduce((t, p) => t + p.score, 0) / j.practice.length) : null;
  const evalCount =
    s.save.pretests.filter((p) => p.journeyId === j.id).length + s.save.posttests.filter((p) => p.journeyId === j.id).length + j.challenge.length;

  const save = async () => {
    const v = validateName(name);
    setErr(v);
    if (v) return;
    const ok = await s.updateProfile({ name, kelas, avatar });
    if (ok) {
      setEdit(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#246B45,#173F2A)] px-4 pb-6 pt-10">
        <HangingVines count={5} seed={17} />
        <div className="relative z-20 mx-auto flex max-w-4xl flex-wrap items-end gap-4">
          <div className="rounded-full bg-sun p-1.5 shadow-[0_6px_0_#a57b1f]">
            <Avatar id={j.explorer.avatar} size={96} />
          </div>
          <div className="min-w-0 flex-1 text-cream">
            <p className="font-display text-sm font-bold tracking-widest text-sun">KARTU PENJELAJAH</p>
            <h1 className="truncate font-display text-3xl font-extrabold sm:text-4xl">{j.explorer.name}</h1>
            <p className="text-cream/80">
              {j.explorer.kelas ? `Kelas ${j.explorer.kelas} · ` : ""}Level {s.level.level} — {s.level.title}
            </p>
            {s.user && s.profile && (
              <p className="text-sm text-cream/70">
                @{s.profile.username} · {s.user.email}
              </p>
            )}
          </div>
          <div className="hidden w-32 shrink-0 sm:block md:w-36">
            <Naru pose="hang" width="100%" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-5 px-4 py-6 md:grid-cols-2">
        <Parchment>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-jungle">Statistik</h2>
            {saved && (
              <span className="flex items-center gap-1 text-sm font-bold text-forest">
                <Check size={16} /> Tersimpan
              </span>
            )}
          </div>
          <div className="mt-3 rounded-2xl bg-jungle p-3 text-cream">
            <div className="flex justify-between font-display font-bold">
              <span>{s.xp} XP</span>
              <span className="flex items-center gap-1">
                <Gem size={16} /> {s.gems}
              </span>
            </div>
            <VineProgress value={s.level.progress * 100} className="mt-2" />
            <p className="mt-1 text-xs">{s.level.next ? `${s.level.next.xp - s.xp} XP lagi ke Level ${s.level.next.level}` : "Level tertinggi!"}</p>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-jungle">
            {[
              ["Wilayah selesai", `${regionsDone(j)}/7`],
              ["Pembelajaran", `${learningPercent(j, Boolean(s.posttest))}%`],
              ["Rata-rata latihan", practiceAvg === null ? "—" : String(practiceAvg)],
              ["Permainan dimainkan", String(j.games.length)],
              ["Evaluasi dikerjakan", String(evalCount)],
              ["Pretest / Posttest", `${s.pretest?.score ?? "—"} / ${s.posttest?.score ?? "—"}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/80 p-2">
                <dt className="text-xs font-bold text-earth">{k}</dt>
                <dd className="font-display text-xl font-extrabold">{v}</dd>
              </div>
            ))}
          </dl>
          <GameButton href="/perkembangan" variant="leaf" full className="mt-3" icon={<TrendingUp size={18} />}>
            Hasil belajar & nilai
          </GameButton>
          <GameButton href="/riwayat" variant="cream" full className="mt-2" icon={<History size={18} />}>
            Riwayat aktivitas
          </GameButton>
        </Parchment>

        <Parchment>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-jungle">Ubah profil</h2>
            {!edit && (
              <GameButton size="sm" variant="leaf" onClick={() => setEdit(true)} icon={<Pencil size={14} />}>
                Ubah
              </GameButton>
            )}
          </div>
          {edit ? (
            <div className="mt-3 space-y-3">
              <label className="block text-sm font-bold text-jungle">
                Nama panggilan
                <input
                  value={name}
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-[#d9c08f] bg-white px-3 py-2 font-semibold outline-none focus:border-orange"
                />
              </label>
              {err && (
                <p className="rounded-lg bg-[#fde6e2] px-2 py-1 text-sm font-semibold text-[#7a2b2b]" role="alert">
                  {err}
                </p>
              )}
              <label className="block text-sm font-bold text-jungle">
                Kelas
                <input
                  value={kelas}
                  maxLength={12}
                  onChange={(e) => setKelas(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-[#d9c08f] bg-white px-3 py-2 font-semibold outline-none focus:border-orange"
                />
              </label>
              <fieldset>
                <legend className="text-sm font-bold text-jungle">Avatar</legend>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAvatar(a.id)}
                      aria-pressed={avatar === a.id}
                      title={a.name}
                      className={`rounded-full p-1 transition ${avatar === a.id ? "bg-orange ring-4 ring-orange/30" : "bg-transparent hover:bg-white"}`}
                    >
                      <Avatar id={a.id} size={52} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="flex gap-2">
                <GameButton
                  variant="cream"
                  onClick={() => {
                    setEdit(false);
                    setName(j.explorer.name);
                    setKelas(j.explorer.kelas);
                    setAvatar(j.explorer.avatar);
                    setErr(null);
                  }}
                >
                  Batal
                </GameButton>
                <GameButton onClick={save}>Simpan</GameButton>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-jungle">Kamu bisa mengubah nama panggilan, kelas, dan avatar penjelajah.</p>
          )}

          <div className="mt-5 border-t border-earth/20 pt-4">
            {s.user ? (
              <GameButton
                variant="wood"
                full
                onClick={async () => {
                  await s.logout();
                  router.push("/");
                }}
                icon={<LogOut size={18} />}
              >
                Keluar (logout)
              </GameButton>
            ) : (
              <>
                <GameButton variant="leaf" full onClick={() => router.push("/mulai?keluar=1")} icon={<LogOut size={18} />}>
                  Keluar / Ganti Penjelajah
                </GameButton>
                <GameButton variant="wood" full className="mt-2" onClick={() => setConfirmNew(true)} icon={<RefreshCw size={18} />}>
                  Mulai Perjalanan Baru
                </GameButton>
                <p className="mt-1 text-xs text-earth">
                  Mode lokal · data tersimpan di browser ini. Keluar tidak menghapus progres; masuk lagi dengan nama dan kelas yang sama.
                </p>
              </>
            )}
          </div>
        </Parchment>

        <Parchment className="md:col-span-2">
          <h2 className="font-display text-xl font-extrabold text-jungle">Koleksi Lencana</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BADGES.map((b) => {
              const has = s.badges.includes(b.id);
              return (
                <div key={b.id} className={`flex items-center gap-3 rounded-2xl p-2 ${has ? "bg-white" : "bg-white/40"}`}>
                  <BadgeIcon id={b.id} size={52} locked={!has} />
                  <div className="min-w-0">
                    <p className={`font-display font-extrabold leading-tight ${has ? "text-jungle" : "text-jungle/50"}`}>{b.name}</p>
                    <p className="text-xs text-earth">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Parchment>
      </div>

      <Modal open={confirmNew} onClose={() => setConfirmNew(false)} title="Mulai perjalanan baru?">
        <Speech
          who="naru"
          pose="peek"
          size={70}
          text="Perjalanan baru dimulai dari pretest lagi dengan XP dan wilayah dari nol. Tenang, riwayat perjalanan lamamu tetap tersimpan, tidak ditimpa."
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <GameButton variant="cream" onClick={() => setConfirmNew(false)}>
            Batal
          </GameButton>
          <GameButton
            onClick={() => {
              s.restartJourney();
              setConfirmNew(false);
              router.push("/pretest");
            }}
          >
            Ya, mulai baru
          </GameButton>
        </div>
      </Modal>
    </div>
  );
}
