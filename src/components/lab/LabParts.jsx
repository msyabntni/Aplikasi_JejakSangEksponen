"use client";

import { AlertTriangle } from "lucide-react";
import { MathText } from "../ui/MathText";

export function NumField({ label, value, onChange, id, color = "#246B45" }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-sm font-bold" style={{ color }}>
        {label}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        autoComplete="off"
        className="w-24 rounded-xl border-2 bg-white px-3 py-2 text-center font-display text-2xl font-extrabold text-jungle outline-none focus:ring-4 focus:ring-orange/30"
        style={{ borderColor: color }}
      />
    </label>
  );
}

export function LabError({ text }) {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fde6e2] px-3 py-2 font-semibold text-[#7a2b2b]" role="alert">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" /> <MathText text={text} />
    </p>
  );
}

export function Steps({ steps, note }) {
  return (
    <div className="mt-3 rounded-2xl bg-white/80 p-3 text-jungle">
      <p className="text-sm font-bold text-earth">Langkah penyelesaian</p>
      <ol className="mt-1 space-y-1">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-lg">
            <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">{i + 1}</span>
            <MathText text={s} />
          </li>
        ))}
      </ol>
      {note && <p className="mt-2 rounded-lg bg-sun/40 px-2 py-1 text-sm font-semibold text-earth">{note}</p>}
    </div>
  );
}

export function Experiment({ code, title, desc, children }) {
  return (
    <section className="parchment rounded-3xl p-4 sm:p-6" aria-labelledby={`exp-${code}`}>
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f6b63] font-display text-xl font-extrabold text-white">{code}</span>
        <div>
          <h2 id={`exp-${code}`} className="font-display text-2xl font-extrabold text-jungle">
            {title}
          </h2>
          <p className="text-[15px] text-earth">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Tumpukan batu ajaib untuk visualisasi jumlah. */
export function StoneStack({ count, label }) {
  const max = 128;
  const shown = Math.min(count, max);
  return (
    <div className="mt-3">
      <div className="flex max-h-48 flex-wrap gap-1 overflow-hidden rounded-2xl bg-[#e9f0d8] p-2" aria-label={`${count} batu ajaib`}>
        {Array.from({ length: shown }, (_, i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full border border-[#8a826b] bg-gradient-to-br from-[#fff] to-[#c9c2ad]"
            style={{ animation: `pop .3s ${Math.min(i, 40) * 0.01}s both` }}
          />
        ))}
      </div>
      <p className="mt-1 text-sm text-earth">
        {label ?? "Batu ajaib"}: {count}
        {count > max && ` (yang digambar hanya ${max} batu agar tidak terlalu ramai)`}
      </p>
    </div>
  );
}
