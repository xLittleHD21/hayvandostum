// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const [fullName, setFullName] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name ?? "");
        setOpenaiKey(data.openai_api_key ?? "");
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function saveProfile() {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        openai_api_key: openaiKey || null
      })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profil güncellendi");
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">Yükleniyor...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Profil</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ad Soyad</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            OpenAI API Anahtarı (Premium)
          </label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Anahtarınız sadece sunucuda saklanır ve AI tavsiyelerinde kullanılır.
          </p>
        </div>
        <button
          onClick={saveProfile}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}