"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LogIn, UserRound, Users } from "lucide-react";
import Naru from "@/components/characters/Naru";
import { JungleBackdrop, Monstera } from "@/components/scenery/Scenery";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment, Speech, WoodSign } from "@/components/ui/Panels";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store/ProgressProvider";
import { levelFor, totals } from "@/lib/gamification";
import { regionsDone } from "@/lib/unlock";
import { play } from "@/lib/sound";
import { validateKelas, validateName } from "@/lib/validation";

/**
 * Masuk penjelajah TANPA password: cukup nama + kelas (mode lokal).
 * Nama + kelas yang sama → melanjutkan progres; yang baru → perjalanan baru.
 */
export default function MulaiPage() {
  return (
    <Suspense>
      <Mulai />
    </Suspense>
  );
}

function Mulai() {
  const s = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const keluar = params.get("keluar") === "1";
  const [leftMsg, setLeftMsg] = useState<string | null>(null);

  // keluar dari penjelajah aktif (dipanggil dari Profil); data tetap tersimpan
  useEffect(() => {
    if (!s.ready || !keluar) return;
    if (s.journey) {
      setLeftMsg(`${s.journey.explorer.name} sudah keluar. Progres tetap tersimpan di perangkat ini.`);
      s.signOutExplorer();
    }
    router.replace("/mulai");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.ready, keluar]);
  const [name, setName] = useState("");
  const [kelas, setKelas] = useState("");
  const [errs, setErrs] = useState<{ name?: string | null; kelas?: string | null }>({});
  const [done, setDone] = useState<{ resumed: boolean; name: string } | null>(null);

  const hasPretest = (journeyId: string) => s.save.pretests.some((p) => p.journeyId === journeyId);
  const goOn = (journeyId: string) => router.push(hasPretest(journeyId) ? "/camp" : "/pretest");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = { name: validateName(name), kelas: validateKelas(kelas) };
    setErrs(v);
    if (v.name || v.kelas) {
      play("wrong");
      return;
    }
    const r = s.loginExplorer(name, kelas);
    play("unlock");
    setDone({ resumed: r.resumed, name: name.trim() });
  };

  return (
    <JungleBackdrop className="min-h-dvh" sky={["#a8dcc4", "#e9f0d8"]}>
      <Monstera className="pointer-events-none absolute -bottom-8 -right-10 w-48 animate-sway" flip />
      <div className="relative z-20 mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-20">
        <Link href="/" className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 font-bold text-jungle">
          <ArrowLeft size={16} /> Kembali
        </Link>

        {!done && (
          <div className="animate-pop space-y-5">
            <div className="text-center">
              <WoodSign>MASUK PENJELAJAH</WoodSign>
            </div>
            {leftMsg && (
              <p className="rounded-2xl bg-white/90 px-4 py-2 text-center font-semibold text-forest" role="status">
                {leftMsg}
              </p>
            )}

            <form onSubmit={submit} noValidate>
              <Parchment>
                <Speech
                  who="naru"
                  pose="idle"
                  size={84}
                  text="Halo, penjelajah! Tulis nama dan kelasmu. Tidak perlu password. Kalau kamu sudah pernah bermain di perangkat ini, progresmu akan dilanjutkan."
                />
                <label className="mt-4 block font-display text-lg font-bold text-jungle" htmlFor="nama">
                  Nama atau nama panggilan
                </label>
                <input
                  id="nama"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errs.name) setErrs((x) => ({ ...x, name: null }));
                  }}
                  maxLength={24}
                  autoFocus
                  autoComplete="nickname"
                  aria-invalid={Boolean(errs.name)}
                  aria-describedby={errs.name ? "nama-err" : undefined}
                  placeholder="contoh: Dimas"
                  className="mt-1 w-full rounded-2xl border-2 border-[#d9c08f] bg-white px-4 py-3 font-display text-xl font-bold text-jungle outline-none focus:border-orange"
                />
                {errs.name && (
                  <p id="nama-err" className="mt-2 rounded-xl bg-[#fde6e2] px-3 py-2 text-sm font-semibold text-[#7a2b2b]" role="alert">
                    {errs.name}
                  </p>
                )}
                <label className="mt-4 block font-display text-lg font-bold text-jungle" htmlFor="kelas">
                  Kelas
                </label>
                <input
                  id="kelas"
                  value={kelas}
                  onChange={(e) => {
                    setKelas(e.target.value.slice(0, 12));
                    if (errs.kelas) setErrs((x) => ({ ...x, kelas: null }));
                  }}
                  aria-invalid={Boolean(errs.kelas)}
                  aria-describedby={errs.kelas ? "kelas-err" : undefined}
                  placeholder="contoh: VIII A"
                  className="mt-1 w-full rounded-2xl border-2 border-[#d9c08f] bg-white px-4 py-3 font-display text-xl font-bold text-jungle outline-none focus:border-orange"
                />
                {errs.kelas && (
                  <p id="kelas-err" className="mt-2 rounded-xl bg-[#fde6e2] px-3 py-2 text-sm font-semibold text-[#7a2b2b]" role="alert">
                    {errs.kelas}
                  </p>
                )}
                <GameButton type="submit" size="lg" full className="mt-5" icon={<ArrowRight />}>
                  MASUK
                </GameButton>
                <p className="mt-3 text-center text-xs text-earth">Data disimpan di browser perangkat ini (mode lokal).</p>
                {s.accountEnabled && (
                  <Link href="/auth/login" className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-forest underline">
                    <LogIn size={16} /> Atau masuk dengan akun email
                  </Link>
                )}
              </Parchment>
            </form>

            {s.ready && s.explorers.length > 0 && (
              <Parchment>
                <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-jungle">
                  <Users size={20} /> Penjelajah di perangkat ini
                </h2>
                <p className="text-sm text-earth">Ketuk namamu untuk melanjutkan petualangan.</p>
                <ul className="mt-3 space-y-2">
                  {s.explorers.map((j) => {
                    const active = j.id === s.save.activeJourneyId;
                    return (
                      <li key={j.id}>
                        <button
                          onClick={() => {
                            play("tap");
                            s.switchJourney(j.id);
                            goOn(j.id);
                          }}
                          className={`btn-game flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left text-jungle ${active ? "border-orange bg-[#fff1e2]" : "border-[#d9c08f] bg-white"}`}
                          aria-label={`Masuk sebagai ${j.explorer.name}, kelas ${j.explorer.kelas || "-"}`}
                        >
                          <Avatar id={j.explorer.avatar} size={44} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-lg font-extrabold">{j.explorer.name}</span>
                            <span className="block text-sm text-earth">
                              Kelas {j.explorer.kelas || "—"} · Level {levelFor(totals(j.rewards).xp).level} · {regionsDone(j)}/7 wilayah
                              {!hasPretest(j.id) && " · belum pretest"}
                            </span>
                          </span>
                          {active ? <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-bold text-white">aktif</span> : <UserRound size={18} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Parchment>
            )}
          </div>
        )}

        {done && (
          <div className="animate-pop text-center">
            <div className="mx-auto w-44">
              <Naru pose="cheer" width="100%" />
            </div>
            <Parchment className="mt-2 text-left">
              {done.resumed ? (
                <>
                  <Speech who="naru" pose="point" size={84} text={`Selamat datang kembali, ${done.name}! Progresmu masih tersimpan. Ayo lanjutkan petualangan!`} />
                  <GameButton size="lg" full className="mt-4" onClick={() => goOn(s.save.activeJourneyId ?? "")} icon={<ArrowRight />}>
                    LANJUTKAN PETUALANGAN
                  </GameButton>
                </>
              ) : (
                <>
                  <Speech
                    who="naru"
                    pose="point"
                    size={84}
                    text={`Selamat datang, ${done.name}! Sebelum kita masuk lebih dalam, ada gerbang uji kemampuan. Ayo kuantar ke sana!`}
                  />
                  <GameButton size="lg" full className="mt-4" onClick={() => router.push("/pretest")} icon={<ArrowRight />}>
                    MENUJU GERBANG PRETEST
                  </GameButton>
                </>
              )}
            </Parchment>
          </div>
        )}
      </div>
    </JungleBackdrop>
  );
}
