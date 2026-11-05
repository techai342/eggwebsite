import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb3R6cGt0bWR3b3Bid21veHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg1NTcxOCwiZXhwIjoyMTA5NDMxNzE4fQ.xIUaVgi5bCu9zTDQkglE_stzGGJF8gy8ocundw4JgYA';

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await adminClient.rpc('exec_sql', { sql: 'SELECT 1;' });
  console.log('rpc result:', error ? error.message : data);
}

run();
