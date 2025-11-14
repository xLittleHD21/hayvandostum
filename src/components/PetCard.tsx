// src/components/PetCard.tsx
import Link from "next/link";
import { PetsRow } from "@/lib/types";
import { PawPrint } from "lucide-react";

export default function PetCard({ pet }: { pet: PetsRow }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
      <div className="flex items-center gap-3">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <PawPrint className="h-6 w-6 text-indigo-600" />
          </div>
        )}
        <div>
          <div className="font-semibold">{pet.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {pet.pet_type} · {pet.breed || "Cins Bilinmiyor"} ·{" "}
            {pet.age ?? "Yaş Bilinmiyor"}
          </div>
        </div>
        <div className="ml-auto">
          <Link
            href={`/pets/${pet.id}/edit`}
            className="text-indigo-600 hover:underline text-sm"
          >
            Düzenle
          </Link>
        </div>
      </div>
      {pet.notes && (
        <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          {pet.notes}
        </div>
      )}
    </div>
  );
}