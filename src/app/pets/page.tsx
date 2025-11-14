// src/app/pets/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import PetCard from "@/components/PetCard";
import Link from "next/link";
import { PetsRow } from "@/lib/types";

export default async function PetsPage() {
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Hayvanlarım</h2>
          <Link
            href="/pets/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Hayvan Ekle
          </Link>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {pets.map((p) => (
            <PetCard key={p.id} pet={p as PetsRow} />
          ))}
        </div>
      </div>
    </div>
  );
}