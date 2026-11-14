/** Efek suara sederhana dengan WebAudio (tanpa file aset). */
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
}

export type Sfx = "tap" | "correct" | "wrong" | "reward" | "unlock" | "page";

export function play(s: Sfx) {
  if (!enabled) return;
  try {
    switch (s) {
      case "tap":
        tone(660, 0, 0.08, "triangle", 0.05);
        break;
      case "page":
        tone(440, 0, 0.1, "sine", 0.04);
        tone(660, 0.06, 0.12, "sine", 0.04);
        break;
      case "correct":
        tone(660, 0, 0.12, "triangle");
        tone(880, 0.1, 0.18, "triangle");
        break;
      case "wrong":
        tone(330, 0, 0.15, "sine", 0.06);
        tone(294, 0.12, 0.2, "sine", 0.05);
        break;
      case "reward":
        [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, "triangle"));
        break;
      case "unlock":
        tone(392, 0, 0.12, "square", 0.04);
        tone(784, 0.1, 0.25, "triangle");
        break;
    }
  } catch {
    /* audio tidak tersedia */
  }
}
