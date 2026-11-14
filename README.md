# JEJAK SANG EKSPONEN

**Ikuti Jejaknya, Taklukkan Kekuatan Pangkat!**

JEJAK SANG EKSPONEN adalah media pembelajaran matematika berbasis web untuk siswa SMP kelas VIII dengan materi **sifat-sifat bilangan berpangkat**. Siswa belajar seperti sedang bermain petualangan di hutan tropis ajaib bersama dua maskot:

- **Naru**, monyet penjelajah cokelat dengan aksen pink. Ia memandu perjalanan dan sering muncul bergelantungan.
- **Kaciro**, kancil cerdas berkacamata dengan rompi penjelajah hijau. Ia menjelaskan materi, rumus, dan pembahasan.

## Fitur utama

| Fitur | Keterangan |
|---|---|
| Landing page | Hero hutan beranimasi, perkenalan maskot, tentang, fitur unggulan, pratinjau peta, daftar materi, cara bermain |
| Masuk penjelajah | Nama + kelas wajib, tanpa password. Siswa yang sama melanjutkan progresnya; siswa lain di perangkat yang sama punya progres terpisah |
| Pretest wajib | 10 soal (8 pilihan ganda, 2 isian) sebelum materi apa pun terbuka. Tanpa XP. Hasil disimpan terpisah |
| Camp Penjelajah | Beranda: sapaan, level/XP, progres, misi berikutnya, rekomendasi dari hasil pretest, aktivitas terakhir, lencana, pintasan |
| Peta Petualangan | Peta SVG interaktif berisi 7 wilayah di satu jalur hutan, dengan status terkunci, baru, berlangsung, dan selesai |
| 7 wilayah materi | Setiap wilayah punya 7 bagian: Pembuka, Konsep (dengan simulasi), Rumus, Contoh, Waspada!, Misi, Rangkuman |
| Laboratorium | 8 eksperimen: Power Builder, Multiplier, Divider, Power of Power, Zero & Negative, Anatomi, Slider, Animasi (mulai/jeda/ulangi) |
| Latihan | Bank berisi 118 soal (total 173 soal termasuk pretest, posttest, dan misi) dalam 3 tingkat dan 7 jenis soal, diacak per sesi. Jumlah soal bisa 5, 10, atau 15 |
| 6 mini-game | Power Match, Jungle Bridge, Exponent Puzzle, Mystery Chest, Wrong or Right?, Rescue Naru |
| Jungle Challenge | 3 level berurutan, timer opsional, bantuan Kaciro, pembahasan setelah dikirim |
| Posttest | Posttest paralel dengan pretest, lengkap dengan pembahasan |
| Hasil Belajar (rapor) | Identitas, nilai pretest/posttest dan selisihnya, grafik/tabel per indikator, nilai misi tiap wilayah, latihan, Jungle Challenge, mini-game, lencana, serta tombol cetak/simpan PDF |
| Musik latar | MP3 milik pengguna diputar dari URL eksternal (`src/components/layout/BackgroundMusic.jsx`). Otomatis diputar saat website dibuka; jika autoplay diblokir browser, muncul tombol **Putar musik latar** (musik juga mulai pada sentuhan pertama). Volume awal 18%. Tombol musik di header berisi ON/OFF dan pengatur volume (tersimpan). Musik tidak terputus saat pindah halaman |
| Efek suara | File MP3 milik pengguna (`src/lib/sound.js`): **jawaban benar**, **jawaban salah**, **lencana**, dan **klik setiap tombol**. Volume 70% (lebih keras dari musik latar 18%). Hanya satu efek berbunyi pada satu waktu: benar/salah/lencana menghentikan efek sebelumnya, klik tidak memotong suara benar/salah/lencana. Bagian file yang diputar: klik = klik pertama (1,02–1,20 s), lencana = frasa pembuka (0,55–9,74 s). Tombol speaker di header mematikan efek suara tanpa memengaruhi musik |
| Gamifikasi | XP idempoten, 7 level, permata, 9 lencana, notifikasi hadiah dan naik level |
| Profil & riwayat | Ubah nama panggilan, kelas, dan avatar; riwayat aktivitas yang bisa difilter |
| Mode tamu | Berjalan penuh tanpa login. Data tersimpan di localStorage dengan versi dan migrasi |
| Mode akun (opsional) | Supabase Auth, PostgreSQL, RLS, serta penilaian dan XP di server |

## Teknologi

| Bagian | Bahasa & teknologi |
|---|---|
| **Frontend** | **JavaScript** (`.js` / `.jsx`): Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Lucide React, Recharts, SVG |
| **Backend** | **Python** (`api/*.py`, hanya pustaka standar): penilaian jawaban (`/api/nilai`), perhitungan pangkat Laboratorium (`/api/pangkat`), status (`/api/status`). Di Vercel berjalan sebagai fungsi serverless Python; di komputer sendiri lewat `backend/dev_server.py` |
| Penyimpanan | localStorage (mode lokal); Supabase Auth + PostgreSQL + RLS (mode akun, opsional) |
| Pengujian | Vitest (JS), unittest (Python), Playwright (browser), PGlite (SQL) |

