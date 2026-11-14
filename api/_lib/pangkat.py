"""
Perhitungan bilangan berpangkat secara EKSAK (bilangan bulat + pecahan) untuk backend.

Logikanya setara dengan src/lib/math/exponent.js di frontend:
- 2^3 = 8, 2^-3 = 1/8, (-2)^3 = -8
- 0^0 dan 0^(negatif) tidak terdefinisi
- input Laboratorium divalidasi (kosong, bukan angka, desimal, batas nilai)
"""

from __future__ import annotations

import re
from fractions import Fraction

BASIS_MIN, BASIS_MAX = -20, 20
PANGKAT_MIN, PANGKAT_MAX = -10, 10
NILAI_MAKS = 10**15
MINUS = "−"  # tanda minus tipografis "−"

_ANGKA = re.compile(r"^-?[0-9]+(\.[0-9]+)?$")


class PangkatError(ValueError):
    """Hasil tidak bisa dihitung (tidak terdefinisi / terlalu besar)."""

    def __init__(self, alasan: str):
        super().__init__(alasan)
        self.alasan = alasan  # "undefined-zero" | "too-big"


def pangkat_eksak(basis: int, pangkat: int, nilai_maks: int = NILAI_MAKS) -> Fraction:
    """Menghitung basis^pangkat secara eksak. Melempar PangkatError bila tidak bisa."""
    if basis == 0 and pangkat <= 0:
        raise PangkatError("undefined-zero")
    hasil = 1
    for _ in range(abs(pangkat)):
        hasil *= basis
        if abs(hasil) > nilai_maks:
            raise PangkatError("too-big")
    return Fraction(hasil) if pangkat >= 0 else Fraction(1, hasil)


def format_bulat(n: int) -> str:
    """Pemisah ribuan gaya Indonesia: 1000 -> 1.000, -8 -> −8."""
    s = f"{abs(n):,}".replace(",", ".")
    return (MINUS if n < 0 else "") + s


def format_pecahan(r: Fraction) -> str:
    if r.denominator == 1:
        return format_bulat(r.numerator)
    tanda = MINUS if r.numerator < 0 else ""
    return f"{tanda}{format_bulat(abs(r.numerator))}/{format_bulat(r.denominator)}"


def format_basis(basis: int) -> str:
    """Basis negatif ditulis dalam kurung: (−2)."""
    return f"({MINUS}{abs(basis)})" if basis < 0 else str(basis)


def teks_pangkat(basis, pangkat) -> str:
    """Notasi yang dipahami frontend (MathText): 2^{3}, (−2)^{3}, 2^{−3}."""
    b = format_basis(basis) if isinstance(basis, int) else str(basis)
    if isinstance(pangkat, int):
        e = f"{MINUS}{abs(pangkat)}" if pangkat < 0 else str(pangkat)
    else:
        e = str(pangkat)
    return f"{b}^{{{e}}}"


def perkalian_berulang(basis: int, kali: int) -> str:
    if kali <= 0:
        return ""
    return " × ".join([format_basis(basis)] * kali)


def catatan_tanda(basis: int, pangkat: int) -> str | None:
    if basis >= 0 or pangkat == 0:
        return None
    if abs(pangkat) % 2 == 0:
        return "Basis negatif dengan pangkat genap menghasilkan bilangan positif, karena jumlah tanda negatifnya genap (berpasangan)."
    return "Basis negatif dengan pangkat ganjil menghasilkan bilangan negatif, karena ada satu tanda negatif yang tidak berpasangan."


