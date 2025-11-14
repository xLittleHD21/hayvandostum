// src/app/api/pets/upload/route.ts
import { NextRequest } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabaseServer";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseRouteHandler();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return new Response("No file", { status: 400 });

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("pet-photos")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  const { data: urlData } = supabase.storage
    .from("pet-photos")
    .getPublicUrl(data.path);

  return new Response(JSON.stringify({ url: urlData.publicUrl }), {
    headers: { "Content-Type": "application/json" }
  });
}