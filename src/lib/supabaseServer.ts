import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/types";

export function createSupabaseServerComponent() {
  return createServerComponentClient<Database>({ cookies });
}

export function createSupabaseRouteHandler() {
  return createRouteHandlerClient<Database>({ cookies });
}