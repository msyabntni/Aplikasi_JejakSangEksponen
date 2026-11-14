"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Music, X } from "lucide-react";
import { useStore } from "@/lib/store/ProgressProvider";
import { MUSIC_DEFAULT_VOLUME } from "@/lib/storage/local";

/** File musik latar milik pengguna (tidak diubah, diputar langsung dari URL ini). */
export const MUSIC_URL = "https://mp3tourl.com/audio/1794652154846-925cd5a1-20e2-48c0-a981-291eb73a030c.mp3";

const MusicCtx = createContext(null);

/**
 * Musik latar untuk seluruh aplikasi.
 * Dipasang di layout akar sehingga TIDAK dimuat ulang saat siswa berpindah halaman.
 * - Mencoba autoplay saat website dibuka (jika pengaturan musik ON).
 * - Jika autoplay diblokir browser: tampil tombol "Putar musik latar";
 *   musik juga langsung mulai pada sentuhan/klik/tombol pertama di halaman.
 * - ON/OFF & volume disimpan di pengaturan (localStorage).
 */
export function MusicProvider({ children }) {
  const { ready, settings, setSettings } = useStore();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const on = settings.music !== false;
  const volume = typeof settings.musicVolume === "number" ? settings.musicVolume : MUSIC_DEFAULT_VOLUME;

  // satu elemen audio untuk seluruh sesi
  useEffect(() => {
    const a = new Audio();
    a.src = MUSIC_URL;
    a.loop = true;
    a.preload = "auto";
    a.volume = volume;
    const onPlaying = () => {
      setPlaying(true);
      setBlocked(false);
      setError(null);
    };
    const onPause = () => setPlaying(false);
    const onError = () => {
      setPlaying(false);
      setError("Musik latar tidak dapat dimuat. Periksa koneksi internet.");
    };
    a.addEventListener("playing", onPlaying);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onError);
    audioRef.current = a;
    window.__jseMusic = a; // untuk pengujian otomatis (scripts/music-e2e.mjs)
    return () => {
      a.pause();
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onError);
      a.removeAttribute("src");
      a.load();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  const tryPlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return false;
    try {
      await a.play();
      return true;
    } catch (e) {
      if (e && e.name === "NotAllowedError") setBlocked(true);
      else if (e && e.name !== "AbortError") setError("Musik latar tidak dapat diputar di browser ini.");
      return false;
    }
  }, []);

  // autoplay saat masuk website / mengikuti tombol ON-OFF
  useEffect(() => {
    if (!ready) return;
    const a = audioRef.current;
    if (!a) return;
    if (on) void tryPlay();
    else {
      a.pause();
      setBlocked(false);
    }
  }, [ready, on, tryPlay]);

  // autoplay diblokir: mulai pada interaksi pertama siswa
  useEffect(() => {
    if (!blocked || !on) return;
    const go = () => void tryPlay();
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [blocked, on, tryPlay]);

  const setOn = useCallback(
    (v) => {
      setSettings({ music: v });
      // panggil play() langsung di dalam klik (dianggap izin pengguna oleh browser)
      if (v) void tryPlay();
      else audioRef.current?.pause();
    },
    [setSettings, tryPlay],
  );

  const setVolume = useCallback(
    (v) => {
      const vol = Math.min(1, Math.max(0, v));
      if (audioRef.current) audioRef.current.volume = vol;
      setSettings({ musicVolume: vol });
    },
    [setSettings],
  );

  const value = { on, playing, blocked, error, volume, setOn, setVolume, start: tryPlay };

  return (
    <MusicCtx.Provider value={value}>
      {children}
      {ready && on && blocked && !playing && !dismissed && (
        <div className="fixed bottom-24 left-3 z-[65] md:bottom-6" data-music-prompt>
          <div className="wood animate-pop flex items-center gap-2 rounded-2xl py-1.5 pl-2 pr-1.5 shadow-xl">
            <button
              onClick={() => void tryPlay()}
              className="btn-game flex items-center gap-2 rounded-xl bg-orange px-3 py-2 font-display text-sm font-extrabold text-[#4a2410] shadow-[0_3px_0_#a3521c]"
            >
              <Music size={18} /> Putar musik latar
            </button>
            <button onClick={() => setDismissed(true)} aria-label="Tutup ajakan musik" className="rounded-full p-1.5 text-cream/80 hover:bg-black/20">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </MusicCtx.Provider>
  );
}

export function useMusic() {
  return useContext(MusicCtx);
}
