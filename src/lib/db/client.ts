import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** Public/anon client for read-only operations */
export function getPublicClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Service-role client for writes and admin operations (server-side only) */
export function getServiceClient(): SupabaseClient {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Singleton instances for reuse within a request
let _publicClient: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

export function getReadClient(): SupabaseClient {
  if (!_publicClient) _publicClient = getPublicClient();
  return _publicClient;
}

export function getWriteClient(): SupabaseClient {
  if (!_serviceClient) _serviceClient = getServiceClient();
  return _serviceClient;
}
