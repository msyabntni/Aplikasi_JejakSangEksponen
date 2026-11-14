/**
 * Efek suara Jejak Sang Eksponen — memakai FILE AUDIO MILIK PENGGUNA (tidak ada suara buatan).
 *
 * Efek            File (URL pengguna)               Bagian yang diputar
 * benar           .../1794662801605-...mp3           0,12 s → selesai
 * salah           .../1794662829499-...mp3           0,15 s → selesai
 * lencana         .../1794662945511-...mp3           0,55 s → 9,74 s (frasa pembuka; file aslinya ±64 s)
 * klik/ketukan    .../1794663109835-...mp3           1,02 s → 1,20 s (klik pertama; file berisi 3 klik
 *                                                    dengan hening 1 s di awal)
 * File tidak diubah; hanya dipilih bagian yang diputar agar langsung berbunyi dan tidak bertumpuk.
 *
 * Aturan agar tidak bertumpuk:
 * - Hanya SATU efek suara berbunyi pada satu waktu.
 * - benar / salah / lencana menghentikan efek yang sedang berbunyi.
 * - klik tidak memotong benar / salah / lencana yang sedang berbunyi (klik dilewati).
 * - Bila satu klik langsung memicu benar/salah/lencana, hanya suara itu yang terdengar.
 * Musik latar (components/layout/BackgroundMusic.jsx) terpisah dan tidak disentuh di sini.
 */

/** Volume efek suara (60–75%), lebih keras daripada musik latar (18%). */
export const SFX_VOLUME = 0.7;

export const SFX_FILES = {
  correct: { src: "https://mp3tourl.com/audio/1794662801605-ce192545-cc76-4092-b143-3f5644b2d74b.mp3", start: 0.12, end: null, prio: 2 },
  wrong: { src: "https://mp3tourl.com/audio/1794662829499-43897551-516a-4dd5-a840-b694017d08be.mp3", start: 0.15, end: null, prio: 2 },
  badge: { src: "https://mp3tourl.com/audio/1794662945511-d49936df-757f-42fb-9717-6e857d461a86.mp3", start: 0.55, end: 9.74, prio: 3 },
  tap: { src: "https://pdftourl.net/audio/1794663109835-7b9e8038-4e5e-41b0-8474-089635da03b6.mp3", start: 1.02, end: 1.2, prio: 1 },
};

let enabled = true;
const els = {}; // satu elemen audio per efek (dipakai ulang)
let current = null; // { name, el }
let stopTimer = null;
let pendingTap = null;

export function setSoundEnabled(v) {
  enabled = v;
  if (!v) stopCurrent();
}

function el(name) {
  if (typeof window === "undefined") return null;
  if (!els[name]) {
    const a = new Audio();
    a.preload = "auto";
    a.src = SFX_FILES[name].src;
    a.volume = SFX_VOLUME;
    a.dataset.sfx = name;
    els[name] = a;
  }
  return els[name];
}

/** Memuat semua file efek lebih dulu agar langsung berbunyi saat dibutuhkan. */
export function preloadSounds() {
  for (const name of Object.keys(SFX_FILES)) el(name);
}

function stopCurrent() {
  clearTimeout(stopTimer);
  if (current && !current.el.paused) current.el.pause();
  current = null;
}

function start(name) {
  const cfg = SFX_FILES[name];
  const a = el(name);
  if (!a) return;
  stopCurrent();
  a.volume = SFX_VOLUME;
  try {
    a.currentTime = cfg.start;
  } catch {
    /* metadata belum siap: diputar dari awal */
  }
  current = { name, el: a };
  // batas durasi dihitung sejak suara BENAR-BENAR berbunyi (bukan sejak diminta),
  // agar potongan pendek (klik 0,18 s) tetap terdengar walau file masih dimuat
  a.onplaying =
    cfg.end != null
      ? () => {
          clearTimeout(stopTimer);
          const sisa = (cfg.end - a.currentTime) * 1000;
          stopTimer = setTimeout(() => {
            if (current && current.el === a) stopCurrent();
          }, Math.max(50, sisa));
        }
      : null;
  a.onended = () => {
    if (current && current.el === a) current = null;
  };
  const p = a.play();
  if (p && typeof p.catch === "function") p.catch(() => {}); // diblokir/gagal: diam saja, aplikasi tetap jalan
}

/**
 * Memutar efek suara.
 * Nama yang dipakai aplikasi: "correct", "wrong", "badge", "tap".
 * Nama lama ("page", "unlock", "reward") tidak lagi berbunyi karena tidak ada file dari pengguna;
 * aktivitas tersebut sudah diawali klik (tap) sehingga tidak perlu suara tambahan.
 */
export function play(name) {
  if (!enabled || typeof window === "undefined") return;
  if (name === "tap") {
    // tunda ke akhir event: bila klik yang sama memicu benar/salah/lencana, klik dibatalkan
    if (pendingTap) return;
    pendingTap = setTimeout(() => {
      pendingTap = null;
      if (!enabled) return; // suara baru saja dimatikan oleh klik ini
      if (current && !current.el.paused && SFX_FILES[current.name].prio > 1) return; // jangan potong benar/salah/lencana
      start("tap");
    }, 0);
    return;
  }
  if (!SFX_FILES[name]) return;
  if (pendingTap) {
    clearTimeout(pendingTap);
    pendingTap = null;
  }
  start(name);
}

/** Selector elemen yang dianggap "tombol" untuk suara klik. */
const TAP_SELECTOR = 'button, a[href], [role="button"], [role="radio"], [role="switch"], [role="tab"], [role="checkbox"], summary';

/** Pasang suara klik untuk SETIAP tombol/tautan di aplikasi (satu kali). Mengembalikan fungsi pelepas. */
export function installTapSounds() {
  if (typeof window === "undefined") return () => {};
  const onClick = (e) => {
    const t = e.target instanceof Element ? e.target.closest(TAP_SELECTOR) : null;
    if (!t || t.closest("[data-no-tap]") || t.hasAttribute("disabled") || t.getAttribute("aria-disabled") === "true") return;
    play("tap");
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
