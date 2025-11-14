// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import ReminderList from "@/components/ReminderList";
import PetCard from "@/components/PetCard";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import Calendar from "react-calendar";
import { upcomingWindow } from "@/lib/utils";
import { RemindersRow, PetsRow } from "@/lib/types";
import PremiumPushSetup from "@/components/PremiumPushSetup";
import { getOpenAIForUser } from "@/lib/openai";

async function fetchWeatherForIstanbul() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=41.01&longitude=28.97&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FIstanbul";
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
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

  const { now, until } = upcomingWindow(7);
  const remindersRes = await supabase
    .from("reminders")
    .select("*")
    .gte("due_at", now.toISOString())
    .lte("due_at", until.toISOString())
    .order("due_at", { ascending: true });
  const reminders = (remindersRes.data ?? []) as RemindersRow[];

  const petsById: Record<string, PetsRow> = {};
  pets.forEach((p) => (petsById[p.id] = p));

  // Premium check
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, openai_api_key")
    .eq("id", user.id)
    .single();

  // AI daily tip (server-side)
  let dailyTip: string | null = null;
  if (pets.length > 0 && (profile?.plan === "premium")) {
    try {
      const weather = await fetchWeatherForIstanbul();
      const mainPet = pets[0];
      const openai = await getOpenAIForUser(user.id);
      const sys = `Sen bir veteriner asistansın. Türkçe, kısa ve günlük öneri ver. Pet: Ad=${mainPet.name}, Tür=${mainPet.pet_type}, Cins=${mainPet.breed ?? "bilinmiyor"}, Yaş=${mainPet.age ?? "bilinmiyor"}. Hava durumu: ${JSON.stringify(weather?.daily || weather || {})}. Bugün için kısa öneri: yürüyüş süresi, oyun süresi, beslenme ipucu. Maks 1-2 cümle.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: "Bugün için öneri verir misin?" }
        ],
        temperature: 0.6
      });

      dailyTip = completion.choices?.[0]?.message?.content ?? null;
    } catch {
      dailyTip = null;
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Hoş geldin, {user.email}</h2>
            <Link
              href="/pets/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Hayvan Ekle
            </Link>
          </div>

          {profile?.plan === "premium" && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
              <h3 className="font-semibold">AI Günlük Bakım Tavsiyesi</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Hava durumuna ve pet bilgilerine göre kişisel öneri.
              </p>
              <div className="mt-3 rounded-lg bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-4">
                {dailyTip ? (
                  <div className="text-sm">
                    {dailyTip}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Öneri yüklenemedi veya premium değil.
                  </div>
                )}
              </div>
            </section>
          )}

          <section>
            <h3 className="font-semibold mb-3">Yaklaşan Hatırlatıcılar (7 gün)</h3>
            <ReminderList reminders={reminders as RemindersRow[]} petsById={petsById} />
          </section>

          <section>
            <h3 className="font-semibold mb-3">Hayvanlarım</h3>
            {pets.length === 0 ? (
              <EmptyState
                title="Henüz hayvan eklemediniz"
                description="Evcil dostunuzu ekleyerek hatırlatıcılar oluşturun."
                action={
                  <Link
                    href="/pets/new"
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    Hayvan Ekle
                  </Link>
                }
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pets.map((p) => (
                  <PetCard key={p.id} pet={p as PetsRow} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="font-semibold mb-3">Takvim</h3>
            <Calendar />
          </section>

          <PremiumPushSetup />

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
            <h3 className="font-semibold">Premium</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Premium özellikler: AI günlük öneri, web push bildirimleri ve görsel analiz.
            </p>
            <Link href="/profile" className="mt-3 inline-block text-indigo-600 hover:underline text-sm">
              Profil ayarlarından planınızı yükseltin
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}