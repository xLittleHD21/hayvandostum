// src/app/pets/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import PetForm from "@/components/PetForm";

export default async function EditPetPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerComponent();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: pet, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error) redirect("/pets");

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Hayvanı Düzenle</h2>
        <PetForm initial={pet!} />
      </div>
    </div>
  );
}