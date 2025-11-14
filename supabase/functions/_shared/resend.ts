// supabase/functions/_shared/resend.ts
// Deno module for sending email via Resend
// @ts-nocheck
import { Resend } from "npm:resend@3.4.0";

export function createResend() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }
  return new Resend(apiKey);
}