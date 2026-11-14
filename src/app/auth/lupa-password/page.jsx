"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { AuthFrame, Field, FormAlert, friendlyAuthError } from "@/components/auth/AuthFrame";
import { GameButton } from "@/components/ui/GameButton";
import { getSupabase } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldErr, setFieldErr] = useState(null);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const v = validateEmail(email);
    setFieldErr(v);
    if (v) return;
    setBusy(true);
    setErr(null);
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/reset-password` });
      if (error) setErr(friendlyAuthError(error.message));
      else setOk(true);
    } catch (e2) {
      setErr(friendlyAuthError(e2 instanceof Error ? e2.message : String(e2)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title="Lupa Password">
      {ok ? (
        <div className="space-y-3">
          <FormAlert kind="ok">Jika email tersebut terdaftar, tautan untuk membuat password baru sudah dikirim. Cek kotak masuk dan folder spam.</FormAlert>
          <GameButton href="/auth/login" full>
            Kembali ke halaman masuk
          </GameButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3" noValidate>
          <p className="text-sm text-jungle">Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.</p>
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={fieldErr} autoComplete="email" />
          {err && <FormAlert kind="error">{err}</FormAlert>}
          <GameButton type="submit" full disabled={busy} icon={<Mail size={18} />}>
            {busy ? "Mengirim..." : "Kirim tautan pemulihan"}
          </GameButton>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="font-bold text-forest underline">
              Kembali ke halaman masuk
            </Link>
          </p>
        </form>
      )}
    </AuthFrame>
  );
}
