import { createClient } from "supabase";

const supabaseUrl = Deno.env.get("SUPABASE_PROJECT_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_API_KEY") ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table name constants
export const USERS_TABLE = "users";
export const EVENTS_TABLE = "events";
export const NOTIFICATION_SETTINGS_TABLE = "notification_settings";
export const NOTIFICATION_LOGS_TABLE = "notification_logs";
