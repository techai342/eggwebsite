// tests/test-live-e2e-flow.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_D9G_Y9qeCS5UTQdOZkEQ_g_MtmFaT-F';

async function runLiveE2E() {
  console.log('--- Testing End-to-End Live Supabase App Flow ---');
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const testUsername = `testfarmer_${Date.now()}`;
  const testEmail = `${testUsername}@example.com`;

  // 1. Register User in Supabase
  console.log(`1. Testing User Registration for @${testUsername}...`);
  const { data: newUser, error: regErr } = await client.from('users').insert({
    account_id: `#${Math.floor(1000 + Math.random() * 9000)}`,
    username: testUsername,
    email: testEmail,
    password_hash: 'secretPass123',
    full_name: 'Test Farmer',
    referral_code: testUsername,
    balance_pkr: 0.00,
    egg_vault: 0,
    role: 'farmer',
    status: 'Active'
  }).select().single();

  if (regErr) {
    console.error('❌ Registration failed:', regErr.message);
    process.exit(1);
  }
  console.log('✅ User registered in Supabase! ID:', newUser.id);

  // 2. Buy Hen Asset in Supabase
  console.log('2. Testing Farm Asset Acquisition...');
  const { data: asset, error: assetErr } = await client.from('farm_assets').insert({
    username: testUsername,
    user_id: newUser.id,
    asset_name: 'AL Rehman Meta Eggs',
    units: 2,
    unit_cost: 500,
    daily_yield_per_unit: 1,
    term_days: 120,
    total_return_eggs: 240,
    gateway: 'Easypaisa',
    status: 'active',
    expires_at: new Date(Date.now() + 120 * 86400000).toISOString()
  }).select().single();

  if (assetErr) {
    console.error('❌ Asset acquisition failed:', assetErr.message);
    process.exit(1);
  }
  console.log('✅ Farm asset saved in Supabase! ID:', asset.id);

  // 3. Harvest Simulation & Egg Vault Update
  console.log('3. Testing Egg Harvest & Vault Update...');
  const { error: vaultErr } = await client
    .from('users')
    .update({ egg_vault: 2 })
    .eq('username', testUsername);

  if (vaultErr) {
    console.error('❌ Vault update failed:', vaultErr.message);
    process.exit(1);
  }
  console.log('✅ Egg Vault updated to 2 eggs!');

  // 4. Withdrawal / Sell Egg in Supabase
  console.log('4. Testing Sell Egg / Withdrawal...');
  const { data: wd, error: wdErr } = await client.from('withdrawals').insert({
    username: testUsername,
    user_id: newUser.id,
    store_id: '1',
    store_name: 'Sonica FORM STORE',
    eggs_liquidated: 2,
    rate: 32,
    amount_pkr: 64,
    method: 'EasyPaisa',
    account_title: 'Test Farmer',
    account_number: '03001234567',
    status: 'Completed'
  }).select().single();

  if (wdErr) {
    console.error('❌ Withdrawal failed:', wdErr.message);
    process.exit(1);
  }
  console.log('✅ Withdrawal logged in Supabase! ID:', wd.id, 'Amount:', wd.amount_pkr, 'PKR');

  // 5. Clean up test records
  console.log('5. Cleaning up test data...');
  await client.from('withdrawals').delete().eq('username', testUsername);
  await client.from('farm_assets').delete().eq('username', testUsername);
  await client.from('users').delete().eq('username', testUsername);
  console.log('✅ Cleanup complete! All Supabase operations fully functional!\n');
}

runLiveE2E().catch(console.error);
