// src/app/pets/new/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import PetForm from "@/components/PetForm";

export default async function NewPetPage() {
  const supabase = createSupabaseServerComponent();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Hayvan Ekle</h2>
        <PetForm />
      </div>
    </div>
  );
}