// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    // Create profile row
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: name || null
      });
    }
    toast.success("Kayıt başarılı. Giriş yapın.");
    window.location.href = "/auth/login";
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Kaydol</h1>
      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Ad Soyad (opsiyonel)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition w-full"
        >
          Kaydol
        </button>
      </form>
      <p className="mt-4 text-sm">
        Zaten hesabınız var mı?{" "}
        <a href="/auth/login" className="text-indigo-600 hover:underline">
          Giriş yapın
        </a>
      </p>
    </div>
  );
}