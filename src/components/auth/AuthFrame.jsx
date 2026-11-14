"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Naru from "../characters/Naru";
import Kaciro from "../characters/Kaciro";
import { JungleBackdrop } from "../scenery/Scenery";
import { Logo } from "../ui/Logo";
import { Parchment } from "../ui/Panels";
import { GameButton } from "../ui/GameButton";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthFrame({ title, children }) {
  return (
    <JungleBackdrop className="min-h-dvh" sky={["#a8dcc4", "#e9f0d8"]}>
      <div className="relative z-20 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
        <Link href="/" className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 font-bold text-jungle">
          <ArrowLeft size={16} /> Beranda
        </Link>
        <div className="mb-2 flex items-end justify-between">
          <Naru pose="hang" width="min(28vw, 124px)" />
          <div className="rounded-2xl bg-jungle px-3 py-2">
            <Logo compact />
          </div>
          <Kaciro pose="book" width="min(26vw, 112px)" />
        </div>
        <Parchment>
          <h1 className="mb-4 text-center font-display text-2xl font-extrabold text-jungle">{title}</h1>
          {isSupabaseConfigured ? (
            children
          ) : (
            <div className="space-y-3 text-center text-jungle">
              <p className="rounded-2xl bg-sun/40 p-3 font-semibold">
                Mode akun (email) belum dikonfigurasi oleh pengelola aplikasi. Kamu tetap bisa bermain penuh sebagai tamu, dan progres tersimpan di browser ini.
              </p>
              <p className="text-xs text-earth">Pengelola: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local (lihat README).</p>
              <GameButton href="/mulai" full>
                Main sebagai Tamu
              </GameButton>
            </div>
          )}
        </Parchment>
      </div>
    </JungleBackdrop>
  );
}

export function Field({ id, label, type = "text", value, onChange, error, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-jungle">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={isPw && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 font-semibold text-jungle outline-none focus:border-orange ${error ? "border-coral" : "border-[#d9c08f]"} ${isPw ? "pr-11" : ""}`}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-earth hover:bg-cream"
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-[#a3321c]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ kind, children }) {
  return (
    <p
      className={`rounded-xl px-3 py-2 text-sm font-semibold ${kind === "error" ? "bg-[#fde6e2] text-[#7a2b2b]" : "bg-[#e3f4dc] text-forest"}`}
      role={kind === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

export function friendlyAuthError(msg) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email atau password salah. Coba periksa lagi.";
  if (m.includes("email not confirmed")) return "Email belum diverifikasi. Buka email dari kami dan klik tautan verifikasi.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Email ini sudah terdaftar. Silakan masuk atau gunakan lupa password.";
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  if (m.includes("password")) return "Password belum memenuhi ketentuan keamanan.";
  if (m.includes("fetch")) return "Tidak bisa terhubung ke server. Periksa koneksi internetmu.";
  return "Terjadi kesalahan: " + msg;
}
