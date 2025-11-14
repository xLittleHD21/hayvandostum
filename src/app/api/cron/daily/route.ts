// src/app/api/cron/daily/route.ts
import { createSupabaseRouteHandler } from "@/lib/supabaseServer";
import webpush from "web-push";

export const runtime = "nodejs"; // web-push uses node crypto

export async function GET() {
  const supabase = createSupabaseRouteHandler();

  // Configure VAPID
  const publicKey = process.env.VAPID_PUBLIC_KEY!;
  const privateKey = process.env.VAPID_PRIVATE_KEY!;
  if (!publicKey || !privateKey) {
    return new Response("VAPID keys missing", { status: 500 });
  }
  webpush.setVapidDetails("mailto:no-reply@hayvandostum.app", publicKey, privateKey);

  try {
    // Compute 'tomorrow' in Europe/Istanbul
    const nowTR = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
    );
    const tomorrowTR = new Date(nowTR);
    tomorrowTR.setDate(nowTR.getDate() + 1);
    const yyyy = tomorrowTR.getFullYear();
    const mm = String(tomorrowTR.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrowTR.getDate()).padStart(2, "0");
    const tomorrowDateStr = `${yyyy}-${mm}-${dd}`; // matches reminders.due_date

    // Fetch reminders due tomorrow and not completed
    const { data: reminders } = await supabase
      .from("reminders")
      .select("id,user_id,pet_id,type,title,due_at,due_date,completed")
      .eq("due_date", tomorrowDateStr)
      .eq("completed", false);

    if (!reminders || reminders.length === 0) {
      return new Response("No reminders", { status: 200 });
    }

    // Group by user_id
    const byUser: Record<string, typeof reminders> = {};
    for (const r of reminders) {
      (byUser[r.user_id] ||= []).push(r);
    }

    // For each user, fetch pets and push subscriptions
    for (const userId of Object.keys(byUser)) {
      const [petsRes, subsRes] = await Promise.all([
        supabase.from("pets").select("id,name,pet_type").eq("user_id", userId),
        supabase.from("push_subscriptions").select("*").eq("user_id", userId),
      ]);

      const pets = (petsRes.data ?? []).reduce<Record<string, { name: string; pet_type: string }>>((acc, p: any) => {
        acc[p.id] = { name: p.name, pet_type: p.pet_type };
        return acc;
      }, {});
      const subs = subsRes.data ?? [];

      // Create messages for each reminder
      const messages = byUser[userId].map((r) => {
        const pet = pets[r.pet_id];
        const petName = pet?.name || "Evcil Dostunuz";
        const typeLabel =
          r.type === "vaccine" ? "aşı" :
          r.type === "checkup" ? "kontrol" :
          r.type === "grooming" ? "bakım" : "mama";
        const title = "Hatırlatma";
        const body = `${petName} için ${typeLabel} yarın!`;
        return { title, body };
      });

      // Send to all subscriptions
      for (const sub of subs) {
        const subscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };
        for (const msg of messages) {
          try {
            await webpush.sendNotification(subscription as any, JSON.stringify(msg));
          } catch (e) {
            // If subscription is gone, you may delete it
            console.error("WebPush send error", e);
          }
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(e.message || "Server error", { status: 500 });
  }
}