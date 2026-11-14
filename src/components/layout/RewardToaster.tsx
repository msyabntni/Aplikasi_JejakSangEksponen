"use client";

import { useEffect } from "react";
import { AlertTriangle, Info, Sparkles, X } from "lucide-react";
import { useStore, type Note } from "@/lib/store/ProgressProvider";
import { BadgeIcon } from "../ui/BadgeIcon";
import { Gem } from "../scenery/Scenery";
import Naru from "../characters/Naru";

function Toast({ n, onClose }: { n: Note; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, n.kind === "badge" || n.kind === "level" ? 6000 : n.kind === "error" ? 8000 : 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n.id]);

  const big = n.kind === "badge" || n.kind === "level";
  return (
    <div
      role="status"
      className={`animate-pop pointer-events-auto flex items-center gap-3 rounded-2xl border-2 px-3 py-2 shadow-xl ${
        n.kind === "error" ? "border-coral bg-[#fff1ef] text-[#7a2b2b]" : big ? "parchment border-sun" : "border-[#d9c08f] bg-white text-jungle"
      }`}
    >
      {n.kind === "badge" && n.badgeId ? (
        <BadgeIcon id={n.badgeId} size={56} />
      ) : n.kind === "level" ? (
        <Naru pose="cheer" width={56} />
      ) : n.kind === "xp" ? (
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-jungle"><Gem size={22} /></span>
      ) : n.kind === "error" ? (
        <AlertTriangle className="shrink-0" />
      ) : (
        <Info className="shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 font-display text-base font-extrabold leading-tight">
          {big && <Sparkles size={16} className="text-orange" />}
          {n.title}
        </div>
        {n.detail && <div className="text-sm opacity-80">{n.detail}</div>}
      </div>
      <button onClick={onClose} aria-label="Tutup notifikasi" className="rounded-full p-1 opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}

export function RewardToaster() {
  const { notes, dismissNote } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] mx-auto flex max-w-sm flex-col gap-2 px-3" aria-live="polite">
      {notes.slice(-4).map((n) => (
        <Toast key={n.id} n={n} onClose={() => dismissNote(n.id)} />
      ))}
    </div>
  );
}
