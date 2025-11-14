// src/lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/types";

// Named export - import { createSupabaseBrowserClient } from "@/lib/supabaseClient"
export function createSupabaseBrowserClient() {
  return createClientComponentClient<Database>();
}