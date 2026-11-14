import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/store/ProgressProvider";
import { RewardToaster } from "@/components/layout/RewardToaster";
import { MotionSync } from "@/components/layout/MotionSync";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", weight: ["500", "600", "700", "800"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "JEJAK SANG EKSPONEN — Ikuti Jejaknya, Taklukkan Kekuatan Pangkat!",
  description:
    "Media pembelajaran interaktif berbentuk petualangan hutan untuk memahami sifat-sifat bilangan berpangkat (SMP kelas VIII) bersama Naru dan Kaciro.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173F2A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">
        <ProgressProvider>
          <MotionSync />
          {children}
          <RewardToaster />
        </ProgressProvider>
      </body>
    </html>
  );
}
