"use client";

import { useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { MathText } from "../ui/MathText";
import { SceneArt } from "./SceneArt";
import { play } from "@/lib/sound";

const LETTERS = ["A", "B", "C", "D", "E"];
const PAIR_COLORS = ["#F39B57", "#62A66B", "#8ED6E8", "#e57f9a", "#e0b43c", "#9b7fd1"];

/** Mengacak urutan secara stabil berdasarkan id soal. */
function stableOrder(n, seed) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) | 0;
    const j = Math.abs(h) % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (idx.every((v, i) => v === i) && n > 1) idx.reverse();
  return idx;
}

export function QuestionView({ q, value, onChange, disabled, reveal }) {
  return (
    <div data-qid={q.id}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-jungle px-3 py-0.5 font-display text-xs font-bold tracking-wide text-sun">{q.label}</span>
      </div>
      {q.scene && <SceneArt scene={q.scene} className="mb-3" />}
      <p className="font-display text-xl font-bold leading-snug text-jungle sm:text-2xl">
        <MathText text={q.prompt} />
      </p>
      <div className="mt-4">
        {q.kind === "mcq" && <Mcq q={q} value={value} onChange={onChange} disabled={disabled} reveal={reveal} />}
        {q.kind === "tf" && <TrueFalse q={q} value={value} onChange={onChange} disabled={disabled} reveal={reveal} />}
        {q.kind === "short" && <Short q={q} value={value} onChange={onChange} disabled={disabled} />}
        {q.kind === "identify" && <Identify q={q} value={value} onChange={onChange} disabled={disabled} reveal={reveal} />}
        {q.kind === "findError" && <FindErr q={q} value={value} onChange={onChange} disabled={disabled} reveal={reveal} />}
        {q.kind === "match" && <Match q={q} value={value} onChange={onChange} disabled={disabled} reveal={reveal} />}
      </div>
    </div>
  );
}

function stateClass(selected, isKey, reveal) {
  if (reveal && isKey) return "border-leaf bg-[#e3f4dc] ring-4 ring-leaf/40";
  if (reveal && selected && !isKey) return "border-coral bg-[#fde6e2]";
  if (selected) return "border-orange bg-[#fff1e2] ring-4 ring-orange/30";
  return "border-[#d9c08f] bg-white hover:border-orange/60";
}

function Mcq({ q, value, onChange, disabled, reveal }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup">
      {q.options.map((o, i) => (
        <button
          key={i}
          role="radio"
          aria-checked={value === i}
          disabled={disabled}
          onClick={() => {
            play("tap");
            onChange(i);
          }}
          className={`btn-game flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left text-lg font-semibold text-jungle shadow-[0_3px_0_#d9c08f] ${stateClass(value === i, i === q.answer, reveal)}`}
        >
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display font-extrabold ${value === i ? "bg-orange text-white" : "bg-cream text-earth"}`}
          >
            {LETTERS[i]}
          </span>
          <MathText text={o} />
          {reveal && i === q.answer && <Check className="ml-auto text-forest" />}
          {reveal && value === i && i !== q.answer && <X className="ml-auto text-coral" />}
        </button>
      ))}
    </div>
  );
}

function TrueFalse({ q, value, onChange, disabled, reveal }) {
  return (
    <div>
      <div className="parchment mb-3 rounded-2xl px-4 py-3 text-center font-display text-2xl font-extrabold text-jungle">
        <MathText text={q.statement} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((b) => (
          <button
            key={String(b)}
            disabled={disabled}
            aria-pressed={value === b}
            onClick={() => {
              play("tap");
              onChange(b);
            }}
            className={`btn-game flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 font-display text-xl font-extrabold text-jungle shadow-[0_3px_0_#d9c08f] ${stateClass(value === b, b === q.answer, reveal)}`}
          >
            {b ? <Check /> : <X />} {b ? "BENAR" : "SALAH"}
          </button>
        ))}
      </div>
    </div>
  );
}

function Short({ q, value = "", onChange, disabled }) {
  const ref = useRef(null);
  const insert = (t) => {
    const el = ref.current;
    const sym = t === "−" ? "-" : t;
    if (!el) return onChange(value + sym);
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    const pad = sym === "×" ? ` ${sym} ` : sym;
    const next = value.slice(0, s) + pad + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + pad.length, s + pad.length);
    });
  };
  const preview = value.replace(/\^(-?\w+)/g, "^{$1}");
  return (
    <div>
      <input
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder ?? "Tulis jawabanmu"}
        inputMode={q.mode === "value" ? "decimal" : "text"}
        autoComplete="off"
        aria-label="Jawaban"
        className="w-full rounded-2xl border-2 border-[#d9c08f] bg-white px-4 py-3 font-display text-2xl font-bold text-jungle shadow-inner outline-none focus:border-orange"
      />
      {!disabled && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {(q.keypad ?? []).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => insert(k)}
              className="btn-game min-h-11 min-w-11 rounded-xl border-2 border-earth/30 bg-cream px-3 font-display text-xl font-extrabold text-earth"
              aria-label={k === "^" ? "Tanda pangkat" : `Sisipkan ${k}`}
            >
              {k === "^" ? "xⁿ" : k}
            </button>
          ))}
          {value && /\^/.test(value) && (
            <span className="ml-1 text-sm text-earth">
              Terbaca:{" "}
              <b className="font-display text-lg text-jungle">
                <MathText text={preview} />
              </b>
            </span>
          )}
        </div>
      )}
      {q.kind === "short" && q.keypad?.includes("^") && !disabled && (
        <p className="mt-1 text-xs text-earth/80">Tips: tulis pangkat dengan tanda ^, misalnya 2^5 untuk 2⁵.</p>
      )}
    </div>
  );
}