**Alur penilaian:** jawaban siswa dikirim ke backend Python `/api/nilai`. Hasilnya ditandai *"Dinilai oleh server Python"*. Jika server Python tidak terjangkau (offline atau belum dijalankan), aplikasi tetap berjalan dengan penilaian cadangan di browser yang logikanya identik. Kesamaannya dibuktikan uji kesetaraan di `tests/test_backend.py`: 1.769 variasi jawaban, 228 perhitungan pangkat, dan 225 validasi input harus memberi hasil yang persis sama.

## Menjalankan secara lokal

**Cara tercepat (Windows, tanpa instal Node.js ke sistem):** klik dua kali **`jalankan.cmd`**. File ini memakai Node.js portable di `%LOCALAPPDATA%
ode-portable
ode-v26.13.1-win-x64`, menginstal dependency dan build jika belum ada, lalu membuka <http://localhost:3000>. Untuk mode pengembangan, pakai `jalankan-dev.cmd`.

Prasyarat cara manual: **Node.js 20 atau lebih baru** (diuji dengan Node 26.13.1) dan **Python 3.9 atau lebih baru** (diuji dengan Python 3.14) untuk backend. Backend tidak memerlukan `pip install`.

```bash
python backend/dev_server.py   # terminal 1: backend Python → http://127.0.0.1:5328/api/status
npm run dev                    # terminal 2: frontend → http://localhost:3000 (/api/* diteruskan ke Python)
```

```bash
npm install          # instal dependency
npm run dev          # mode pengembangan → http://localhost:3000
```

Mode produksi:

```bash
npm run build
npm start            # http://localhost:3000
```

Tanpa konfigurasi apa pun, aplikasi berjalan dalam **mode tamu**. Tombol akun tampil nonaktif dengan keterangan "Mode akun belum dikonfigurasi".

## Mode tamu vs mode akun

| | Mode tamu | Mode akun (Supabase) |
|---|---|---|
| Masuk | **Nama + kelas, tanpa password.** Nama + kelas yang sama melanjutkan progres; satu perangkat bisa dipakai bergantian (daftar penjelajah + tombol Keluar/Ganti Penjelajah) | Email + password (registrasi, login, lupa password) |
| Penyimpanan | `localStorage` kunci `jejak-sang-eksponen` (versi 2, ada migrasi dari v1, data rusak dipulihkan). Yang disimpan: identitas (nama, kelas, avatar), jawaban & nilai pretest/posttest/misi/latihan/challenge, hasil mini-game, progres wilayah, XP, lencana, dan riwayat | Tabel PostgreSQL per pengguna, dengan cache lokal |
| Penilaian & XP | Dihitung di browser. XP tetap idempoten karena setiap aktivitas punya penanda unik | Dihitung fungsi SQL `SECURITY DEFINER`. Frontend tidak pernah mengirim angka XP |
| Kunci jawaban | Ikut dalam kode aplikasi, karena penilaian harus bisa berjalan offline | Disimpan di `quiz_answer_keys` yang tidak bisa dibaca klien |
| Perjalanan baru | Bisa, riwayat lama tetap tersimpan | Satu perjalanan per akun |
| Pindah perangkat | Tidak | Ya. Progres tamu bisa dipindahkan ke akun **satu kali** |

## Mengaktifkan mode akun (Supabase)

Panduan lengkap ada di [docs/SUPABASE.md](docs/SUPABASE.md). Ringkasnya:

1. Buat proyek di <https://supabase.com>.
2. Buka **SQL Editor**, lalu jalankan [supabase/schema.sql](supabase/schema.sql) dan setelah itu [supabase/seed.sql](supabase/seed.sql).
3. Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Di Authentication → URL Configuration, tambahkan `http://localhost:3000/**` (dan domain produksi) ke Redirect URLs.
5. Jalankan ulang `npm run dev`.

> Jangan pernah menaruh **service role key** di frontend atau di variabel `NEXT_PUBLIC_*`.

## Struktur folder

