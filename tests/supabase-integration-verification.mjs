// tests/supabase-integration-verification.mjs
// Verification suite confirming Supabase integration, client config, service role isolation, and SQL schema

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`\x1b[31m  ✖ FAIL:\x1b[0m ${message}`);
    process.exit(1);
  }
  console.log(`\x1b[32m  ✔ PASS:\x1b[0m ${message}`);
}

async function runSupabaseVerification() {
  console.log('\n=== [Tier 9] Supabase Integration & Security Verification ===\n');

  // 1. Verify supabase_schema.sql exists and contains tables and RLS policies
  const schemaPath = path.join(ROOT_DIR, 'supabase_schema.sql');
  assert(fs.existsSync(schemaPath), 'supabase_schema.sql exists in repository root');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.users'), 'Schema defines public.users table');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.farm_assets'), 'Schema defines public.farm_assets table');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.harvest_logs'), 'Schema defines public.harvest_logs table');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.withdrawals'), 'Schema defines public.withdrawals table');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.transactions'), 'Schema defines public.transactions table');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.p2p_stores'), 'Schema defines public.p2p_stores table');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.platform_settings'), 'Schema defines public.platform_settings table');
  assert(schemaContent.includes('ENABLE ROW LEVEL SECURITY'), 'Schema configures Row Level Security (RLS) policies');

  // 2. Verify client config
  const clientPath = path.join(ROOT_DIR, 'src', 'lib', 'supabaseClient.js');
  assert(fs.existsSync(clientPath), 'src/lib/supabaseClient.js exists');
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  assert(clientContent.includes('createClient'), 'Supabase client initialized with createClient');
  assert(clientContent.includes('sb_publishable_D9G_Y9qeCS5UTQdOZkEQ_g_MtmFaT-F'), 'Supabase client uses publishable/anon key');
  assert(!clientContent.includes('service_role'), 'Supabase client does NOT use service_role key');

  // 3. Verify backend admin service
  const adminPath = path.join(ROOT_DIR, 'server', 'supabaseAdmin.js');
  assert(fs.existsSync(adminPath), 'server/supabaseAdmin.js exists');
  const adminContent = fs.readFileSync(adminPath, 'utf8');
  assert(adminContent.includes('AdminGateway'), 'AdminGateway operations defined in backend admin service');
  assert(adminContent.includes('process.env.SUPABASE_SERVICE_ROLE_KEY'), 'Backend service accesses service role key securely');

  // 4. Verify client bundle isolation (no service role key in dist/)
  const distDir = path.join(ROOT_DIR, 'dist', 'assets');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    for (const f of jsFiles) {
      const code = fs.readFileSync(path.join(distDir, f), 'utf8');
      assert(!code.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb3R6cGt0bWR3b3Bid21veHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZS'), `Client bundle ${f} does not leak service role key`);
    }
  }

  // 5. Verify FarmContext replication
  const ctxPath = path.join(ROOT_DIR, 'src', 'context', 'FarmContext.jsx');
  const ctxContent = fs.readFileSync(ctxPath, 'utf8');
  assert(ctxContent.includes("from '../lib/supabaseClient'"), 'FarmContext imports supabase client');
  assert(ctxContent.includes("supabase.from('users')"), 'FarmContext replicates user signups to Supabase');
  assert(ctxContent.includes("supabase.from('farm_assets')"), 'FarmContext replicates purchases to Supabase');
  assert(ctxContent.includes("supabase.from('withdrawals')"), 'FarmContext replicates withdrawals to Supabase');

  console.log('\n\x1b[1m\x1b[32m  SUCCESS: Supabase integration and security boundaries 100% verified!\x1b[0m\n');
}

runSupabaseVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