def langkah_pangkat(basis: int, pangkat: int) -> list[str]:
    """Langkah penyelesaian a^n (sama dengan powSteps di frontend)."""
    p = teks_pangkat(basis, pangkat)
    if basis == 0 and pangkat <= 0:
        return [f"{p} tidak terdefinisi."]
    if pangkat == 0:
        return [
            f"{p} = 1, karena setiap bilangan (kecuali 0) berpangkat nol hasilnya 1.",
            f"Asalnya: {teks_pangkat(basis, 2)} : {teks_pangkat(basis, 2)} = {teks_pangkat(basis, '2−2')} = {teks_pangkat(basis, 0)}, dan bilangan dibagi dirinya sendiri = 1.",
        ]
    if pangkat > 0:
        langkah = [
            f"{p} artinya {format_basis(basis)} dikalikan sebanyak {pangkat} kali.",
            f"{p} = {perkalian_berulang(basis, pangkat)}",
        ]
        try:
            langkah.append(f"{p} = {format_pecahan(pangkat_eksak(basis, pangkat))}")
        except PangkatError:
            pass
        return langkah
    n = -pangkat
    langkah = [f"Pangkat negatif berarti kebalikan: {p} = 1/{teks_pangkat(basis, n)}"]
    try:
        nilai_n = format_pecahan(pangkat_eksak(basis, n))
        langkah.append(f"{teks_pangkat(basis, n)} = {perkalian_berulang(basis, n)} = {nilai_n}")
    except PangkatError:
        langkah.append(f"{teks_pangkat(basis, n)} = {perkalian_berulang(basis, n)}")
    try:
        langkah.append(f"Jadi {p} = {format_pecahan(pangkat_eksak(basis, pangkat))}")
    except PangkatError:
        pass
    return langkah


def validasi_input_lab(basis_mentah: str, pangkat_mentah: str) -> dict:
    """
    Validasi input Laboratorium. Mengembalikan
    {"ok": True, "basis": int, "pangkat": int} atau {"ok": False, "error": str, ...}.
    Pesan kesalahan sama dengan validateLabInput di frontend.
    """
    bs = str(basis_mentah).strip().replace(MINUS, "-", 1).replace(",", ".", 1)
    es = str(pangkat_mentah).strip().replace(MINUS, "-", 1).replace(",", ".", 1)
    if bs == "" or es == "":
        return {"ok": False, "error": "Kolom basis dan pangkat tidak boleh kosong, ya."}
    if not _ANGKA.match(bs) or not _ANGKA.match(es):
        return {"ok": False, "error": "Masukkan angka saja, tanpa huruf atau simbol lain."}
    b, e = float(bs), float(es)
    if not e.is_integer():
        return {"ok": False, "error": "Di materi SMP kita memakai pangkat bilangan bulat. Coba pangkat seperti 2, 0, atau −3."}
    if not b.is_integer():
        return {"ok": False, "error": "Untuk laboratorium ini, gunakan basis bilangan bulat, ya."}
    basis, pangkat = int(b), int(e)
    if basis < BASIS_MIN or basis > BASIS_MAX:
        return {"ok": False, "error": f"Basis dibatasi dari {BASIS_MIN} sampai {BASIS_MAX} agar hasilnya tidak terlalu besar."}
    if pangkat < PANGKAT_MIN or pangkat > PANGKAT_MAX:
        return {"ok": False, "error": f"Pangkat dibatasi dari {PANGKAT_MIN} sampai {PANGKAT_MAX} agar hasilnya tidak terlalu besar."}
    if basis == 0 and pangkat == 0:
        return {"ok": False, "basis": basis, "pangkat": pangkat, "error": "0⁰ tidak terdefinisi. Aturan a⁰ = 1 hanya berlaku jika a ≠ 0."}
    if basis == 0 and pangkat < 0:
        return {
            "ok": False,
            "basis": basis,
            "pangkat": pangkat,
            "error": f"0 pangkat negatif tidak terdefinisi, karena {teks_pangkat(0, pangkat)} = 1/{teks_pangkat(0, -pangkat)} = 1/0, dan pembagian dengan nol tidak terdefinisi.",
        }
    try:
        pangkat_eksak(basis, pangkat)
    except PangkatError:
        return {"ok": False, "error": "Hasilnya terlalu besar untuk ditampilkan. Coba angka yang lebih kecil."}
    return {"ok": True, "basis": basis, "pangkat": pangkat}


def hitung_lab(basis_mentah, pangkat_mentah) -> dict:
    """Respons lengkap untuk Laboratorium: validasi, hasil, langkah, catatan tanda."""
    v = validasi_input_lab(basis_mentah, pangkat_mentah)
    if not v["ok"]:
        return v
    basis, pangkat = v["basis"], v["pangkat"]
    hasil = pangkat_eksak(basis, pangkat)
    return {
        "ok": True,
        "basis": basis,
        "pangkat": pangkat,
        "notasi": teks_pangkat(basis, pangkat),
        "hasil": format_pecahan(hasil),
        "pembilang": str(hasil.numerator),
        "penyebut": str(hasil.denominator),
        "langkah": langkah_pangkat(basis, pangkat),
        "catatan": catatan_tanda(basis, pangkat),
    }
