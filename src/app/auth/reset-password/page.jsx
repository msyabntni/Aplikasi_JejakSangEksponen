"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { AuthFrame, Field, FormAlert, friendlyAuthError } from "@/components/auth/AuthFrame";
import { GameButton } from "@/components/ui/GameButton";
import { getSupabase } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/validation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  // Supabase membuat sesi pemulihan dari tautan email (event PASSWORD_RECOVERY)
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setTimeout(() => setChecked(true), 800);
    });
    const { data } = sb.auth.onAuthStateChange((ev, session) => {
      if (ev === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const v = { pw: validatePassword(pw), pw2: pw2 !== pw ? "Konfirmasi password tidak sama." : null };
    setErrs(v);
    if (v.pw || v.pw2) return;
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.updateUser({ password: pw });
      if (error) setErr(friendlyAuthError(error.message));
      else {
        setOk(true);
        setTimeout(() => router.push("/camp"), 1800);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title="Buat Password Baru">
      {ok ? (
        <FormAlert kind="ok">Password berhasil diganti! Mengantarmu ke Camp...</FormAlert>
      ) : !ready ? (
        checked ? (
          <div className="space-y-3">
            <FormAlert kind="error">Tautan pemulihan tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman lupa password.</FormAlert>
            <GameButton href="/auth/lupa-password" full>
              Minta tautan baru
            </GameButton>
          </div>
        ) : (
          <p className="text-center text-jungle">Memeriksa tautan pemulihan...</p>
        )
      ) : (
        <form onSubmit={submit} className="space-y-3" noValidate>
          <Field id="pw" label="Password baru" type="password" value={pw} onChange={setPw} error={errs.pw} autoComplete="new-password" />
          <Field id="pw2" label="Konfirmasi password baru" type="password" value={pw2} onChange={setPw2} error={errs.pw2} autoComplete="new-password" />
          {err && <FormAlert kind="error">{err}</FormAlert>}
          <GameButton type="submit" full disabled={busy} icon={<KeyRound size={18} />}>
            {busy ? "Menyimpan..." : "Simpan password"}
          </GameButton>
        </form>
      )}
    </AuthFrame>
  );
}
