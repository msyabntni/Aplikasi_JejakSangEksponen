/** Validasi formulir (identitas, registrasi, login). Pesan ramah berbahasa Indonesia. */

export function validateName(raw: string): string | null {
  const name = raw.trim();
  if (!name) return "Nama penjelajah belum diisi, nih.";
  if (name.length < 2) return "Nama minimal 2 huruf, ya.";
  if (name.length > 24) return "Nama maksimal 24 karakter.";
  if (!/^[\p{L}\p{N} .'_-]+$/u.test(name)) return "Gunakan huruf, angka, spasi, titik, atau tanda hubung saja.";
  return null;
}

export function validateEmail(raw: string): string | null {
  const e = raw.trim();
  if (!e) return "Email wajib diisi.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return "Format email belum benar, contoh: nama@sekolah.sch.id";
  return null;
}

export function validateUsername(raw: string): string | null {
  const u = raw.trim();
  if (!u) return "Username wajib diisi.";
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return "Username 3–20 karakter: huruf kecil, angka, atau garis bawah (_).";
  return null;
}

export function validatePassword(p: string): string | null {
  if (!p) return "Password wajib diisi.";
  if (p.length < 8) return "Password minimal 8 karakter.";
  if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Password harus berisi huruf dan angka.";
  return null;
}

export function validateRequired(v: string, label: string): string | null {
  return v.trim() ? null : `${label} wajib diisi.`;
}

export function validateKelas(raw: string): string | null {
  const k = raw.trim();
  if (!k) return "Kelas belum diisi, contoh: VIII A.";
  if (k.length > 12) return "Kelas maksimal 12 karakter.";
  if (!/^[\p{L}\p{N} .\-/]+$/u.test(k)) return "Kelas hanya boleh berisi huruf, angka, spasi, titik, garis miring, atau tanda hubung.";
  return null;
}
