"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatBase, formatRational, powExact, powSteps, powText as P, repeatedProduct, signNote, validateLabInput } from "@/lib/math/exponent";
import { MathText } from "../ui/MathText";
import { hitungPangkatDiServer } from "@/lib/api";
import { GameButton } from "../ui/GameButton";
import { Experiment, LabError, NumField, Steps, StoneStack } from "./LabParts";

const valueOf = (b, e) => {
  const r = powExact(b, e);
  return r.ok ? formatRational(r.value) : null;
};

/** Validasi basis + dua pangkat + pangkat hasil. */
function validateTriple(b, m, n, combine) {
  const v1 = validateLabInput(b, m);
  if (!v1.ok && v1.base === undefined) return { error: v1.error };
  const v2 = validateLabInput(b, n);
  if (!v2.ok && v2.base === undefined) return { error: v2.error };
  const base = Number(b.trim().replace("−", "-"));
  const em = Number(m.trim().replace("−", "-"));
  const en = Number(n.trim().replace("−", "-"));
  const res = combine(em, en);
  if (base === 0 && (em <= 0 || en <= 0 || res <= 0))
    return { error: "Dengan basis 0, pangkat nol atau negatif membuat bentuknya tidak terdefinisi (ada pembagian dengan nol). Coba basis lain." };
  if (Math.abs(res) > 30) return { error: "Pangkat hasilnya terlalu besar. Coba angka yang lebih kecil." };
  return { base, m: em, n: en, res };
}

// ───────────── A. POWER BUILDER ─────────────
export function PowerBuilder({ onTry }) {
  const [b, setB] = useState("2");
  const [e, setE] = useState("3");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  // Dihitung oleh backend Python (/api/pangkat); bila tidak terjangkau, dihitung di browser.
  const run = async () => {
    setBusy(true);
    const py = await hitungPangkatDiServer(b, e);
    setBusy(false);
    if (py) {
      if (!py.ok) {
        setErr(py.error);
        setOut(null);
        return;
      }
      setErr(null);
      setOut({ text: `${py.notasi} = ${py.hasil}`, steps: py.langkah, note: py.catatan, by: "python" });
      onTry();
      return;
    }
    const v = validateLabInput(b, e);
    if (!v.ok) {
      setErr(v.error);
      setOut(null);
      return;
    }
    setErr(null);
    setOut({ text: `${P(v.base, v.exp)} = ${valueOf(v.base, v.exp)}`, steps: powSteps(v.base, v.exp), note: signNote(v.base, v.exp), by: "browser" });
    onTry();
  };
  return (
    <Experiment code="A" title="Power Builder" desc="Pilih basis dan pangkat, lalu bangun bilangan berpangkatmu.">
      <div className="flex flex-wrap items-end gap-3">
        <NumField id="pb-b" label="Basis" value={b} onChange={setB} />
        <NumField id="pb-e" label="Pangkat" value={e} onChange={setE} color="#c46a2b" />
        <GameButton onClick={run} disabled={busy}>
          {busy ? "Menghitung..." : "Bangun!"}
        </GameButton>
      </div>
      {err && <LabError text={err} />}
      {out && (
        <>
          <p className="mt-4 font-display text-3xl font-extrabold text-jungle">
            <MathText text={out.text} />
          </p>
          <Steps steps={out.steps} note={out.note} />
          <p className="mt-2 text-xs font-bold text-earth" data-computed-by={out.by}>
            {out.by === "python" ? "Dihitung oleh server Python" : "Dihitung di browser (server Python tidak terjangkau)"}
          </p>
        </>
      )}
    </Experiment>
  );
}

