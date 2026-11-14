"""
Uji backend Python Jejak Sang Eksponen (pustaka standar unittest).

Jalankan:  python -m unittest discover -s tests -v     (atau: npm run test:py)
"""

import json
import sys
import threading
import unittest
import urllib.error
import urllib.request
from fractions import Fraction
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))
sys.path.insert(0, str(ROOT / "backend"))

from _lib.data_soal import KELOMPOK, SOAL  # noqa: E402
from _lib.pangkat import catatan_tanda, format_pecahan, hitung_lab, langkah_pangkat, pangkat_eksak, PangkatError, validasi_input_lab  # noqa: E402
from _lib.penilaian import nilai_satu, nilai_semua, normalisasi_teks, parse_pecahan  # noqa: E402

FIXTURE = json.loads((ROOT / "tests" / "fixtures" / "kesetaraan_js.json").read_text(encoding="utf-8"))


def kunci(soal):
    """Jawaban kunci untuk soal apa pun."""
    if soal["kind"] == "match":
        return {str(i): i for i in range(soal["pasangan"])}
    if soal["kind"] == "short":
        return soal["kunci"][0]
    return soal["kunci"]


class TestPangkat(unittest.TestCase):
    def test_nilai_eksak(self):
        self.assertEqual(pangkat_eksak(2, 3), 8)
        self.assertEqual(pangkat_eksak(3, 2), 9)
        self.assertEqual(pangkat_eksak(2, -3), Fraction(1, 8))
        self.assertEqual(pangkat_eksak(-2, 3), -8)
        self.assertEqual(pangkat_eksak(7, 0), 1)
        self.assertEqual(format_pecahan(pangkat_eksak(10, 3)), "1.000")
        self.assertEqual(format_pecahan(pangkat_eksak(10, -3)), "1/1.000")
        self.assertEqual(format_pecahan(pangkat_eksak(-2, 3)), "−8")

    def test_tidak_terdefinisi(self):
        with self.assertRaises(PangkatError):
            pangkat_eksak(0, 0)
        with self.assertRaises(PangkatError):
            pangkat_eksak(0, -2)
        self.assertFalse(validasi_input_lab("0", "0")["ok"])
        self.assertIn("tidak terdefinisi", validasi_input_lab("0", "-1")["error"])

    def test_validasi_input(self):
        self.assertIn("kosong", validasi_input_lab("", "2")["error"])
        self.assertIn("angka", validasi_input_lab("a", "2")["error"])
        self.assertIn("bulat", validasi_input_lab("2", "1.5")["error"])
        self.assertIn("dibatasi", validasi_input_lab("99", "2")["error"])
        self.assertTrue(validasi_input_lab("−3", "3")["ok"])

    def test_respons_lab(self):
        r = hitung_lab("2", "-3")
        self.assertTrue(r["ok"])
        self.assertEqual(r["hasil"], "1/8")
        self.assertEqual(r["notasi"], "2^{−3}")
        self.assertTrue(r["langkah"])


class TestPenilaian(unittest.TestCase):
    def test_semua_kunci_dinilai_benar(self):
        for qid, soal in SOAL.items():
            with self.subTest(qid=qid):
                self.assertTrue(nilai_satu(soal, kunci(soal)), qid)

    def test_isian_pretest(self):
        q9, q10 = SOAL["pre-9"], SOAL["pre-10"]
        for a in ["4 × 4 × 4", "4x4x4", "4 * 4 * 4", "4.4.4", " 4 X 4 X 4 "]:
            self.assertTrue(nilai_satu(q9, a), a)
        for a in ["4 × 4", "64", "4 + 4 + 4", "4^3"]:
            self.assertFalse(nilai_satu(q9, a), a)
        for a in ["2^3", "2³", "2 ^ 3", "2^{3}", "2 pangkat 3"]:
            self.assertTrue(nilai_satu(q10, a), a)
        for a in ["2^4", "2^5", "3^2"]:
            self.assertFalse(nilai_satu(q10, a), a)

    def test_pecahan_setara(self):
        self.assertEqual(parse_pecahan("2/16"), Fraction(1, 8))
        self.assertEqual(parse_pecahan("0,125"), Fraction(1, 8))
        self.assertEqual(parse_pecahan("1.000"), 1000)
        self.assertIsNone(parse_pecahan("abc"))
        self.assertEqual(normalisasi_teks("2⁻³"), "2^-3")

    def test_skor_dan_indikator(self):
        jawaban = {qid: kunci(SOAL[qid]) for qid in KELOMPOK["pretest"]}
        self.assertEqual(nilai_semua(KELOMPOK["pretest"], jawaban)["skor"], 100)
        del jawaban["pre-8"], jawaban["pre-10"]
        h = nilai_semua(KELOMPOK["pretest"], jawaban)
        self.assertEqual((h["skor"], h["benar"], h["salah"]), (80, 8, 2))
        self.assertEqual(h["per_indikator"]["negatif"], [0, 1])

    def test_pembulatan_setengah_ke_atas(self):
        # 1 dari 8 benar = 12,5 → 13 (sama dengan Math.round di JavaScript)
        ids = KELOMPOK["pretest"][:8]
        self.assertEqual(nilai_semua(ids, {ids[0]: kunci(SOAL[ids[0]])})["skor"], 13)


