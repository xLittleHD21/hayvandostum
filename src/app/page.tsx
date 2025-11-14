// src/app/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";

export default async function HomePage() {
  const supabase = createSupabaseServerComponent();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              HayvanDostum
            </h1>
            <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">
              Evcil hayvan bakımını kolaylaştırın. Hatırlatıcılar, takvim ve
              yapay zekâ destekli tavsiyeler ile kedi ve köpeğinizin
              ihtiyaçlarını takip edin.
            </p>
            <ul className="mt-6 space-y-2 text-slate-700 dark:text-slate-300">
              <li>• Aşı, veteriner kontrolü, bakım ve mama hatırlatıcıları</li>
              <li>• Takvim görünümü ve haftalık özet e-posta</li>
              <li>• Yapay zekâ ile kişiselleştirilmiş tavsiyeler (Türkçe)</li>
              <li>• Güvenli, mobil uyumlu, Türkçe arayüz</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition"
              >
                Ücretsiz Kaydol
              </a>
              <a
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-3 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Giriş Yap
              </a>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Premium: Gelişmiş AI tavsiye ve daha fazla özelleştirme (yakında).
            </p>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 shadow-lg">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-200 to-indigo-200 dark:from-slate-800 dark:to-indigo-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
                <div className="text-center">
                  <div className="text-6xl">🐶🐱</div>
                  <div className="mt-3 font-medium">
                    Kedi ve Köpek Dostlarınız için
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Hatırlatıcılarınızı yönetin ve veteriner asistanından tavsiye
                alın.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
            <h3 className="font-semibold">Hatırlatıcılar</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Aşı, kontrol, bakım ve mama zamanlarını takip edin.
            </p>
          </div>
          <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
            <h3 className="font-semibold">Takvim ve E-posta</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Haftalık özet e-postalar ve yaklaşan hatırlatıcılar.
            </p>
          </div>
          <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
            <h3 className="font-semibold">AI Tavsiye</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Veteriner asistanı Türkçe cevap verir, acil durumlarda veterineri
              önerir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}