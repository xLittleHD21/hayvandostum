import { createSupabaseRouteHandler } from "@/lib/supabaseServer";
import { getOpenAIForUser } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseRouteHandler();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { petId, messages } = body as {
      petId: string;
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const { data: pet } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    const openai = await getOpenAIForUser(user.id);

    const systemPrompt = `Sen bir veteriner asistansın. Türkçe cevap ver. Kullanıcının şu hayvanı var: Ad: ${pet?.name}, Tür: ${pet?.pet_type}, Cins: ${pet?.breed ?? "bilinmiyor"}, Yaş: ${pet?.age ?? "bilinmiyor"}. Güvenli, genel tavsiye ver, acil durumlarda veteriner(e) gitmeyi söyle.`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ] as any;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      stream: true
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resp) {
            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) controller.enqueue(new TextEncoder().encode(delta));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (err: any) {
    return new Response(err.message || "Server error", { status: 500 });
  }
}