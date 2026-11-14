# Panduan Supabase (Mode Akun)

Mode akun bersifat **opsional**. Tanpa Supabase, aplikasi tetap berjalan penuh dalam mode tamu.

## 1. Membuat proyek

1. Masuk ke <https://supabase.com> dan pilih **New project**.
2. Pilih region terdekat (misalnya *Southeast Asia (Singapore)*), lalu simpan password database di tempat aman.
3. Tunggu sampai proyek selesai dibuat.

## 2. Membuat tabel, kebijakan RLS, dan fungsi

1. Buka **SQL Editor**, lalu pilih **New query**.
2. Tempel seluruh isi `supabase/schema.sql`, lalu tekan **Run**.
3. Buat query baru, tempel isi `supabase/seed.sql`, lalu tekan **Run**. Langkah ini mengisi 7 wilayah, 6 game, 9 lencana, dan seluruh soal beserta kuncinya.

Kedua file aman dijalankan ulang (idempoten).

Yang dibuat oleh `schema.sql`:

| Tabel | Isi |
|---|---|
| `profiles` | Profil per akun (UUID dari Supabase Auth), dibuat otomatis oleh trigger saat registrasi |
| `regions`, `games`, `achievements`, `quizzes` | Data referensi |
| `quiz_questions` | Soal tanpa kunci (boleh dibaca pengguna yang login) |
| `quiz_answer_keys` | Kunci jawaban. **Tanpa policy**, sehingga tidak bisa dibaca klien |
| `user_stats` | XP, permata, level |
| `region_progress` | Bagian materi yang dibaca, skor misi terbaik, waktu selesai |
| `pretest_attempts`, `posttest_attempts` | Riwayat pretest dan posttest (terpisah, tidak pernah ditimpa) |
| `quiz_attempts` | Misi wilayah, latihan, Jungle Challenge |
| `game_attempts` | Hasil mini-game |
| `user_achievements` | Lencana |
| `activity_logs` | Riwayat aktivitas dan catatan hadiah. Ada indeks unik agar XP pertama hanya diberikan sekali |

Keamanan:

- RLS aktif di semua tabel. Siswa hanya bisa **membaca** baris miliknya (`user_id = auth.uid()`).
- Siswa tidak bisa menulis langsung ke tabel progres. Semua penulisan lewat fungsi `SECURITY DEFINER`:
  `submit_exam`, `submit_quiz`, `mark_section`, `complete_region`, `complete_activity`, `import_guest_progress`.
- Penilaian (`jse_grade`) dan pemberian XP (`jse_award`) berjalan di server. Kedua fungsi ini tidak bisa dipanggil langsung oleh klien.
- Dari profil, siswa hanya boleh mengubah kolom `nickname`, `kelas`, dan `avatar`.

## 3. Variabel lingkungan

Salin `.env.example` menjadi `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Kedua nilai ada di **Project Settings → API**. Gunakan **anon (public) key**, jangan service role key.

## 4. Pengaturan Auth

- **Authentication → Providers → Email**: aktif. Jika *Confirm email* menyala, siswa harus mengklik tautan verifikasi sebelum bisa login. Aplikasi akan menampilkan pesannya.
- **Authentication → URL Configuration**:
  - Site URL: alamat produksi, misalnya `https://jejak-sang-eksponen.vercel.app`
  - Redirect URLs: `http://localhost:3000/**` dan `https://domain-anda/**`
  Tanpa pengaturan ini, tautan verifikasi dan pemulihan password tidak akan bisa kembali ke aplikasi.
- Kebijakan password aplikasi: minimal 8 karakter, berisi huruf dan angka. Supabase menyimpan password dalam bentuk hash; aplikasi tidak pernah menyimpannya.

## 5. Migrasi database

- Perubahan skema: tambahkan perintah `alter table ...` di file baru `supabase/migrations/NNNN_keterangan.sql`, lalu jalankan di SQL Editor. Bisa juga memakai Supabase CLI (`supabase db push`).
- Perubahan soal atau materi di `src/data/*`: jalankan `npm run seed:generate`, lalu jalankan ulang `supabase/seed.sql`. Seed menghapus dan mengisi ulang soal per kuis, sehingga riwayat percobaan tetap aman.
- Uji skema secara lokal tanpa proyek Supabase: `node scripts/sql-test.mjs` (memakai PostgreSQL WASM).

## 6. Sinkronisasi progres tamu

Saat pengguna yang punya progres tamu login pertama kali, Camp menampilkan tawaran pemindahan progres. Fungsi `import_guest_progress`:

- hanya bisa dijalankan **sekali** per akun (`profiles.imported_guest`);
- menilai ulang jawaban pretest di server;
- memeriksa ulang syarat penyelesaian wilayah sebelum memberi XP;
- memberi XP lewat kunci aktivitas yang sama, sehingga **tidak ada XP atau lencana ganda**.

Keterbatasan: riwayat latihan dan Jungle Challenge dari mode tamu tidak ikut dipindahkan, karena hasilnya dinilai di browser dan tidak bisa diverifikasi server. Siswa perlu mengerjakannya lagi di akun.
