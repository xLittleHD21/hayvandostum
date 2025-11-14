// src/app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hayvandostum.vercel.app"),
  title: "HayvanDostum - Evcil Hayvan Bakım Hatırlatmaları",
  description:
    "HayvanDostum; kedi ve köpek sahipleri için hatırlatıcılar, takvim ve yapay zekâ destekli tavsiye sunar.",
  keywords: [
    "evcil hayvan",
    "kedi",
    "köpek",
    "hatırlatıcı",
    "veteriner",
    "AI tavsiye",
    "Türkiye"
  ],
  openGraph: {
    title: "HayvanDostum - Evcil Hayvan Bakım Hatırlatmaları",
    description:
      "Kedi ve köpek sahipleri için hatırlatıcılar ve yapay zekâ destekli tavsiyeler.",
    url: "https://hayvandostum.vercel.app",
    siteName: "HayvanDostum",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "HayvanDostum"
      }
    ],
    locale: "tr_TR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "HayvanDostum",
    description:
      "Evcil hayvan bakım hatırlatmaları ve AI tavsiye uygulaması.",
    images: ["/logo.svg"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-screen bg-gradient-to-br from-pink-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="HayvanDostum" className="h-8 w-8" />
              <span className="font-semibold text-lg">HayvanDostum</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Beta
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} HayvanDostum · Kedi ve köpekleriniz için
            hatırlatıcılar ve AI tavsiyeler.
          </div>
        </footer>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}