/**
 * Konfigurasi Next.js (frontend JavaScript).
 *
 * Backend Python ada di folder api/ (fungsi serverless Vercel).
 * - Di Vercel: /api/* otomatis ditangani fungsi Python.
 * - Di komputer sendiri: /api/* diteruskan ke server Python lokal
 *   (python backend/dev_server.py, port 5328). Jika server Python tidak berjalan,
 *   aplikasi tetap berfungsi karena penilaian punya cadangan di browser.
 */
const PY_DEV = process.env.PYTHON_API_URL || "http://127.0.0.1:5328";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.VERCEL) return [];
    return [{ source: "/api/:path*", destination: `${PY_DEV}/api/:path*` }];
  },
};

export default nextConfig;
