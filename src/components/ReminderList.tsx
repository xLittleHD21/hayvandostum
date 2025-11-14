// src/components/ReminderList.tsx
import { RemindersRow, PetsRow } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ReminderList({
  reminders,
  petsById,
}: {
  reminders: RemindersRow[];
  petsById: Record<string, PetsRow>;
}) {
  if (reminders.length === 0) {
    return (
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Yaklaşan hatırlatıcı yok.
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {reminders.map((r) => {
        const pet = petsById[r.pet_id];
        return (
          <li
            key={r.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4"
          >
            <div className="font-medium">
              {r.title || r.type} · {pet?.name} ({pet?.pet_type})
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {formatDate(r.due_at)}
              {r.notes ? ` · ${r.notes}` : ""}
            </div>
          </li>
        );
      })}
    </ul>
  );
}