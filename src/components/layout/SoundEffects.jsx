"use client";

import { useEffect } from "react";
import { installTapSounds, preloadSounds } from "@/lib/sound";

/** Memuat file efek suara dan memasang suara klik untuk setiap tombol (satu kali untuk seluruh aplikasi). */
export function SoundEffects() {
  useEffect(() => {
    preloadSounds();
    return installTapSounds();
  }, []);
  return null;
}
