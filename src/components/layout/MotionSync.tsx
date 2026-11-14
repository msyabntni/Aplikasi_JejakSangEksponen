"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store/ProgressProvider";

/** Menyinkronkan pengaturan animasi ke atribut <html data-motion>. */
export function MotionSync() {
  const { settings } = useStore();
  useEffect(() => {
    document.documentElement.dataset.motion = settings.motion;
  }, [settings.motion]);
  return null;
}