// ───────────── B/C/D: operasi dua pangkat ─────────────
function TwoPower({ code, title, desc, op, onTry, defaults }) {
  const [b, setB] = useState(defaults[0]);
  const [m, setM] = useState(defaults[1]);
  const [n, setN] = useState(defaults[2]);
  const [shown, setShown] = useState(false);
  const combine = (x, y) => (op === "×" ? x + y : op === ":" ? x - y : x * y);
  const v = validateTriple(b, m, n, combine);
  const ok = !("error" in v);

  let lhs = "",
    mid = "",
    rule = "";
  if (ok) {
    const { base, m: em, n: en, res } = v;
    const neg = (k) => (k < 0 ? `(${k})`.replace("-", "−") : `${k}`);
    if (op === "×") {
      lhs = `${P(base, em)} × ${P(base, en)}`;
      mid = P(base, `${em}+${neg(en)}`);
      rule = "Basis sama dikalikan → pangkat dijumlahkan.";
    } else if (op === ":") {
      lhs = `${P(base, em)} : ${P(base, en)}`;
      mid = P(base, `${em}−${neg(en)}`);
      rule = "Basis sama dibagi → pangkat dikurangkan.";
    } else {
      lhs = `(${P(base, em)})^{${en < 0 ? "−" + -en : en}}`;
      mid = P(base, `${em}×${neg(en)}`);
      rule = "Pangkat dari pangkat → pangkat dikalikan.";
    }
    void res;
  }

  return (
    <Experiment code={code} title={title} desc={desc}>
      <div className="flex flex-wrap items-end gap-3">
        <NumField
          id={`${code}-b`}
          label="Basis (a)"
          value={b}
          onChange={(x) => {
            setB(x);
            setShown(false);
          }}
        />
        <NumField
          id={`${code}-m`}
          label={op === "pow" ? "Pangkat dalam (m)" : "Pangkat m"}
          value={m}
          onChange={(x) => {
            setM(x);
            setShown(false);
          }}
          color="#c46a2b"
        />
        <NumField
          id={`${code}-n`}
          label={op === "pow" ? "Pangkat luar (n)" : "Pangkat n"}
          value={n}
          onChange={(x) => {
            setN(x);
            setShown(false);
          }}
          color="#7b63c4"
        />
        <GameButton
          onClick={() => {
            if (ok) {
              setShown(true);
              onTry();
            } else setShown(true);
          }}
        >
          Simulasikan
        </GameButton>
      </div>
      {shown && "error" in v && <LabError text={v.error ?? ""} />}
      {shown && ok && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mt-4 font-display text-2xl font-extrabold text-jungle sm:text-3xl">
            <MathText text={`${lhs} = ${mid} = ${P(v.base, v.res)}`} />
          </p>
          <Steps
            steps={[
              rule,
              op === "pow" && v.n > 0
                ? `${lhs} = ${Array.from({ length: Math.min(v.n, 5) }, () => P(v.base, v.m)).join(" × ")}${v.n > 5 ? " × …" : ""}`
                : op === "×" && v.m > 0 && v.n > 0 && v.m + v.n <= 10
                  ? `= (${repeatedProduct(v.base, v.m)}) × (${repeatedProduct(v.base, v.n)})`
                  : op === ":" && v.m > 0 && v.n > 0 && v.m <= 8
                    ? `= (${repeatedProduct(v.base, v.m)}) / (${repeatedProduct(v.base, v.n)}), coret ${Math.min(v.m, v.n)} pasang faktor yang sama`
                    : `Pangkat hasil = ${v.res}`,
              ...powSteps(v.base, v.res),
            ]}
            note={signNote(v.base, v.res)}
          />
        </motion.div>
      )}
    </Experiment>
  );
}

export const ExponentMultiplier = ({ onTry }) => (
  <TwoPower
    code="B"
    title="Exponent Multiplier"
    desc="Simulasi perkalian bilangan berpangkat dengan basis sama."
    op="×"
    onTry={onTry}
    defaults={["2", "3", "2"]}
  />
);
export const ExponentDivider = ({ onTry }) => (
  <TwoPower
    code="C"
    title="Exponent Divider"
    desc="Simulasi pembagian bilangan berpangkat dengan basis sama."
    op=":"
    onTry={onTry}
    defaults={["3", "5", "2"]}
  />
);
export const PowerOfPower = ({ onTry }) => (
  <TwoPower code="D" title="Power of Power" desc="Simulasi pangkat dari bilangan berpangkat." op="pow" onTry={onTry} defaults={["2", "3", "2"]} />
);

