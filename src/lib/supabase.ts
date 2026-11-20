import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  alias: string;
  streak_start: string;
  created_at: string;
}

export interface GroupMessageRow {
  id: string;
  user_id: string;
  alias: string;
  content: string;
  created_at: string;
}

export interface ConnectionRow {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  other_profile?: Profile;
}

export interface DirectMessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
