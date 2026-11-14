"""
Penilaian jawaban siswa di backend Python.

Setara dengan src/lib/grading.js di frontend:
- isian teks dinormalisasi (spasi, ×/x/*, 4.4.4, superskrip ³ vs ^3, kurung kurawal, "pangkat")
- isian nilai dibandingkan sebagai pecahan (1/8 = 2/16 = 0,125)
- pilihan ganda, benar/salah, identifikasi, temukan kesalahan, pasangkan
"""

from __future__ import annotations

import re
from fractions import Fraction

from .data_soal import SOAL

_SUP = {"⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+", "ᵐ": "m", "ⁿ": "n"}
_RE_SUP = re.compile("[" + "".join(_SUP) + "]+")


def normalisasi_teks(mentah: str) -> str:
    """Normalisasi jawaban isian teks (urutan langkah sama dengan normalizeText di JS)."""
    s = str(mentah).strip().lower()
    s = _RE_SUP.sub(lambda m: "^" + "".join(_SUP.get(c, c) for c in m.group(0)), s)
    s = re.sub("[−–—]", "-", s)
    s = re.sub(r"\s*pangkat\s*", "^", s)
    s = re.sub(r"\s+", "", s)
    s = re.sub("[×x*·•]", "*", s)
    if re.fullmatch(r"[0-9]+(\.[0-9]+){2,}", s):
        s = s.replace(".", "*")
    s = re.sub("[÷:]", "/", s)
    s = re.sub(r"\^\{([^}]*)\}", r"^\1", s)
    s = re.sub(r"\^\((-?[A-Za-z0-9_]+)\)", r"^\1", s)
    return s


def parse_pecahan(mentah: str) -> Fraction | None:
    """'8', '-8', '1/8', '0,125', '1.000' -> Fraction; None bila bukan bilangan."""
    s = re.sub(r"\s+", "", str(mentah).strip())
    s = re.sub("[−–]", "-", s)
    if s == "":
        return None
    m = re.fullmatch(r"(-?)([0-9]+)/(-?)([0-9]+)", s)
    if m:
        penyebut = int(m.group(4))
        if penyebut == 0:
            return None
        tanda = -1 if (m.group(1) == "-") != (m.group(3) == "-") else 1
        return Fraction(tanda * int(m.group(2)), penyebut)
    if re.fullmatch(r"-?[0-9]{1,3}(\.[0-9]{3})+", s):
        s = s.replace(".", "")  # pemisah ribuan
    s = s.replace(",", ".", 1)
    m = re.fullmatch(r"(-?)([0-9]+)(?:\.([0-9]+))?", s)
    if not m:
        return None
    pecahan = m.group(3) or ""
    nilai = Fraction(int(m.group(2) + pecahan), 10 ** len(pecahan))
    return -nilai if m.group(1) == "-" else nilai


def sudah_dijawab(soal: dict, jawaban) -> bool:
    if jawaban is None:
        return False
    if soal["kind"] == "short":
        return isinstance(jawaban, str) and jawaban.strip() != ""
    if soal["kind"] == "match":
        return isinstance(jawaban, dict) and len(jawaban) == soal["pasangan"]
    return True


def nilai_satu(soal: dict, jawaban) -> bool:
    """True bila jawaban benar."""
    if not sudah_dijawab(soal, jawaban):
        return False
    jenis = soal["kind"]
    if jenis in ("mcq", "findError"):
        return isinstance(jawaban, int) and not isinstance(jawaban, bool) and jawaban == soal["kunci"]
    if jenis == "tf":
        return isinstance(jawaban, bool) and jawaban == soal["kunci"]
    if jenis == "identify":
        return jawaban == soal["kunci"]
    if jenis == "match":
        try:
            return all(int(jawaban.get(str(i), jawaban.get(i, -1))) == i for i in range(soal["pasangan"]))
        except (TypeError, ValueError):
            return False
    if jenis == "short":
        if soal["mode"] == "value":
            didapat = parse_pecahan(jawaban)
            return didapat is not None and any(parse_pecahan(k) == didapat for k in soal["kunci"])
        n = normalisasi_teks(jawaban)
        return any(normalisasi_teks(k) == n for k in soal["kunci"])
    return False


class SoalTidakDikenal(KeyError):
    pass


def nilai_semua(id_soal: list[str], jawaban: dict) -> dict:
    """
    Menilai sekumpulan soal. Hasil: skor 0–100, jumlah benar/salah,
    benar/salah per soal, dan rekap per indikator materi.
    """
    per_soal: list[bool] = []
    per_indikator: dict[str, list[int]] = {}
    for qid in id_soal:
        soal = SOAL.get(qid)
        if soal is None:
            raise SoalTidakDikenal(qid)
        ok = nilai_satu(soal, jawaban.get(qid))
        per_soal.append(ok)
        rek = per_indikator.setdefault(soal["indicator"], [0, 0])
        rek[0] += 1 if ok else 0
        rek[1] += 1
    benar = sum(per_soal)
    total = len(per_soal)
    return {
        # pembulatan setengah ke atas, sama dengan Math.round di JavaScript (round() Python = banker's rounding)
        "skor": (benar * 200 + total) // (2 * total) if total else 0,
        "benar": benar,
        "salah": total - benar,
        "total": total,
        "per_soal": per_soal,
        "per_indikator": per_indikator,
    }
