// src/app/api/push/subscribe/route.ts
import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabaseServer";

export const runtime = "edge";

type PushSubscriptionJSON = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseRouteHandler();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan !== "premium") {
      return NextResponse.json({ error: "Premium gerekli" }, { status: 403 });
    }

    const body = (await req.json()) as { subscription: PushSubscriptionJSON };
    const sub = body?.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: "Subscription eksik" }, { status: 400 });
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh!, auth: sub.keys.auth! },
        { onConflict: "user_id,endpoint" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}