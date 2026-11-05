// src/lib/supabaseClient.js
// Official Supabase Client for AL Rehman Meta Eggs (Public Client)
// Configured with Public Publishable Key for Client-side Operations

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_D9G_Y9qeCS5UTQdOZkEQ_g_MtmFaT-F';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;
