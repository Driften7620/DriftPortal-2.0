import { createClient } from '@supabase/supabase-js';

import { supabaseConfiguration } from './supabaseConfig';

export const supabase =
  supabaseConfiguration.isConfigured &&
  supabaseConfiguration.url &&
  supabaseConfiguration.anonKey
    ? createClient(supabaseConfiguration.url, supabaseConfiguration.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
