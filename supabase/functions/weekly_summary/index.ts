// supabase/functions/weekly_summary/index.ts
// Deno Edge Function to send weekly email summaries of upcoming reminders.
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createResend } from "../_shared/resend.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function handleRequest() {
  const resend = createResend();

  const now = new Date();
  const until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*")
    .gte("due_at", now.toISOString())
    .lte("due_at", until.toISOString());

  if (error) {
    return new Response(`Error fetching reminders: ${error.message}`, { status: 500 });
  }

  // Group by user_id
  const byUser: Record<string, any[]> = {};
  (reminders || []).forEach((r) => {
    byUser[r.user_id] = byUser[r.user_id] || [];
    byUser[r.user_id].push(r);
  });

  // For each user, fetch pets and email, then send
  for (const userId of Object.keys(byUser)) {
    const remindersForUser = byUser[userId];

    const { data: pets = [] } = await supabase
      .from("pets")
      .select("id,name,pet_type")
      .eq("user_id", userId);

    const petMap: Record<string, { name: string; pet_type: string }> = {};
    pets.forEach((p: any) => (petMap[p.id] = { name: p.name, pet_type: p.pet_type }));

    // Get user email via auth.admin
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData.user?.email;
    if (!email) continue;

    const lines = remindersForUser
      .map((r) => {
        const pet = petMap[r.pet_id];
        const when = new Date(r.due_at).toLocaleString("tr-TR", {
          dateStyle: "medium",
          timeStyle: "short"
        });
        return `• ${r.title || r.type} - ${pet?.name || "Pet"} (${pet?.pet_type}) - ${when}`;
      })
      .join("\n");

    try {
      await resend.emails.send({
        from: "HayvanDostum <onboarding@resend.dev>",
        to: email,
        subject: "Haftalık Hatırlatıcı Özeti",
        text: `Merhaba,\n\nÖnümüzdeki 7 gün için hatırlatıcılarınız:\n\n${lines}\n\nSevgiler,\nHayvanDostum`
      });
    } catch (e) {
      console.error("Email send error for", email, e);
    }
  }

  return new Response("OK", { status: 200 });
}

Deno.serve(handleRequest);