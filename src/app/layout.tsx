import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

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
      <body className="min-h-screen">
        <main className="px-4 py-5 sm:px-6">
          <div className="max-w-2xl mx-auto">{children}</div>
        </main>
        <PwaRegister />
      </body>
    </html>
  );
}
