import { Compass, Leaf } from "../scenery/Scenery";

/** Identitas pengembang aplikasi (satu sumber agar teks selalu sama di semua tempat). */
export const DEVELOPER = {
  nama: "Masya Bantani",
  prodi: "Program Studi Pendidikan Matematika",
  fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",
  universitas: "Universitas Sultan Ageng Tirtayasa",
  tahun: "2026",
};

/** Kartu perkamen kecil untuk halaman pembuka. */
export function DeveloperCard() {
  const d = DEVELOPER;
  return (
    <section aria-label="Identitas pengembang" className="relative overflow-hidden bg-[linear-gradient(180deg,#173F2A,#0f2a1c)] px-4 pb-10 pt-4">
      <div className="parchment relative mx-auto max-w-sm rounded-2xl px-6 py-5 text-center">
        <Leaf className="pointer-events-none absolute -left-1 top-3 w-6 -rotate-45 opacity-70" color="#62A66B" />
        <Leaf className="pointer-events-none absolute -right-1 top-3 w-6 rotate-45 opacity-70" color="#62A66B" />
        <div className="mx-auto mb-2 flex items-center justify-center gap-2" aria-hidden>
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-earth/50" />
          <Compass size={22} />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-earth/50" />
        </div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-earth">Dikembangkan oleh:</p>
        <p className="mt-1 font-display text-2xl font-extrabold leading-tight text-jungle">{d.nama}</p>
        <div className="mx-auto my-2 h-0.5 w-14 rounded-full bg-orange/70" aria-hidden />
        <p className="text-sm leading-relaxed text-[#4b4636]">
          {d.prodi}
          <br />
          {d.fakultas}
          <br />
          <span className="font-semibold text-jungle">{d.universitas}</span>
        </p>
        <p className="mt-1 font-display text-sm font-extrabold tracking-wider text-forest">{d.tahun}</p>
      </div>
    </section>
  );
}

/** Baris ringkas untuk footer. Setiap bagian membungkus utuh ke baris baru di layar kecil. */
export function DeveloperFooterLine({ className = "" }) {
  const d = DEVELOPER;
  const bagian = [d.prodi, d.fakultas, d.universitas, d.tahun];
  return (
    <p className={`text-xs leading-relaxed ${className}`}>
      <span className="inline-block">
        <span className="font-bold">Dikembangkan oleh:</span> {d.nama}
        <span className="mx-1.5 opacity-50" aria-hidden>
          ·
        </span>
      </span>
      {bagian.map((b, i) => (
        <span key={b} className="inline-block">
          {b}
          {i < bagian.length - 1 && (
            <span className="mx-1.5 opacity-50" aria-hidden>
              ·
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

/** Footer kecil untuk halaman di dalam aplikasi (Camp, Peta, materi, dll.). */
export function AppFooter() {
  return (
    <footer className="border-t-2 border-bark/60 bg-[#0f2a1c] px-4 py-3 text-center text-cream/70" aria-label="Identitas pengembang">
      <DeveloperFooterLine />
      <p className="mt-0.5 text-[11px] opacity-70">JEJAK SANG EKSPONEN — media pembelajaran sifat-sifat bilangan berpangkat</p>
    </footer>
  );
}
