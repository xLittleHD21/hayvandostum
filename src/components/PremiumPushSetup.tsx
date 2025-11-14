// src/components/PremiumPushSetup.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function PremiumPushSetup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check Notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setEnabled(Notification.permission === "granted");
    }
  }, []);

  async function enablePush() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Önce giriş yapın");
        return;
      }

      // Check premium
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profile?.plan !== "premium") {
        toast.error("Bu özellik Premium kullanıcılar içindir");
        return;
      }

      // Ask permission
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Bildirim izni verilmedi");
        return;
      }

      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error("VAPID_PUBLIC_KEY eksik");
        return;
      }
      const appServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });
      const subJSON = sub.toJSON();

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subJSON }),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || "Abonelik kaydedilemedi");
      }

      setEnabled(true);
      toast.success("Bildirimler etkinleştirildi");
    } catch (e: any) {
      toast.error(e.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Günlük Bildirimler (Premium)</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Yarın vadesi olan hatırlatıcılar için Web Push bildirimi alın.
          </p>
        </div>
        <button
          onClick={enablePush}
          disabled={loading || enabled}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold ${
            enabled
              ? "bg-green-600 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          } disabled:opacity-60`}
        >
          {enabled ? "Etkin" : loading ? "Etkinleştiriliyor..." : "Etkinleştir"}
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}