import Link from "next/link";
import Naru, { NARU_COLORS, type NaruPose } from "@/components/characters/Naru";
import Kaciro, { KACIRO_COLORS, type KaciroPose } from "@/components/characters/Kaciro";

export const metadata = { title: "Lembar Referensi Karakter — JEJAK SANG EKSPONEN" };

const NARU_POSES: [NaruPose, string][] = [
  ["idle", "Menyapa (memegang kompas)"],
  ["hang", "Bergelantungan"],
  ["swing", "Mengayun"],
  ["jump", "Melompat"],
  ["sit", "Duduk di dahan"],
  ["point", "Menunjuk peta"],
  ["peek", "Mengintip"],
  ["cheer", "Bersorak"],
];
const KACIRO_POSES: [KaciroPose, string][] = [
  ["idle", "Berdiri"],
  ["board", "Memegang papan rumus"],
  ["point", "Menunjuk angka berpangkat"],
  ["book", "Membaca buku"],
  ["think", "Berpikir"],
  ["tip", "Mengangkat satu jari (tips)"],
  ["map", "Memegang peta"],
  ["cheer", "Memberi semangat"],
];

function Swatches({ colors }: { colors: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(colors).map(([k, v]) => (
        <div key={k} className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-xs font-bold text-jungle">
          <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: v }} /> {k} <span className="font-mono opacity-60">{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function KarakterPage() {
  return (
    <div className="min-h-dvh bg-cream px-4 py-8 text-jungle">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-bold text-forest underline">← Beranda</Link>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Lembar Referensi Karakter</h1>
        <p className="mt-1 max-w-3xl">
          Acuan tunggal untuk dua maskot JEJAK SANG EKSPONEN. Semua halaman memakai komponen SVG yang sama, sehingga bentuk kepala, warna, aksesori, dan proporsi selalu konsisten.
        </p>

        <section className="mt-8 rounded-3xl bg-[#f9dfe3] p-5">
          <h2 className="font-display text-3xl font-extrabold text-[#8b3a4b]">NARU — Monyet Penjelajah</h2>
          <ul className="mt-2 list-disc pl-5 text-[15px]">
            <li>Monyet kecil cokelat; wajah krem berbentuk hati; telinga bulat; mata besar ekspresif.</li>
            <li>Topi penjelajah khaki dengan pita pink, rompi pink, syal coral-pink, tas punggung pink tua.</li>
            <li>Ekor panjang yang melengkung, bisa melilit dahan dan tanaman rambat.</li>
            <li>Proporsi: kepala besar (≈ 45% tinggi badan), badan bulat, tangan dan kaki tebal membulat.</li>
            <li>Kepribadian: ceria, pemberani, penasaran, sedikit jahil. Ciri khas: sering bergelantungan.</li>
          </ul>
          <div className="mt-3"><Swatches colors={NARU_COLORS} /></div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {NARU_POSES.map(([p, label]) => (
              <figure key={p} className="flex flex-col items-center rounded-2xl bg-white p-2">
                <Naru pose={p} width={130} animate={false} />
                <figcaption className="mt-1 text-center text-sm font-bold">{label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5">
            {(["neutral", "happy", "cheer", "worried", "wink"] as const).map((m) => (
              <figure key={m} className="flex flex-col items-center rounded-2xl bg-white/70 p-2">
                <Naru pose="peek" mood={m} width={90} animate={false} />
                <figcaption className="text-xs font-bold">ekspresi: {m}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-[#dcefd7] p-5">
          <h2 className="font-display text-3xl font-extrabold text-forest">KACIRO — Kancil Cerdas</h2>
          <ul className="mt-2 list-disc pl-5 text-[15px]">
            <li>Kancil cokelat muda, perut dan moncong krem, garis putih khas kancil di leher.</li>
            <li>Telinga runcing tegak; mata besar; kacamata bulat sebagai ciri utama kecerdasan.</li>
            <li>Rompi penjelajah hijau hutan, syal kuning, tas selempang cokelat; kaki ramping berkuku.</li>
            <li>Pakaian tidak menutupi bentuk tubuh kancil (telinga, leher, kaki, dan ekor tetap terlihat).</li>
            <li>Kepribadian: cerdas, sabar, teliti, ramah, suka menjelaskan.</li>
          </ul>
          <div className="mt-3"><Swatches colors={KACIRO_COLORS} /></div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {KACIRO_POSES.map(([p, label]) => (
              <figure key={p} className="flex flex-col items-center rounded-2xl bg-white p-2">
                <Kaciro pose={p} width={120} animate={false} />
                <figcaption className="mt-1 text-center text-sm font-bold">{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
