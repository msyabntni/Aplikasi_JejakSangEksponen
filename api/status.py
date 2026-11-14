"""GET /api/status — cek kesehatan backend Python."""

import os
import platform
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _lib.data_soal import SOAL  # noqa: E402
from _lib.http_util import JsonHandler  # noqa: E402


def proses() -> tuple[int, dict]:
    return 200, {
        "status": "ok",
        "aplikasi": "Jejak Sang Eksponen",
        "backend": "python",
        "versi_python": platform.python_version(),
        "jumlah_soal": len(SOAL),
        "endpoint": ["/api/status", "/api/nilai", "/api/pangkat"],
    }


class handler(JsonHandler):  # noqa: N801 - nama wajib untuk Vercel
    def do_GET(self):  # noqa: N802
        status, body = proses()
        self.kirim(status, body)
