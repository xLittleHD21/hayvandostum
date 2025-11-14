// src/app/chat/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import ChatUI from "@/components/ChatUI";
import { PetsRow } from "@/lib/types";

export default async function ChatPage() {
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

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">AI Tavsiye</h2>
        {pets.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Önce bir hayvan ekleyin.
          </div>
        ) : (
          <ChatUI pets={pets as PetsRow[]} />
        )}
      </div>
    </div>
  );
}