```
api/                         BACKEND PYTHON (fungsi serverless Vercel)
  nilai.py                   POST /api/nilai: menilai jawaban (pretest, posttest, misi, latihan, challenge)
  pangkat.py                 GET/POST /api/pangkat: perhitungan pangkat eksak untuk Laboratorium
  status.py                  GET /api/status: cek kesehatan backend
  _lib/penilaian.py          logika penilaian (normalisasi isian, pecahan setara, 6 jenis soal)
  _lib/pangkat.py            perhitungan pangkat eksak (fractions), validasi input, langkah penyelesaian
  _lib/data_soal.py          kunci 173 soal (dibuat otomatis: npm run py:data)
backend/dev_server.py        server lokal yang menjalankan fungsi api/ yang sama (port 5328)
tests/test_backend.py        uji Python + uji kesetaraan JavaScript ↔ Python
src/                         FRONTEND JAVASCRIPT
  app/
    page.jsx                 Landing page
    mulai/                   Identitas penjelajah
    karakter/                Lembar referensi karakter Naru & Kaciro
    auth/                    login, daftar, lupa-password, reset-password
    (jelajah)/               Halaman yang butuh identitas (dilindungi AppShell)
      pretest/  pretest/hasil/  camp/  peta/  wilayah/[id]/  lab/  latihan/
      game/  game/[slug]/  challenge/  posttest/  posttest/hasil/
      perkembangan/  profil/  riwayat/
  components/
    characters/              Naru.jsx, Kaciro.jsx (SVG multi-pose)
    scenery/                 Latar hutan berlapis, sulur, monstera, kupu-kupu, peti, permata
    map/                     AdventureMap (peta interaktif)
    region/                  RegionScene, ConceptVisual, RegionMission
    quiz/                    QuestionView (6 jenis soal), ExamRunner, PracticeRunner, ReviewList
    lab/                     8 eksperimen
    games/                   GameShell + 6 mini-game
    layout/                  AppShell (penjaga akses + navigasi), toast hadiah, loading
    ui/                      Tombol, panel, modal, MathText (notasi pangkat), lencana, avatar
    auth/                    Kerangka & field formulir akun
  data/                      Materi wilayah, pretest/posttest, bank soal, game, challenge
  lib/
    math/exponent.js         Perhitungan pangkat exact (BigInt + pecahan), validasi Lab
    grading.js               Normalisasi & penilaian jawaban
    gamification.js          XP, level, lencana
    unlock.js                Aturan buka wilayah, challenge, posttest
    storage/                 localStorage berversi + migrasi
    store/ProgressProvider   State global (adaptor tamu/akun)
    supabase/                Klien & adaptor RPC
supabase/
  schema.sql                 Tabel, RLS, fungsi penilaian & XP
  seed.sql                   Dibuat otomatis dari data soal JavaScript (npm run seed:generate)
scripts/                     Generator seed, uji E2E, uji SQL
docs/                        Panduan Supabase, pengujian, deployment
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build dan jalankan versi produksi |
| `npm run py:dev` | Menjalankan backend Python lokal (port 5328) |
| `npm run py:data` | Membuat ulang kunci soal untuk Python + fixture uji kesetaraan (setelah soal diubah) |
| `npm test` | Unit test JavaScript (Vitest) |
| `npm run test:py` | Uji backend Python (unittest), termasuk uji kesetaraan dengan JavaScript |
| `npm run test:e2e` | Uji alur lengkap di browser (Playwright). Server harus berjalan di port 3123 |
| `npm run test:journey` | Memainkan seluruh perjalanan lewat UI: pretest, 7 wilayah, 3 level challenge, posttest, XP, dan lencana |
| `npm run test:maskot` | Audit maskot: ukuran Naru & Kaciro di setiap halaman dan memastikan tidak menutupi teks, tombol, soal, rumus, atau penanda peta (5 lebar layar) |
| `npm run test:sfx` | Uji efek suara: file pengguna, volume, benar/salah/lencana/klik, tidak bertumpuk, tombol OFF, musik latar tetap |
| `npm run test:music` | Uji musik latar: autoplay, autoplay diblokir, volume awal, ON/OFF, volume, berpindah halaman |
| `npm run test:games` | Memainkan keenam mini-game sampai halaman hasil (Playwright) |
| `npm run test:sql` | Uji skema SQL, RLS, dan fungsi RPC di PostgreSQL WASM (tanpa proyek Supabase) |
| `npm run seed:generate` | Membuat ulang `supabase/seed.sql` setelah soal diubah |

Panduan lain:

- [docs/PENGUJIAN.md](docs/PENGUJIAN.md): cara menguji dan daftar periksa manual
- [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md): deployment ke Vercel
- [docs/SUPABASE.md](docs/SUPABASE.md): konfigurasi dan migrasi database

## Aturan pembelajaran yang dipakai

- **Pretest dulu.** Peta, materi, lab, latihan, dan game terkunci sampai pretest dikumpulkan.
- **Wilayah selesai** jika semua bagian materi sudah dibuka, misi wilayah mendapat skor ≥ 60, dan tombol *Selesaikan Wilayah* ditekan.
- Wilayah berikutnya terbuka setelah wilayah sebelumnya selesai. Treasure Temple terbuka setelah Wilayah 01–06 selesai.
- **Jungle Challenge** terbuka setelah 7 wilayah selesai. Levelnya berurutan, dan lulus jika skor ≥ 70.
- **Posttest** terbuka setelah 7 wilayah dan 3 level challenge selesai.
- **XP**: wilayah 100, latihan 60, game 80, eksperimen lab 10 (bonus 50 jika semua dicoba), challenge 100/150/200, posttest 150. Mengulang aktivitas hanya memberi 5 XP, maksimal sekali per hari. Refresh tidak menambah XP.
- **Level**: 1 = 0 XP, 2 = 200, 3 = 500, 4 = 900, 5 = 1.400, 6 = 2.000, 7 = 2.700.
