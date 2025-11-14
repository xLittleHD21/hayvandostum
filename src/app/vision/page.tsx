// src/app/vision/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function VisionPage() {
  const supabase = createSupabaseBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setIsPremium(profile?.plan === "premium");
    })();
  }, [supabase]);

  async function analyze() {
    if (!file) return toast.error("Önce fotoğraf seçin");
    if (!isPremium) return toast.error("Bu özellik Premium kullanıcılar içindir");

    setLoading(true);
    setResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || "Analiz yapılamadı");
      }
      const data = await res.json();
      setResult(data.text);
    } catch (e: any) {
      toast.error(e.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Görsel Analiz (Premium)</h2>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Pet fotoğrafında sağlık sorunu, kızarıklık, şişlik, tüy dökülmesi vb. var mı? Türkçe, kısa yanıt.
        </p>
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </div>
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Önizleme" className="max-h-64 rounded-lg border" />
          </div>
        )}
        <div className="mt-4">
          <button
            onClick={analyze}
            disabled={loading || !file || !isPremium}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Analiz ediliyor..." : "Analiz Et"}
          </button>
        </div>
        {result && (
          <div className="mt-4 rounded-lg bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-4 text-sm">
            {result}
          </div>
        )}
        {!isPremium && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Bu özellik yalnızca Premium plan için açıktır.
          </p>
        )}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]; // strip data URL header
      res(base64);
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}