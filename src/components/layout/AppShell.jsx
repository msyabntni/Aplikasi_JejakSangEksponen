"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FlaskConical, Gamepad2, Map, Tent, UserRound } from "lucide-react";
import { useStore } from "@/lib/store/ProgressProvider";
import { posttestUnlocked } from "@/lib/unlock";
import { Logo } from "../ui/Logo";
import { TopControls } from "./TopControls";
import { Compass, Gem } from "../scenery/Scenery";
import { AppFooter } from "../ui/DeveloperCredit";
import { LoadingScreen } from "./LoadingScreen";

const NAV = [
  { href: "/camp", label: "Camp", icon: Tent },
  { href: "/peta", label: "Peta", icon: Map },
  { href: "/lab", label: "Lab", icon: FlaskConical },
  { href: "/game", label: "Main", icon: Gamepad2 },
  { href: "/profil", label: "Profil", icon: UserRound },
];

/** Aturan akses halaman (guest/akun + pretest wajib). */
function useGuard() {
  const s = useStore();
  const path = usePathname();
  const router = useRouter();
  const examPath = path.startsWith("/pretest");
  let redirect = null;
  if (s.ready && !s.syncing) {
    if (!s.journey) redirect = `/?next=${encodeURIComponent(path)}`;
    else if (!s.pretestDone && !examPath) redirect = "/pretest";
    else if (path.startsWith("/posttest") && !path.startsWith("/posttest/hasil") && !posttestUnlocked(s.journey)) redirect = "/camp?kunci=posttest";
  }
  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);
  return { allowed: s.ready && !s.syncing && !redirect, store: s, path };
}

export function AppShell({ children }) {
  const { allowed, store, path } = useGuard();
  if (!allowed) return <LoadingScreen />;
  const navOn = store.pretestDone;

  return (
    <div className="min-h-dvh overflow-x-clip bg-jungle motif-daun md:flex">
      {/* navigasi samping (tablet/desktop) */}
      {navOn && (
        <aside className="sticky top-0 hidden print:!hidden h-dvh w-24 shrink-0 flex-col items-center gap-2 border-r-4 border-bark bg-[linear-gradient(180deg,#5a3a28,#3e2718)] py-4 md:flex lg:w-28">
          <Link href="/camp" aria-label="Ke Camp" className="mb-3 flex flex-col items-center gap-1 text-center">
            <Compass size={40} />
            <span className="font-display text-[11px] font-extrabold leading-tight tracking-wide text-sun">
              JEJAK SANG
              <br />
              EKSPONEN
            </span>
          </Link>
          {NAV.map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`btn-game flex w-20 flex-col items-center gap-1 rounded-2xl border-2 py-2.5 font-display text-sm font-bold ${
                  active ? "border-sun bg-orange text-[#4a2410] shadow-[0_4px_0_#a3521c]" : "border-transparent text-cream hover:bg-white/10"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <n.icon size={22} />
                {n.label}
              </Link>
            );
          })}
        </aside>
      )}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 print:hidden flex items-center justify-between gap-2 border-b-4 border-bark bg-jungle/95 motif-daun px-3 py-2 backdrop-blur sm:px-5">
          <Link href={navOn ? "/camp" : "/"} className={navOn ? "md:invisible" : ""} aria-label="Beranda">
            <Logo compact hideTextOnMobile />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {navOn && (
              <Link
                href="/profil"
                className="flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-2.5 py-1 text-cream"
                title="XP dan permata"
              >
                <span className="rounded-full bg-sun px-2 font-display text-xs font-extrabold text-jungle">Lv {store.level.level}</span>
                <span className="whitespace-nowrap font-display text-sm font-bold">{store.xp} XP</span>
                <span className="hidden items-center gap-1 font-display text-sm font-bold sm:flex">
                  <Gem size={16} /> {store.gems}
                </span>
              </Link>
            )}
            <TopControls dark />
          </div>
        </header>

        <main className={`flex flex-1 flex-col ${navOn ? "pb-24 md:pb-0" : ""}`}>
          <div className="flex-1">{children}</div>
          <AppFooter />
        </main>
      </div>

      {/* navigasi bawah (smartphone) */}
      {navOn && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 print:hidden border-t-4 border-bark bg-[linear-gradient(180deg,#6b4630,#3e2718)] px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
          aria-label="Navigasi utama"
        >
          <ul className="mx-auto flex max-w-lg justify-between">
            {NAV.map((n) => {
              const active = path.startsWith(n.href);
              return (
                <li key={n.href} className="flex-1">
                  <Link
                    href={n.href}
                    className={`mx-0.5 my-1.5 flex flex-col items-center gap-0.5 rounded-xl py-1.5 font-display text-xs font-bold transition ${
                      active ? "-translate-y-1 bg-orange text-[#4a2410] shadow-[0_4px_0_#a3521c]" : "text-cream"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <n.icon size={22} />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
