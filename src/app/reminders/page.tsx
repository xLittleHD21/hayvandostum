// src/app/reminders/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import ReminderForm from "@/components/ReminderForm";
import ReminderList from "@/components/ReminderList";
import { PetsRow, RemindersRow } from "@/lib/types";

export default async function RemindersPage() {
  const supabase = createSupabaseServerComponent();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const petsRes = await supabase
    .from("pets")
    .select("*")
    .order("created_at", { ascending: false });
  const pets = (petsRes.data ?? []) as PetsRow[];

  const remindersRes = await supabase
    .from("reminders")
    .select("*")
    .order("due_at", { ascending: true });
  const reminders = (remindersRes.data ?? []) as RemindersRow[];

  const petsById: Record<string, PetsRow> = {};
  pets.forEach((p) => (petsById[p.id] = p));

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Hatırlatıcı Ekle/Düzenle</h2>
          {pets.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Önce hayvan ekleyin.
            </div>
          ) : (
            <ReminderForm pets={pets as PetsRow[]} />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Tüm Hatırlatıcılar</h2>
          <ReminderList reminders={reminders as RemindersRow[]} petsById={petsById} />
        </div>
      </div>
    </div>
  );
}