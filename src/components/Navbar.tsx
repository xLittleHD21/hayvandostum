// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { PawPrint, CalendarDays, Bot, User, Home } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Çıkış yapılamadı");
    } else {
      toast.success("Çıkış yapıldı");
      window.location.href = "/";
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Ana Sayfa", icon: Home },
    { href: "/pets", label: "Hayvanlarım", icon: PawPrint },
    { href: "/reminders", label: "Hatırlatıcılar", icon: CalendarDays },
    { href: "/chat", label: "AI Tavsiye", icon: Bot },
    { href: "/vision", label: "Görsel Analiz", icon: Bot }, // yeni
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/logo.svg" alt="HayvanDostum" className="h-8 w-8" />
          <span className="font-semibold text-lg">HayvanDostum</span>
        </Link>
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-2 inline-flex items-center px-3 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
}