class TestKesetaraanDenganJavaScript(unittest.TestCase):
    """Backend Python harus memberi hasil yang PERSIS sama dengan frontend JavaScript."""

    def test_penilaian_sama(self):
        beda = [k for k in FIXTURE["kasus"] if nilai_satu(SOAL[k["id"]], k["jawaban"]) != k["benar"]]
        self.assertEqual(beda, [], f"{len(beda)} kasus berbeda, contoh: {beda[:3]}")
        self.assertGreater(len(FIXTURE["kasus"]), 500)

    def test_perhitungan_pangkat_sama(self):
        for k in FIXTURE["pangkat"]:
            b, e = k["basis"], k["pangkat"]
            with self.subTest(basis=b, pangkat=e):
                try:
                    hasil = format_pecahan(pangkat_eksak(b, e))
                except PangkatError:
                    hasil = None
                self.assertEqual(hasil, k["hasil"])
                self.assertEqual(langkah_pangkat(b, e), k["langkah"])
                self.assertEqual(catatan_tanda(b, e), k["catatan"])

    def test_validasi_lab_sama(self):
        for k in FIXTURE["validasi"]:
            with self.subTest(basis=k["basis"], pangkat=k["pangkat"]):
                py = validasi_input_lab(k["basis"], k["pangkat"])
                self.assertEqual(py["ok"], k["ok"])
                self.assertEqual(py.get("error"), k.get("error"))


class TestEndpointHTTP(unittest.TestCase):
    """Menjalankan server backend sungguhan lalu memanggil endpoint lewat HTTP."""

    @classmethod
    def setUpClass(cls):
        import dev_server

        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), dev_server.Router)
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def panggil(self, path, data=None):
        req = urllib.request.Request(self.base + path, data=None if data is None else json.dumps(data).encode(), headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status, json.loads(r.read())
        except urllib.error.HTTPError as e:
            with e:
                return e.code, json.loads(e.read())

    def test_status(self):
        s, b = self.panggil("/api/status")
        self.assertEqual((s, b["backend"], b["jumlah_soal"]), (200, "python", len(SOAL)))

    def test_nilai_pretest(self):
        jawaban = {"pre-1": 1, "pre-2": 2, "pre-3": 2, "pre-4": 0, "pre-5": 2, "pre-6": 1, "pre-7": 1, "pre-8": 0, "pre-9": "4×4×4", "pre-10": "2^3"}
        s, b = self.panggil("/api/nilai", {"kelompok": "pretest", "jawaban": jawaban})
        self.assertEqual((s, b["skor"], b["benar"], b["dinilai_oleh"]), (200, 90, 9, "python"))
        self.assertEqual(b["per_soal"][7], False)

    def test_nilai_daftar_soal_dan_kesalahan(self):
        s, b = self.panggil("/api/nilai", {"soal": ["m1-1", "m1-2"], "jawaban": {"m1-1": 0, "m1-2": "5^2"}})
        self.assertEqual((s, b["skor"]), (200, 100))
        self.assertEqual(self.panggil("/api/nilai", {"soal": ["tidak-ada"], "jawaban": {}})[0], 400)
        self.assertEqual(self.panggil("/api/nilai", {"kelompok": "x", "jawaban": {}})[0], 400)
        self.assertEqual(self.panggil("/api/nilai", {"soal": "bukan-daftar"})[0], 400)
        self.assertEqual(self.panggil("/api/nilai")[0], 405)

    def test_pangkat(self):
        s, b = self.panggil("/api/pangkat?basis=2&pangkat=-3")
        self.assertEqual((s, b["hasil"], b["dihitung_oleh"]), (200, "1/8", "python"))
        s, b = self.panggil("/api/pangkat", {"basis": "0", "pangkat": "0"})
        self.assertEqual((s, b["ok"]), (200, False))
        self.assertIn("tidak terdefinisi", b["error"])

    def test_endpoint_tidak_ada(self):
        self.assertEqual(self.panggil("/api/tidak-ada")[0], 404)


if __name__ == "__main__":
    unittest.main()
