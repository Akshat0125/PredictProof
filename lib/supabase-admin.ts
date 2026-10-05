// SERVER-ONLY — never import this file in a 'use client' component.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

// Ensure environment variables from .env.local are loaded when running in CLI/scripts
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  loadEnvConfig(process.cwd());
}

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables. Please configure them in your environment settings."
    );
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return _supabaseAdmin;
}

// Proxy wrapper so existing code `supabaseAdmin.from(...)` works seamlessly without top-level evaluation crashes during build
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getSupabaseAdmin();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
