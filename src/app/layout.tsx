import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FontSizeToggle } from "@/components/font-size-toggle";
import { VersionBadge } from "@/components/version-badge";
import { PwaRegister } from "@/components/pwa-register";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fazenda Nascente",
  description: "Controle de gado da Fazenda Nascente",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Nascente", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-white/10 px-4 py-4 sm:px-8 sm:py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <Link href="/" className="text-2xl sm:text-3xl font-bold tracking-tight">
              Fazenda Nascente
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <Link href="/" className="text-lg sm:text-xl hover:text-accent">Início</Link>
              <Link href="/animais" className="text-lg sm:text-xl hover:text-accent">Animais</Link>
              <FontSizeToggle />
            </nav>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <footer className="border-t border-white/10 px-4 py-4 sm:px-8 text-sm text-muted">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <span>Fazenda Nascente · controle de gado</span>
            <VersionBadge />
          </div>
        </footer>
        <PwaRegister />
      </body>
    </html>
  );
}
