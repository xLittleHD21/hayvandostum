// src/components/ReminderForm.tsx
"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ReminderType, RecurrenceType, PetsRow, RemindersRow } from "@/lib/types";

export default function ReminderForm({
  pets,
  initial,
}: {
  pets: PetsRow[];
  initial?: Partial<RemindersRow>;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [petId, setPetId] = useState(initial?.pet_id || (pets[0]?.id ?? ""));
  const [type, setType] = useState<ReminderType>(
    (initial?.type as ReminderType) || "vaccine"
  );
  const [title, setTitle] = useState(initial?.title || "");
  const [dueAt, setDueAt] = useState(
    initial?.due_at ? initial?.due_at.slice(0, 16) : ""
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    (initial?.recurrence as RecurrenceType) || "none"
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Giriş gerekli");
        return;
      }

      if (initial?.id) {
        const { error } = await supabase
          .from("reminders")
          .update({
            pet_id: petId,
            type,
            title: title || null,
            due_at: new Date(dueAt).toISOString(),
            recurrence,
            notes: notes || null,
          })
          .eq("id", initial.id);
        if (error) throw error;
        toast.success("Hatırlatıcı güncellendi");
      } else {
        const { error } = await supabase.from("reminders").insert({
          user_id: user.id,
          pet_id: petId,
          type,
          title: title || null,
          due_at: new Date(dueAt).toISOString(),
          recurrence,
          notes: notes || null,
        });
        if (error) throw error;
        toast.success("Hatırlatıcı eklendi");
      }
      router.push("/reminders");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Hayvan</label>
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
      <div>
        <label className="block text-sm font-medium">Tür</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ReminderType)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        >
          <option value="vaccine">Aşı</option>
          <option value="checkup">Kontrol</option>
          <option value="grooming">Bakım</option>
          <option value="food">Mama</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Başlık</label>
        <input
          value={title ?? ""}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Tarih/Saat</label>
        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Tekrar</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        >
          <option value="none">Yok</option>
          <option value="weekly">Haftalık</option>
          <option value="monthly">Aylık</option>
          <option value="yearly">Yıllık</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Notlar</label>
        <textarea
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {initial?.id ? "Kaydet" : "Ekle"}
      </button>
    </form>
  );
}