import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_D9G_Y9qeCS5UTQdOZkEQ_g_MtmFaT-F';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data: d1, error: e1 } = await client.from('deposit_requests').select('*').limit(1);
  console.log('deposit_requests:', e1 ? e1.message : 'exists!');

  const { data: d2, error: e2 } = await client.from('payment_gateways').select('*').limit(1);
  console.log('payment_gateways:', e2 ? e2.message : 'exists!');
}

check();
