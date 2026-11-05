// server/supabaseAdmin.js
// Dedicated Backend Admin Service for AL Rehman Meta Eggs
// Uses Service Role Key for elevated platform management, user moderation, and direct ledger access.
// IMPORTANT: This file runs on the Node backend or serverless functions only.
// It is strictly isolated from client-facing frontend bundles.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pootzpktmdwopbwmoxwj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb3R6cGt0bWR3b3Bid21veHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg1NTcxOCwiZXhwIjoyMTA5NDMxNzE4fQ.xIUaVgi5bCu9zTDQkglE_stzGGJF8gy8ocundw4JgYA';

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Super Admin Operations Gateway
 */
export const AdminGateway = {
  // Promote or demote user role
  async setUserRole(userId, newRole) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();
    if (error) throw error;
    return data;
  },

  // Suspend or unblock user account
  async setUserStatus(userId, status) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();
    if (error) throw error;
    return data;
  },

  // Approve withdrawal cashout
  async approveWithdrawal(withdrawalId) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'Completed' })
      .eq('id', withdrawalId)
      .select();
    if (error) throw error;
    return data;
  },

  // Reject withdrawal cashout
  async rejectWithdrawal(withdrawalId) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'Rejected' })
      .eq('id', withdrawalId)
      .select();
    if (error) throw error;
    return data;
  },

  // Update platform settings
  async updatePlatformSettings(settings) {
    const { data, error } = await supabaseAdmin
      .from('platform_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select();
    if (error) throw error;
    return data;
  }
};

export default supabaseAdmin;
