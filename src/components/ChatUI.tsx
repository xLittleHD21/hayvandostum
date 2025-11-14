// src/components/ChatUI.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { PetsRow } from "@/lib/types";

export default function ChatUI({ pets }: { pets: PetsRow[] }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Merhaba! Evcil hayvanınız hakkında nasıl yardımcı olabilirim?" },
  ]);
  const [input, setInput] = useState("");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      // Use streaming from API route
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, messages }),
      });
      if (!res.ok || !res.body) {
        throw new Error("Yanıt alınamadı");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantMsg = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMsg += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          // live update: last assistant message
          const hasAssistantTail = copy[copy.length - 1]?.role === "assistant";
          if (hasAssistantTail) {
            copy[copy.length - 1] = { role: "assistant", content: assistantMsg };
          } else {
            copy.push({ role: "assistant", content: assistantMsg });
          }
          return copy;
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium">Hayvan Seçin</label>
        <select
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        >
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.pet_type})
            </option>
          ))}
        </select>
      </div>
      <div className="h-64 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-900/60">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Sorunuzu yazın..."
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Gönder
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Not: Genel tavsiye sunulur; acil durumlarda veterinerinize başvurun.
      </p>
    </div>
  );
}