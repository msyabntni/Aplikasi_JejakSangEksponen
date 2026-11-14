# Deployment ke Vercel

1. Unggah proyek ke repositori GitHub, GitLab, atau Bitbucket. `.env.local` dan `node_modules` sudah diabaikan oleh `.gitignore`.
2. Di <https://vercel.com>, pilih **Add New → Project**, lalu impor repositorinya. Framework Next.js akan terdeteksi otomatis; tidak perlu mengubah perintah build.
3. **Environment Variables** (opsional, hanya untuk mode akun):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Jika keduanya dikosongkan, aplikasi berjalan dalam mode tamu.
4. Tekan **Deploy**.
5. Jika memakai Supabase, tambahkan domain Vercel (misalnya `https://nama-proyek.vercel.app/**`) ke **Supabase → Authentication → URL Configuration → Redirect URLs**, dan jadikan domain itu sebagai Site URL.

Catatan:

- Variabel `NEXT_PUBLIC_*` ikut dimasukkan saat build. Jika nilainya diubah, lakukan **Redeploy**.
- Semua halaman bersifat statis atau client-side, sehingga paket gratis (Hobby) Vercel sudah cukup.
