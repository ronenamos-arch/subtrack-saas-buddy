import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Robust browser Supabase client with fallbacks
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || (PROJECT_ID ? `https://${PROJECT_ID}.supabase.co` : undefined);
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Debug logging
console.log('[Supabase] Environment check:', {
  hasProjectId: !!PROJECT_ID,
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_PUBLISHABLE_KEY,
  url: SUPABASE_URL,
});

if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
  console.error('[Supabase] Missing URL. Set VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID.');
  throw new Error('Supabase URL is missing.');
}

if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY === 'undefined') {
  console.error('[Supabase] Missing publishable key. Set VITE_SUPABASE_PUBLISHABLE_KEY.');
  throw new Error('Supabase publishable key is missing.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});
