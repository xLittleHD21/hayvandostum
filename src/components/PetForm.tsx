// src/components/PetForm.tsx
"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PetsRow, PetType } from "@/lib/types";

export default function PetForm({
  initial,
}: {
  initial?: Partial<PetsRow>;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [name, setName] = useState(initial?.name || "");
  const [petType, setPetType] = useState<PetType>(
    (initial?.pet_type as PetType) || "kedi"
  );
  const [breed, setBreed] = useState(initial?.breed || "");
  const [age, setAge] = useState<number | undefined>(
    initial?.age !== null && initial?.age !== undefined ? initial?.age : undefined
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadPhoto(userId: string) {
    if (!photo) return undefined;
    const fileExt = photo.name.split(".").pop();
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("pet-photos")
      .upload(filePath, photo, {
        contentType: photo.type,
        upsert: false,
      });
    if (error) {
      toast.error("Fotoğraf yüklenemedi");
      return undefined;
    }
    const { data: urlData } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  }

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
      const photoUrl = await uploadPhoto(user.id);

      if (initial?.id) {
        const { error } = await supabase
          .from("pets")
          .update({
            name,
            pet_type: petType,
            breed: breed || null,
            age: age ?? null,
            notes: notes || null,
            photo_url: photoUrl ?? initial.photo_url ?? null,
          })
          .eq("id", initial.id);
        if (error) throw error;
        toast.success("Hayvan güncellendi");
        router.push("/pets");
        router.refresh();
      } else {
        const { error } = await supabase.from("pets").insert({
          user_id: user.id,
          name,
          pet_type: petType,
          breed: breed || null,
          age: age ?? null,
          notes: notes || null,
          photo_url: photoUrl ?? null,
        });
        if (error) throw error;
        toast.success("Hayvan eklendi");
        router.push("/pets");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Adı</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Tür</label>
        <select
          value={petType}
          onChange={(e) => setPetType(e.target.value as PetType)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        >
          <option value="kedi">Kedi</option>
          <option value="köpek">Köpek</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Cins</label>
        <input
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Yaş</label>
        <input
          type="number"
          min={0}
          value={age ?? ""}
          onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
          className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        />
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
      <div>
        <label className="block text-sm font-medium">Fotoğraf</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="mt-1"
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