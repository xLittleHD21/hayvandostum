import OpenAI from "openai";
import { createSupabaseServerComponent } from "@/lib/supabaseServer";

export async function getOpenAIForUser(userId?: string) {
  let apiKey = process.env.OPENAI_API_KEY;

  if (userId) {
    const supabase = createSupabaseServerComponent();
    const { data: profile } = await supabase
      .from("profiles")
      .select("openai_api_key")
      .eq("id", userId)
      .single();

    if (profile?.openai_api_key) {
      apiKey = profile.openai_api_key;
    }
  }

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing. Set env or add profile key.");
  }

  return new OpenAI({ apiKey });
}