function Identify({ q, value, onChange, disabled, reveal }) {
  const part = (which, text, big) => {
    const sel = value === which;
    const key = q.target === which;
    return (
      <button
        disabled={disabled}
        onClick={() => {
          play("tap");
          onChange(which);
        }}
        aria-pressed={sel}
        aria-label={which === "base" ? `Bagian bawah: ${text}` : `Bagian atas kecil: ${text}`}
        className={`btn-game rounded-2xl border-4 px-3 font-display font-extrabold text-jungle ${big ? "py-1 text-7xl" : "-mt-10 py-0.5 text-4xl"} ${
          reveal && key
            ? "border-leaf bg-[#e3f4dc]"
            : reveal && sel
              ? "border-coral bg-[#fde6e2]"
              : sel
                ? "border-orange bg-[#fff1e2]"
                : "border-dashed border-earth/30 bg-white"
        }`}
      >
        {text}
      </button>
    );
  };
  return (
    <div className="flex justify-center py-4">
      <div className="flex items-start gap-1">
        {part("base", q.base, true)}
        {part("exp", q.exp, false)}
      </div>
    </div>
  );
}

function FindErr({ q, value, onChange, disabled, reveal }) {
  return (
    <ol className="space-y-2">
      {q.steps.map((s, i) => (
        <li key={i}>
          <button
            disabled={disabled}
            onClick={() => {
              play("tap");
              onChange(i);
            }}
            aria-pressed={value === i}
            className={`btn-game flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-lg font-semibold text-jungle ${stateClass(value === i, i === q.wrongStep, reveal)}`}
          >
            <span className="rounded-lg bg-jungle px-2 py-0.5 font-display text-sm text-sun">Langkah {i + 1}</span>
            <MathText text={s} />
          </button>
        </li>
      ))}
      <p className="text-sm text-earth">Ketuk langkah yang menurutmu keliru.</p>
    </ol>
  );
}

function Match({ q, value = {}, onChange, disabled, reveal }) {
  const order = useMemo(() => stableOrder(q.pairs.length, q.id), [q.id, q.pairs.length]);
  const [pickLeft, setPickLeft] = useState(null);
  const rightToLeft = Object.fromEntries(Object.entries(value).map(([l, r]) => [r, Number(l)]));
  const colorOf = (l) => PAIR_COLORS[Object.keys(value).map(Number).sort().indexOf(l) % PAIR_COLORS.length];

  const tapLeft = (l) => {
    if (disabled) return;
    play("tap");
    if (value[l] !== undefined) {
      const next = { ...value };
      delete next[l];
      onChange(next);
      setPickLeft(l);
      return;
    }
    setPickLeft(l === pickLeft ? null : l);
  };
  const tapRight = (r) => {
    if (disabled || pickLeft === null) return;
    play("tap");
    const next = { ...value };
    const prevLeft = rightToLeft[r];
    if (prevLeft !== undefined) delete next[prevLeft];
    next[pickLeft] = r;
    onChange(next);
    setPickLeft(null);
  };

  return (
    <div>
      <p className="mb-2 text-sm text-earth">Ketuk satu kotak di kiri, lalu pasangannya di kanan. Ketuk lagi untuk melepas.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {q.pairs.map(([l], i) => {
            const paired = value[i] !== undefined;
            const ok = reveal && value[i] === i;
            return (
              <button
                key={i}
                disabled={disabled}
                onClick={() => tapLeft(i)}
                className={`btn-game flex min-h-14 w-full items-center rounded-xl border-2 px-2.5 py-2 text-left font-semibold text-jungle ${
                  reveal
                    ? ok
                      ? "border-leaf bg-[#e3f4dc]"
                      : "border-coral bg-[#fde6e2]"
                    : pickLeft === i
                      ? "border-orange bg-[#fff1e2] ring-4 ring-orange/30"
                      : "border-[#d9c08f] bg-white"
                }`}
                style={paired && !reveal ? { borderColor: colorOf(i), boxShadow: `inset 6px 0 0 ${colorOf(i)}` } : undefined}
              >
                <MathText text={l} />
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {order.map((r) => {
            const l = rightToLeft[r];
            return (
              <button
                key={r}
                disabled={disabled}
                onClick={() => tapRight(r)}
                className={`btn-game flex min-h-14 w-full items-center rounded-xl border-2 px-2.5 py-2 text-left font-semibold text-jungle ${pickLeft !== null && l === undefined ? "border-orange/60 bg-[#fffaf2]" : "border-[#d9c08f] bg-white"}`}
                style={l !== undefined && !reveal ? { borderColor: colorOf(l), boxShadow: `inset -6px 0 0 ${colorOf(l)}` } : undefined}
              >
                <MathText text={q.pairs[r][1]} />
              </button>
            );
          })}
        </div>
      </div>
      {reveal && (
        <ul className="mt-3 space-y-1 text-sm text-jungle">
          {q.pairs.map(([l, r], i) => (
            <li key={i}>
              ✔ <MathText text={l} /> ↔ <MathText text={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
