"""
Server backend Python untuk dijalankan di komputer sendiri (tanpa Vercel).

Menjalankan fungsi yang SAMA dengan yang dipakai di Vercel (folder api/):
  /api/status, /api/nilai, /api/pangkat

Pakai:
  python backend/dev_server.py            # port 5328
  python backend/dev_server.py 8000       # port lain

Next.js (npm run dev / npm start) meneruskan /api/* ke server ini
(lihat rewrites di next.config.mjs). Hanya pustaka standar Python, tanpa pip install.
"""

from __future__ import annotations

import importlib.util
import sys
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

API_DIR = Path(__file__).resolve().parent.parent / "api"
sys.path.insert(0, str(API_DIR))

from _lib.http_util import JsonHandler  # noqa: E402

ENDPOINT = {}
for berkas in sorted(API_DIR.glob("*.py")):
    spec = importlib.util.spec_from_file_location(f"api_{berkas.stem}", berkas)
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    ENDPOINT[f"/api/{berkas.stem}"] = modul.handler


class Router(JsonHandler):
    """Meneruskan permintaan ke handler fungsi Python yang sesuai."""

    def _teruskan(self, metode: str):
        path = urlparse(self.path).path.rstrip("/")
        h = ENDPOINT.get(path)
        if h is None:
            return self.kirim(404, {"error": f"Endpoint {path} tidak ditemukan.", "tersedia": sorted(ENDPOINT)})
        fungsi = getattr(h, f"do_{metode}", None)
        if fungsi is None:
            return self.kirim(405, {"error": f"Metode {metode} tidak didukung di {path}."})
        return fungsi(self)

    def do_GET(self):  # noqa: N802
        self._teruskan("GET")

    def do_POST(self):  # noqa: N802
        self._teruskan("POST")


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5328
    server = ThreadingHTTPServer(("127.0.0.1", port), Router)
    print(f"Backend Python Jejak Sang Eksponen berjalan di http://127.0.0.1:{port}")
    print("Endpoint:", ", ".join(sorted(ENDPOINT)))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBackend dihentikan.")


if __name__ == "__main__":
    main()
