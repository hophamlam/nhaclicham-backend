import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

export const SUPABASE_URL = Deno.env.get("SUPABASE_PROJECT_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_API_KEY") ?? "";
const serviceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  "";

if (!SUPABASE_URL || !anonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Use service role key if available (edge functions environment)
const usedKey = serviceKey || anonKey;

export const supabase = createClient(SUPABASE_URL, usedKey);

// Table name constants
export const PROFILES_TABLE = "profiles";
export const EVENTS_TABLE = "events";
export const NOTIFICATION_SETTINGS_TABLE = "notification_settings";
export const NOTIFICATION_LOGS_TABLE = "notification_logs";
