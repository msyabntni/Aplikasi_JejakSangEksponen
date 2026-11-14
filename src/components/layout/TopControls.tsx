"use client";

import { Info, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store/ProgressProvider";
import { Modal } from "../ui/Panels";
import Naru from "../characters/Naru";
import Kaciro from "../characters/Kaciro";

export function InfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        <p className="text-sm">Tombol suara dan animasi ada di bagian atas layar. Animasi juga otomatis dikurangi jika perangkatmu meminta &quot;kurangi gerakan&quot;.</p>
      </div>
    </Modal>
  );
}

export function TopControls({ dark }: { dark?: boolean }) {
  const { settings, setSettings } = useStore();
  const [info, setInfo] = useState(false);
  const motionOff = settings.motion === "off";
  const btn = `grid h-10 w-10 place-items-center rounded-full border-2 transition hover:scale-105 active:scale-95 ${
    dark ? "border-white/30 bg-white/10 text-cream" : "border-earth/30 bg-white/80 text-jungle"
  }`;
  return (
    <div className="flex items-center gap-1.5">
      <button className={btn} onClick={() => setSettings({ sound: !settings.sound })} aria-label={settings.sound ? "Matikan suara" : "Hidupkan suara"} aria-pressed={settings.sound} title={settings.sound ? "Suara: hidup" : "Suara: mati"}>
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
