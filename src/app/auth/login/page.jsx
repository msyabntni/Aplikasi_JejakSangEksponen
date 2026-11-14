"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { AuthFrame, Field, FormAlert, friendlyAuthError } from "@/components/auth/AuthFrame";
import { GameButton } from "@/components/ui/GameButton";
import { getSupabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store/ProgressProvider";
import { validateEmail } from "@/lib/validation";

function safeNext(n) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/camp";
}

function LoginForm() {
  const s = useStore();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  // sudah login -> langsung ke Camp atau halaman tujuan sebelumnya
  useEffect(() => {
    if (s.user) router.replace(next);
  }, [s.user, next, router]);

  const submit = async (e) => {
    e.preventDefault();
    const v = { email: validateEmail(email), pw: pw ? null : "Password wajib diisi." };
    setErrs(v);
    if (v.email || v.pw) return;
    setBusy(true);
    setErr(null);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password: pw });
      if (error) setErr(friendlyAuthError(error.message));
    } catch (e2) {
      setErr(friendlyAuthError(e2 instanceof Error ? e2.message : String(e2)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title="Selamat Datang Kembali, Penjelajah!">
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errs.email} autoComplete="email" placeholder="nama@email.com" />
        <Field id="pw" label="Password" type="password" value={pw} onChange={setPw} error={errs.pw} autoComplete="current-password" />
        <div className="text-right">
          <Link href="/auth/lupa-password" className="text-sm font-bold text-forest underline">
            Lupa password?
          </Link>
        </div>
        {err && <FormAlert kind="error">{err}</FormAlert>}
        <GameButton type="submit" full size="lg" disabled={busy} icon={<LogIn />}>
          {busy ? "Memeriksa..." : "MASUK"}
        </GameButton>
        <p className="text-center text-sm text-jungle">
          Belum punya akun?{" "}
          <Link href="/auth/daftar" className="font-bold text-forest underline">
            Daftar di sini
          </Link>
        </p>
        <GameButton href="/mulai" variant="cream" full>
          Main sebagai Tamu
        </GameButton>
      </form>
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
