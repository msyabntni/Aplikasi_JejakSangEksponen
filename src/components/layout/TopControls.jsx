"use client";

import { Info, Music, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMusic } from "./BackgroundMusic";
import { useStore } from "@/lib/store/ProgressProvider";
import { Modal } from "../ui/Panels";
import Naru from "../characters/Naru";
import Kaciro from "../characters/Kaciro";

export function InfoModal({ open, onClose }) {
  const { accountEnabled } = useStore();
  return (
    <Modal open={open} onClose={onClose} title="Tentang JEJAK SANG EKSPONEN" wide>
      <div className="flex items-end justify-center gap-2">
        <Naru pose="point" width={90} />
        <Kaciro pose="book" width={90} />
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#3a3020]">
        <p>
          <b>JEJAK SANG EKSPONEN</b> adalah media pembelajaran interaktif berbentuk petualangan hutan untuk siswa SMP kelas VIII. Kamu akan mempelajari
          <b> sifat-sifat bilangan berpangkat</b> bersama Naru si monyet penjelajah dan Kaciro si kancil cerdas.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Mulai dengan pretest untuk mengetahui kemampuan awal.</li>
          <li>Jelajahi tujuh wilayah, kerjakan misi, latihan, dan mini-game.</li>
          <li>Taklukkan Jungle Challenge lalu kerjakan posttest untuk melihat perkembanganmu.</li>
        </ul>
        <p className="rounded-xl bg-white/70 p-3 text-sm">
          <b>Penyimpanan:</b> Mode tamu menyimpan progres di browser perangkat ini (localStorage).{" "}
          {accountEnabled
            ? "Mode akun aktif: kamu bisa masuk dengan email agar progres tersimpan di server."
            : "Mode akun (email) belum dikonfigurasi oleh pengelola, jadi saat ini hanya mode tamu yang tersedia."}
        </p>
        <p className="text-sm">
          Tombol suara dan animasi ada di bagian atas layar. Animasi juga otomatis dikurangi jika perangkatmu meminta &quot;kurangi gerakan&quot;.
        </p>
      </div>
    </Modal>
  );
}

/** Tombol musik latar: panel kecil berisi ON/OFF dan pengatur volume. */
function MusicControl({ btn }) {
  const m = useMusic();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  if (!m) return null;
  const state = m.playing ? "playing" : m.error ? "error" : m.on && m.blocked ? "blocked" : m.on ? "loading" : "off";
  const status = {
    playing: "Sedang diputar",
    loading: "Memuat musik...",
    blocked: "Diblokir browser. Tekan Putar.",
    off: "Musik mati",
    error: m.error,
  }[state];
  const pct = Math.round(m.volume * 100);
  return (
    <div className="relative" ref={wrap}>
      <button
        className={`${btn} ${m.on ? "" : "opacity-60"}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Pengaturan musik latar"
        aria-expanded={open}
        title={`Musik latar: ${m.on ? "ON" : "OFF"}`}
        data-music-state={state}
      >
        <Music size={18} className={m.playing ? "animate-bob" : ""} style={{ animationDuration: "1.6s" }} />
      </button>
      {open && (
        <div className="parchment animate-pop fixed inset-x-3 top-16 z-[70] rounded-2xl p-3 text-left text-jungle sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-64" role="dialog" aria-label="Musik latar">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-base font-extrabold">Musik latar</span>
            <button
              onClick={() => m.setOn(!m.on)}
              role="switch"
              aria-checked={m.on}
              aria-label={m.on ? "Matikan musik latar" : "Hidupkan musik latar"}
              className={`relative h-8 w-16 rounded-full border-2 font-display text-xs font-extrabold transition ${m.on ? "border-forest bg-leaf text-white" : "border-earth/30 bg-white text-earth"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${m.on ? "left-[34px]" : "left-0.5 bg-cream"}`} />
              <span className={`absolute top-1.5 ${m.on ? "left-2" : "right-2"}`}>{m.on ? "ON" : "OFF"}</span>
            </button>
          </div>
          <label className="mt-3 block text-sm font-bold" htmlFor="music-volume">
            Volume: <span data-music-volume>{pct}%</span>
          </label>
          <input
            id="music-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={pct}
            onChange={(e) => m.setVolume(Number(e.target.value) / 100)}
            className="mt-1 w-full accent-[#F39B57]"
            aria-label="Volume musik latar"
          />
          <p className={`mt-2 text-xs font-semibold ${state === "error" ? "text-[#a3321c]" : "text-earth"}`}>{status}</p>
          {state === "blocked" && (
            <button onClick={() => void m.start()} className="btn-game mt-2 w-full rounded-xl bg-orange py-1.5 font-display text-sm font-extrabold text-[#4a2410] shadow-[0_3px_0_#a3521c]">
              Putar musik
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TopControls({ dark }) {
  const { settings, setSettings } = useStore();
  const [info, setInfo] = useState(false);
  const motionOff = settings.motion === "off";
  const btn = `grid h-10 w-10 place-items-center rounded-full border-2 transition hover:scale-105 active:scale-95 ${
    dark ? "border-white/30 bg-white/10 text-cream" : "border-earth/30 bg-white/80 text-jungle"
  }`;
  return (
    <div className="flex items-center gap-1.5">
      <MusicControl btn={btn} />
      <button
        className={btn}
        onClick={() => setSettings({ sound: !settings.sound })}
        aria-label={settings.sound ? "Matikan suara" : "Hidupkan suara"}
        aria-pressed={settings.sound}
        title={settings.sound ? "Suara: hidup" : "Suara: mati"}
      >
        {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
      <button
        className={`${btn} ${motionOff ? "opacity-60" : ""}`}
        onClick={() => setSettings({ motion: motionOff ? "auto" : "off" })}
        aria-label={motionOff ? "Hidupkan animasi" : "Matikan animasi"}
        aria-pressed={!motionOff}
        title={motionOff ? "Animasi: mati" : "Animasi: hidup"}
      >
        <Sparkles size={18} />
      </button>
      <button className={btn} onClick={() => setInfo(true)} aria-label="Informasi aplikasi" title="Informasi">
        <Info size={18} />
      </button>
      <InfoModal open={info} onClose={() => setInfo(false)} />
    </div>
  );
}
