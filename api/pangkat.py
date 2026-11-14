"""
GET  /api/pangkat?basis=2&pangkat=-3
POST /api/pangkat   {"basis": "2", "pangkat": "-3"}

Menghitung bilangan berpangkat secara eksak untuk Laboratorium Sang Eksponen.
Respons berhasil:
  {"ok": true, "basis": 2, "pangkat": -3, "notasi": "2^{−3}", "hasil": "1/8",
   "langkah": [...], "catatan": null, "dihitung_oleh": "python"}
Respons input tidak valid (tetap HTTP 200 agar pesan bisa ditampilkan):
  {"ok": false, "error": "0⁰ tidak terdefinisi. ...", "dihitung_oleh": "python"}
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _lib.http_util import JsonHandler  # noqa: E402
from _lib.pangkat import hitung_lab  # noqa: E402


def proses(data) -> tuple[int, dict]:
    if not isinstance(data, dict) or "basis" not in data or "pangkat" not in data:
        return 400, {"error": "Kirim 'basis' dan 'pangkat'."}
    hasil = hitung_lab(str(data["basis"]), str(data["pangkat"]))
    hasil["dihitung_oleh"] = "python"
    return 200, hasil


class handler(JsonHandler):  # noqa: N801 - nama wajib untuk Vercel
    def do_GET(self):  # noqa: N802
        status, body = proses(self.query())
        self.kirim(status, body)

    def do_POST(self):  # noqa: N802
        try:
            status, body = proses(self.baca_json())
        except ValueError as e:
            status, body = 400, {"error": str(e)}
        self.kirim(status, body)