// ───────────── E. ZERO AND NEGATIVE POWER ─────────────
export function ZeroNegative({ onTry }) {
  const [base, setBase] = useState(2);
  const [exp, setExp] = useState(2);
  const touched = useRef(false);
  const touch = () => {
    if (!touched.current) {
      touched.current = true;
      onTry();
    }
  };
  const rows = [3, 2, 1, 0, -1, -2, -3];
  return (
    <Experiment code="E" title="Zero and Negative Power" desc="Geser pangkat ke 0 dan ke bilangan negatif. Lihat nilainya berubah langsung.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-bold text-forest">
            Basis: {base}
            <input
              type="range"
              min={2}
              max={10}
              value={base}
              onChange={(e) => {
                setBase(Number(e.target.value));
                touch();
              }}
              className="mt-1 w-full accent-[#246B45]"
            />
          </label>
          <label className="mt-3 block text-sm font-bold text-[#c46a2b]">
            Pangkat: {exp < 0 ? `−${-exp}` : exp}
            <input
              type="range"
              min={-3}
              max={3}
              value={exp}
              onChange={(e) => {
                setExp(Number(e.target.value));
                touch();
              }}
              className="mt-1 w-full accent-[#F39B57]"
            />
          </label>
          <p className="mt-4 font-display text-4xl font-extrabold text-jungle">
            <MathText text={`${P(base, exp)} = ${valueOf(base, exp)}`} />
          </p>
          <Steps steps={powSteps(base, exp)} />
        </div>
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-sm font-bold text-earth">Pola: setiap pangkat turun 1, nilainya dibagi {base}</p>
          <ul className="mt-2 space-y-1">
            {rows.map((e) => (
              <li
                key={e}
                className={`flex justify-between rounded-lg px-3 py-1 font-display text-lg font-bold transition ${e === exp ? "scale-105 bg-orange text-white" : e === 0 ? "bg-sun/50 text-earth" : "text-jungle"}`}
              >
                <MathText text={P(base, e)} />
                <span>{valueOf(base, e)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Experiment>
  );
}

// ───────────── F. ANATOMI BILANGAN BERPANGKAT ─────────────
const ANATOMY = {
  base: { name: "Basis (bilangan pokok)", color: "#246B45", text: "Bilangan yang dikalikan berulang. Ditulis besar di bawah.", ex: "Pada 5^{3}, basisnya 5." },
  exp: {
    name: "Pangkat (eksponen)",
    color: "#F39B57",
    text: "Menunjukkan berapa kali basis dikalikan (banyaknya faktor). Ditulis kecil di kanan atas.",
    ex: "Pada 5^{3}, pangkatnya 3, artinya 5 × 5 × 5.",
  },
  result: { name: "Hasil perpangkatan", color: "#7b63c4", text: "Nilai setelah basis dikalikan sebanyak pangkatnya.", ex: "5^{3} = 125." },
};

export function Anatomy({ onTry }) {
  const [sel, setSel] = useState(null);
  const [b, e] = [4, 3];
  const pick = (k) => {
    setSel(k);
    onTry();
  };
  const ring = (k) => (sel === k ? { outline: `4px solid ${ANATOMY[k].color}`, background: `${ANATOMY[k].color}22` } : {});
  return (
    <Experiment code="F" title="Anatomi Bilangan Berpangkat" desc="Ketuk bagian bentuk aᵐ untuk melihat nama dan penjelasannya.">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="flex items-start font-display font-extrabold">
          <button
            onClick={() => pick("base")}
            className="rounded-2xl px-3 text-8xl transition hover:scale-105"
            style={{ color: ANATOMY.base.color, ...ring("base") }}
            aria-label="Bagian basis"
          >
            {b}
          </button>
          <button
            onClick={() => pick("exp")}
            className="-ml-1 rounded-xl px-2 text-5xl transition hover:scale-105"
            style={{ color: ANATOMY.exp.color, ...ring("exp") }}
            aria-label="Bagian pangkat"
          >
            {e}
          </button>
        </div>
        <span className="font-display text-5xl font-extrabold text-earth">=</span>
        <button
          onClick={() => pick("result")}
          className="rounded-2xl px-3 font-display text-7xl font-extrabold transition hover:scale-105"
          style={{ color: ANATOMY.result.color, ...ring("result") }}
          aria-label="Bagian hasil"
        >
          {Math.pow(b, e)}
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-xs font-bold">
        {Object.keys(ANATOMY).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: ANATOMY[k].color }} />
            {ANATOMY[k].name.split(" (")[0]}
          </span>
        ))}
      </div>
      {sel ? (
        <motion.div
          key={sel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-2xl border-l-8 bg-white/80 p-3 text-jungle"
          style={{ borderColor: ANATOMY[sel].color }}
        >
          <p className="font-display text-xl font-extrabold" style={{ color: ANATOMY[sel].color }}>
            {ANATOMY[sel].name}
          </p>
          <p>{ANATOMY[sel].text}</p>
          <p className="mt-1 text-sm text-earth">
            Contoh: <MathText text={ANATOMY[sel].ex} />
          </p>
          {sel === "exp" && (
            <p className="mt-1 text-sm">
              Di sini: {repeatedProduct(b, e)} = {Math.pow(b, e)}
            </p>
          )}
        </motion.div>
      ) : (
        <p className="mt-3 text-center text-earth">Ketuk angka besar, angka kecil, atau hasilnya.</p>
      )}
    </Experiment>
  );
}

// ───────────── G. PENGATUR SLIDER ─────────────
export function SliderLab({ onTry }) {
  const [b, setB] = useState(2);
  const [e, setE] = useState(3);
  const touched = useRef(false);
  const touch = () => {
    if (!touched.current) {
      touched.current = true;
      onTry();
    }
  };
  const r = powExact(b, e);
  const n = r.ok ? Number(r.value.num) : 0;
  return (
    <Experiment code="G" title="Pengatur Slider" desc="Geser basis dan pangkat. Bentuk perkalian berulang, hasil, dan tumpukan batu ajaib berubah otomatis.">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-forest">
          Basis: {formatBase(b)}
          <input
            type="range"
            min={-5}
            max={10}
            value={b}
            onChange={(x) => {
              setB(Number(x.target.value));
              touch();
            }}
            className="mt-1 w-full accent-[#246B45]"
            aria-label="Basis"
          />
        </label>
        <label className="block text-sm font-bold text-[#c46a2b]">
          Pangkat: {e}
          <input
            type="range"
            min={0}
            max={6}
            value={e}
            onChange={(x) => {
              setE(Number(x.target.value));
              touch();
            }}
            className="mt-1 w-full accent-[#F39B57]"
            aria-label="Pangkat"
          />
        </label>
      </div>
      {b === 0 && e === 0 ? (
        <LabError text="0⁰ tidak terdefinisi. Geser basis atau pangkatnya." />
      ) : (
        <>
          <p className="mt-3 text-sm font-bold text-earth">
            Rumus: <MathText text={e === 0 ? "a^{0} = 1 (a ≠ 0)" : "a^{n} = a × a × … × a (n faktor)"} />
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-jungle">
            <MathText text={`${P(b, e)} = ${e === 0 ? "1" : `${repeatedProduct(b, e)} = ${r.ok ? formatRational(r.value) : "?"}`}`} />
          </p>
          {signNote(b, e) && <p className="mt-1 text-sm font-semibold text-earth">{signNote(b, e)}</p>}
          {n >= 0 ? (
            <StoneStack count={n} />
          ) : (
            <p className="mt-3 rounded-xl bg-white/70 p-2 text-sm text-earth">
              Hasil negatif tidak bisa digambar sebagai tumpukan batu. Nilainya {formatRational(r.ok ? r.value : { num: 0n, den: 1n })}.
            </p>
          )}
        </>
      )}
    </Experiment>
  );
}

// ───────────── H. SIMULASI ANIMASI PERKALIAN BERULANG ─────────────
export function RepeatAnimation({ onTry }) {
  const [b, setB] = useState("3");
  const [e, setE] = useState("4");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState(null);
  const cfg = useRef(null);

  useEffect(() => {
    if (!playing || !cfg.current) return;
    if (step >= cfg.current.exp) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [playing, step]);

  const start = () => {
    const v = validateLabInput(b, e);
    if (!v.ok) return setErr(v.error);
    if (v.exp < 1 || v.exp > 8) return setErr("Untuk animasi, gunakan pangkat 1 sampai 8.");
    setErr(null);
    cfg.current = { base: v.base, exp: v.exp };
    setStep(1);
    setPlaying(true);
    onTry();
  };

  const c = cfg.current;
  return (
    <Experiment
      code="H"
      title="Simulasi Animasi Perkalian Berulang"
      desc="Lihat proses perkalian langkah demi langkah. Gunakan tombol mulai, jeda, dan ulangi."
    >
      <div className="flex flex-wrap items-end gap-3">
        <NumField
          id="an-b"
          label="Basis"
          value={b}
          onChange={(x) => {
            setB(x);
            setPlaying(false);
            setStep(0);
            cfg.current = null;
          }}
        />
        <NumField
          id="an-e"
          label="Pangkat (1–8)"
          value={e}
          onChange={(x) => {
            setE(x);
            setPlaying(false);
            setStep(0);
            cfg.current = null;
          }}
          color="#c46a2b"
        />
        <div className="flex gap-2">
          {!c || step === 0 ? (
            <GameButton onClick={start} icon={<Play size={18} />}>
              Mulai
            </GameButton>
          ) : playing ? (
            <GameButton variant="wood" onClick={() => setPlaying(false)} icon={<Pause size={18} />}>
              Jeda
            </GameButton>
          ) : step < c.exp ? (
            <GameButton onClick={() => setPlaying(true)} icon={<Play size={18} />}>
              Lanjut
            </GameButton>
          ) : null}
          {c && step > 0 && (
            <GameButton
              variant="cream"
              onClick={() => {
                setStep(1);
                setPlaying(true);
              }}
              icon={<RotateCcw size={18} />}
            >
              Ulangi
            </GameButton>
          )}
        </div>
      </div>
      {err && <LabError text={err} />}
      {c && step > 0 && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: step }, (_, k) => {
            const n = k + 1;
            return (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 font-display text-xl font-bold ${n === step ? "bg-orange/20 text-jungle" : "bg-white/70 text-jungle/70"}`}
              >
                <span className="rounded-lg bg-jungle px-2 text-sm text-sun">Langkah {n}</span>
                <MathText text={`${P(c.base, n)} = ${repeatedProduct(c.base, n)} = ${valueOf(c.base, n)}`} />
              </motion.div>
            );
          })}
          {step >= c.exp && (
            <p className="rounded-xl bg-[#e3f4dc] px-3 py-2 font-display text-xl font-extrabold text-forest">
              Selesai! <MathText text={`${P(c.base, c.exp)} = ${valueOf(c.base, c.exp)}`} />
            </p>
          )}
        </div>
      )}
    </Experiment>
  );
}
