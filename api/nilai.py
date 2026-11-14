"""
POST /api/nilai — menilai jawaban siswa di server Python.

Body JSON:
  {"soal": ["pre-1", "pre-2", ...], "jawaban": {"pre-1": 1, "pre-9": "4 × 4 × 4", ...}}
  atau {"kelompok": "pretest" | "posttest" | "misi-1".."misi-7", "jawaban": {...}}

Respons:
  {"skor": 90, "benar": 9, "salah": 1, "total": 10, "per_soal": [true, ...],
   "per_indikator": {"perkalian": [1, 1], ...}, "dinilai_oleh": "python"}
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _lib.data_soal import KELOMPOK  # noqa: E402
from _lib.http_util import JsonHandler  # noqa: E402
from _lib.penilaian import SoalTidakDikenal, nilai_semua  # noqa: E402

MAKS_SOAL = 50


def proses(data) -> tuple[int, dict]:
    """Logika endpoint (dipisah agar mudah diuji). Mengembalikan (status HTTP, body)."""
    if not isinstance(data, dict):
        return 400, {"error": "Body harus berupa objek JSON."}
    jawaban = data.get("jawaban", {})
    if not isinstance(jawaban, dict):
        return 400, {"error": "'jawaban' harus berupa objek {id_soal: jawaban}."}
    if "kelompok" in data:
        soal = KELOMPOK.get(str(data["kelompok"]))
        if soal is None:
            return 400, {"error": f"Kelompok soal '{data['kelompok']}' tidak dikenal."}
    else:
        soal = data.get("soal")
        if not isinstance(soal, list) or not soal or not all(isinstance(s, str) for s in soal):
            return 400, {"error": "'soal' harus berupa daftar id soal."}
    if len(soal) > MAKS_SOAL:
        return 400, {"error": f"Maksimal {MAKS_SOAL} soal sekali penilaian."}
    try:
        hasil = nilai_semua(soal, jawaban)
    except SoalTidakDikenal as e:
        return 400, {"error": f"Soal tidak dikenal: {e.args[0]}"}
    hasil["dinilai_oleh"] = "python"
    return 200, hasil


class handler(JsonHandler):  # noqa: N801 - nama wajib untuk Vercel
    def do_POST(self):  # noqa: N802
        try:
            status, body = proses(self.baca_json())
        except ValueError as e:
            status, body = 400, {"error": str(e)}
        self.kirim(status, body)

    def do_GET(self):  # noqa: N802
        self.kirim(405, {"error": "Gunakan metode POST untuk mengirim jawaban."})
