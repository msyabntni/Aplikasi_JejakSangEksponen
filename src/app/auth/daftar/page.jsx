"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AuthFrame, Field, FormAlert, friendlyAuthError } from "@/components/auth/AuthFrame";
import { GameButton } from "@/components/ui/GameButton";
import { getSupabase } from "@/lib/supabase/client";
import { remote } from "@/lib/supabase/remote";
import { validateEmail, validatePassword, validateRequired, validateUsername } from "@/lib/validation";

export default function DaftarPage() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", username: "", email: "", kelas: "", pw: "", pw2: "" });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: k === "username" ? v.toLowerCase() : v }));

  const submit = async (e) => {
    e.preventDefault();
    const v = {
      name: validateRequired(f.name, "Nama lengkap") ?? (f.name.trim().length > 60 ? "Nama terlalu panjang." : null),
      username: validateUsername(f.username),
      email: validateEmail(f.email),
      kelas: validateRequired(f.kelas, "Kelas"),
      pw: validatePassword(f.pw),
      pw2: !f.pw2 ? "Konfirmasi password wajib diisi." : f.pw2 !== f.pw ? "Konfirmasi password tidak sama." : null,
    };
    setErrs(v);
    if (Object.values(v).some(Boolean)) return;
    setBusy(true);
    setErr(null);
    try {
      const free = await remote.usernameAvailable(f.username.trim());
      if (!free) {
        setErrs((x) => ({ ...x, username: "Username sudah dipakai. Coba yang lain." }));
        return;
      }
      const { data, error } = await getSupabase().auth.signUp({
        email: f.email.trim(),
        password: f.pw,
        options: {
          data: {
            full_name: f.name.trim(),
            username: f.username.trim(),
            kelas: f.kelas.trim(),
            nickname: f.name.trim().split(/\s+/)[0].slice(0, 24),
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });
      if (error) {
        setErr(friendlyAuthError(error.message));
        return;
      }
      if (data.session) router.replace("/camp");
      else setOk("Pendaftaran berhasil! Cek email kamu untuk verifikasi, lalu masuk dengan akunmu.");
    } catch (e2) {
      setErr(friendlyAuthError(e2 instanceof Error ? e2.message : String(e2)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title="Daftar Akun Penjelajah">
      {ok ? (
        <div className="space-y-3">
          <FormAlert kind="ok">{ok}</FormAlert>
          <GameButton href="/auth/login" full>
            Ke halaman masuk
          </GameButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3" noValidate>
          <Field id="name" label="Nama lengkap" value={f.name} onChange={set("name")} error={errs.name} autoComplete="name" />
          <Field
            id="username"
            label="Username"
            value={f.username}
            onChange={set("username")}
            error={errs.username}
            autoComplete="username"
            placeholder="huruf kecil, angka, _"
          />
          <Field id="email" label="Email" type="email" value={f.email} onChange={set("email")} error={errs.email} autoComplete="email" />
          <Field id="kelas" label="Kelas" value={f.kelas} onChange={set("kelas")} error={errs.kelas} placeholder="contoh: VIII A" />
          <Field
            id="pw"
            label="Password (min. 8 karakter, huruf & angka)"
            type="password"
            value={f.pw}
            onChange={set("pw")}
            error={errs.pw}
            autoComplete="new-password"
          />
          <Field id="pw2" label="Konfirmasi password" type="password" value={f.pw2} onChange={set("pw2")} error={errs.pw2} autoComplete="new-password" />
          {err && <FormAlert kind="error">{err}</FormAlert>}
          <GameButton type="submit" full size="lg" disabled={busy} icon={<UserPlus />}>
            {busy ? "Memproses..." : "DAFTAR"}
          </GameButton>
          <p className="text-center text-sm text-jungle">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="font-bold text-forest underline">
              Masuk
            </Link>
          </p>
        </form>
      )}
    </AuthFrame>
  );
}
