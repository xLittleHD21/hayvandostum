// src/app/api/vision/route.ts
import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabaseServer";
import { getOpenAIForUser } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseRouteHandler();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Premium check
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    if (profile?.plan !== "premium") {
      return NextResponse.json({ error: "Premium gerekli" }, { status: 403 });
    }

    const body = await req.json();
    const base64 = body?.image as string | undefined;
    if (!base64) return NextResponse.json({ error: "Görsel eksik" }, { status: 400 });

    const openai = await getOpenAIForUser(user.id);

    const prompt = "Bu fotoğrafta sağlık sorunu var mı? Kızarıklık, şişlik, tüy dökülmesi var mı? Türkçe, kısa cevap ver.";
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Sen bir veteriner asistansın. Türkçe ve kısa cevap ver."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64}`
            }
          ] as any
        }
      ],
      temperature: 0.2
    });

    const text = resp.choices?.[0]?.message?.content ?? "Yanıt alınamadı";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}