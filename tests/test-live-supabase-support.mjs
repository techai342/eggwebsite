// tests/test-live-supabase-support.mjs
// Verifies live Supabase support_messages CRUD operations

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_D9G_Y9qeCS5UTQdOZkEQ_g_MtmFaT-F';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLiveSupport() {
  console.log('\n--- 1. Testing Live Supabase Insert ---');
  const testUserId = 'test_farmer_9999';
  const insertPayload = {
    user_id: testUserId,
    sender_role: 'farmer',
    sender_name: 'Test Farmer Live',
    sender_email: 'farmer@live.test',
    message: 'Hello Admin! Testing live Supabase support chat desk integration.',
    is_read: false,
    is_edited: false
  };

  const { data: inserted, error: insertErr } = await client
    .from('support_messages')
    .insert([insertPayload])
    .select()
    .single();

  if (insertErr) {
    console.error('Insert error:', insertErr);
    process.exit(1);
  }
  console.log('✔ Inserted successfully, Row ID:', inserted.id, 'Message:', inserted.message);

  console.log('\n--- 2. Testing Live Supabase Read ---');
  const { data: rows, error: selectErr } = await client
    .from('support_messages')
    .select('*')
    .eq('user_id', testUserId);

  if (selectErr) {
    console.error('Select error:', selectErr);
    process.exit(1);
  }
  console.log('✔ Read successfully, Rows count:', rows.length);

  console.log('\n--- 3. Testing Live Supabase Update (Edit Message) ---');
  const { data: updated, error: updateErr } = await client
    .from('support_messages')
    .update({ message: 'Updated message by farmer!', is_edited: true })
    .eq('id', inserted.id)
    .select()
    .single();

  if (updateErr) {
    console.error('Update error:', updateErr);
    process.exit(1);
  }
  console.log('✔ Updated successfully, new message:', updated.message, 'is_edited:', updated.is_edited);

  console.log('\n--- 4. Testing Live Supabase Delete ---');
  const { error: deleteErr } = await client
    .from('support_messages')
    .delete()
    .eq('id', inserted.id);

  if (deleteErr) {
    console.error('Delete error:', deleteErr);
    process.exit(1);
  }
  console.log('✔ Deleted successfully!');

  console.log('\n🎉 ALL LIVE SUPABASE SUPPORT OPERATIONS WORKING 100%!\n');
}

testLiveSupport();
