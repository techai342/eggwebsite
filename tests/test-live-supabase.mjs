// tests/test-live-supabase.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_D9G_Y9qeCS5UTQdOZkEQ_g_MtmFaT-F';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb3R6cGt0bWR3b3Bid21veHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg1NTcxOCwiZXhwIjoyMTA5NDMxNzE4fQ.xIUaVgi5bCu9zTDQkglE_stzGGJF8gy8ocundw4JgYA';

async function testSupabase() {
  console.log('--- Testing Live Supabase Connection ---');
  
  // Test 1: Public Client Query
  const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Testing Public Client with publishable key...');
  
  const tables = ['users', 'p2p_stores', 'farm_assets', 'withdrawals', 'transactions', 'platform_settings'];
  for (const tbl of tables) {
    try {
      const { data, error } = await publicClient.from(tbl).select('*').limit(3);
      if (error) {
        console.log(`❌ Table [${tbl}]: Error ->`, error.message, `(code: ${error.code})`);
      } else {
        console.log(`✅ Table [${tbl}]: Found ${data.length} rows!`);
      }
    } catch (e) {
      console.log(`❌ Table [${tbl}]: Exception ->`, e.message);
    }
  }

  // Test 2: Service Role Client Query
  console.log('\nTesting Backend Admin Service Client with service role key...');
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  for (const tbl of tables) {
    try {
      const { data, error } = await adminClient.from(tbl).select('*').limit(3);
      if (error) {
        console.log(`❌ Table [${tbl}] (Admin): Error ->`, error.message);
      } else {
        console.log(`✅ Table [${tbl}] (Admin): Found ${data.length} rows!`);
      }
    } catch (e) {
      console.log(`❌ Table [${tbl}] (Admin): Exception ->`, e.message);
    }
  }
}

testSupabase();
