# Panduan Pengujian

## Otomatis

```bash
npm run lint                 # TypeScript (tsc --noEmit)
npm test                     # unit test Vitest
npm run build                # build produksi
npm run test:sql             # skema SQL, RLS, dan RPC di PostgreSQL WASM (PGlite)

# uji alur lengkap di browser (Playwright)
npm run build && npx next start -p 3123      # terminal 1
npm run test:e2e                              # terminal 2: alur lengkap
npm run test:games                            # terminal 2: memainkan 6 mini-game sampai hasil
npm run test:journey                          # terminal 2: perjalanan penuh 7 wilayah + challenge + posttest
# Windows tanpa Chromium Playwright: pakai Microsoft Edge
#   PowerShell:  $env:E2E_CHANNEL="msedge"; npm run test:e2e
```

> Windows: jalankan `npm test` dari path dengan huruf drive kapital (`C:\...`). Jika path diawali `c:\`, Vitest bisa memuat dua salinan modul dan gagal dengan pesan *"Cannot read properties of undefined (reading 'config')"*.

### Cakupan unit test (`src/lib/core.test.ts`)

- Perhitungan pangkat exact: positif, nol, negatif (sebagai pecahan), basis negatif, serta 0⁰ dan 0⁻ⁿ yang tidak terdefinisi.
- Validasi input Laboratorium: kosong, bukan angka, desimal, dan batas nilai.
- Penilaian isian pretest no. 9 dan 10: variasi penulisan setara diterima, nilai yang berbeda ditolak.
- Kunci pretest sesuai spesifikasi; posttest sebanding dengan pretest (indikator dan jenis soal sama).
- **Integritas seluruh bank soal**: id unik, setiap kunci dinilai benar, opsi pilihan ganda unik, ada pembahasan, dan nilai numerik benar.
- Kode Mystery Chest sesuai petunjuknya; setiap teka-teki Exponent Puzzle punya solusi.
- Ambang level; XP idempoten (penuh sekali, ulangan maksimal sekali per hari).
- Migrasi localStorage v1 ke v2 serta penanganan data rusak atau kosong.

### Cakupan uji perjalanan penuh (`scripts/journey-e2e.mts`, 38 pemeriksaan)

Semua dijawab lewat UI memakai kunci dari data aplikasi: pretest (2 soal sengaja dikosongkan → 80) → misi Wilayah 01–07 dijawab benar dan setiap wilayah diselesaikan (+100 XP) → Jungle Challenge level 1–3 ditaklukkan → posttest 100 (+20) → tabel perkembangan → total XP 1300 dan Level 4 → 7 lencana → XP tetap setelah reload → halaman Hasil Belajar (nilai misi 7 wilayah, identitas, challenge) → jawaban tersimpan (misi 7×5, challenge 3×6, pretest, posttest) → riwayat tercatat → Keluar/Ganti Penjelajah → siswa kedua masuk (nama + kelas baru, progres terpisah) → siswa pertama masuk kembali tanpa password (progres utuh) → pilih siswa dari daftar perangkat → tidak ada error JavaScript.

### Cakupan uji E2E (`scripts/e2e.mjs`)

Landing → validasi nama → guard (camp tanpa identitas, peta sebelum pretest) → pretest (peringatan soal kosong, kumpulkan, skor) → Camp → Peta (wilayah 02 terkunci) → Wilayah 01 lengkap termasuk misi → XP 100 dan tidak bertambah saat refresh → lencana → Wilayah 02 terbuka → Lab (0⁰, pecahan, desimal, anatomi, animasi) → latihan → mini-game → posttest → grafik perkembangan → lencana Legenda → tidak ada scroll horizontal di 360px, 768px, dan 1280px → tidak ada error konsol.

## Daftar periksa manual

**Umum**
- [ ] Semua tombol berfungsi; tidak ada halaman kosong; tombol suara dan animasi bekerja.
- [ ] "Kurangi gerakan" di sistem operasi menghentikan animasi.

**Pretest**
- [ ] Materi tidak bisa dibuka sebelum pretest; tidak ada XP dari pretest.
- [ ] Jawaban tetap tersimpan setelah refresh di tengah pengerjaan.
- [ ] Setelah dikumpulkan, jawaban terkunci; "Mulai Perjalanan Baru" membuat percobaan baru tanpa menghapus riwayat.

**Materi**
- [ ] Ketujuh wilayah terbuka berurutan dan bisa diulang.
- [ ] Tombol "Wilayah berikutnya" dan "Kembali ke Peta" berfungsi.

**Mini-game**
- [ ] Keenam game bisa dimainkan sampai halaman hasil, bisa dimainkan lagi, dan XP menang pertama hanya sekali.

**Mode akun** (setelah Supabase dikonfigurasi)
- [ ] Registrasi: kolom kosong, email tidak valid, username sudah dipakai, password lemah, konfirmasi tidak sama.
- [ ] Login benar dan login dengan password salah.
- [ ] Lupa password → email → reset password.
- [ ] Logout lalu login lagi: XP, lencana, dan progres tetap sama.
- [ ] Halaman `/camp` tanpa login diarahkan ke beranda; login dengan `?next=` kembali ke halaman tujuan.
- [ ] Impor progres tamu hanya ditawarkan satu kali.
- [ ] Akun A tidak bisa melihat data akun B.
