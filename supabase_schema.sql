-- ==============================================================================
-- AL Rehman Meta Eggs — Supabase Production Database Schema
-- Project URL: https://pootzpktmdwopbwmoxwj.supabase.co
-- Generated for 1-Click Execution in Supabase SQL Editor
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: users (Farmers & Admins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id VARCHAR(32) NOT NULL UNIQUE DEFAULT '1197',
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(128) NOT NULL DEFAULT 'Valued Farmer',
  phone VARCHAR(20) DEFAULT NULL,
  upliner_code VARCHAR(32) DEFAULT 'SYSTEM',
  referral_code VARCHAR(32) NOT NULL UNIQUE,
  balance_pkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  egg_vault INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin', 'root')),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Blocked', 'Pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ------------------------------------------------------------------------------
-- 2. Table: farm_assets (VIP Hen Livestock Contracts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farm_assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  username VARCHAR(64) NOT NULL,
  asset_name VARCHAR(128) NOT NULL DEFAULT 'GEN-3 High Yield Livestock',
  units INT NOT NULL DEFAULT 1 CHECK (units > 0),
  unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  daily_yield_per_unit INT NOT NULL DEFAULT 1,
  term_days INT NOT NULL DEFAULT 120,
  total_return_eggs INT NOT NULL DEFAULT 120,
  gateway VARCHAR(32) NOT NULL DEFAULT 'Easypaisa',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON public.farm_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.farm_assets(status);

-- ------------------------------------------------------------------------------
-- 3. Table: harvest_logs (Daily 24h Egg Harvest Collection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.harvest_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  username VARCHAR(64) NOT NULL,
  active_units INT NOT NULL DEFAULT 1,
  eggs_collected INT NOT NULL DEFAULT 1,
  harvested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_harvest_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_harvest_user ON public.harvest_logs(user_id, harvested_at);

-- ------------------------------------------------------------------------------
-- 4. Table: p2p_stores (Verified Merchant Buyers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.p2p_stores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  tag VARCHAR(64) NOT NULL DEFAULT 'Verified Partner',
  rate_per_egg NUMERIC(6, 2) NOT NULL DEFAULT 30.00,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 4.9,
  trades_count INT NOT NULL DEFAULT 500,
  min_eggs INT NOT NULL DEFAULT 1,
  max_eggs INT NOT NULL DEFAULT 10000,
  status VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'busy', 'offline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Table: withdrawals (P2P Egg Liquidation & Cashouts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  username VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  store_name VARCHAR(128) NOT NULL,
  eggs_liquidated INT NOT NULL CHECK (eggs_liquidated > 0),
  rate NUMERIC(6, 2) NOT NULL,
  amount_pkr NUMERIC(12, 2) NOT NULL,
  method VARCHAR(32) NOT NULL,
  account_title VARCHAR(128) NOT NULL,
  account_number VARCHAR(64) NOT NULL,
  bank_name VARCHAR(128) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Rejected')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_with_user ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_with_status ON public.withdrawals(status);

-- ------------------------------------------------------------------------------
-- 6. Table: transactions (General Financial Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  username VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  unit VARCHAR(16) NOT NULL DEFAULT 'PKR',
  description VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Failed')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user ON public.transactions(user_id, date);

-- ------------------------------------------------------------------------------
-- 7. Table: platform_settings (Global Farm, Pricing Economics & Gateway Controls)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  egg_base_price NUMERIC(6, 2) NOT NULL DEFAULT 30.00,
  hen_unit_price NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  daily_egg_yield INT NOT NULL DEFAULT 1,
  contract_duration_days INT NOT NULL DEFAULT 120,
  min_withdrawal_eggs INT NOT NULL DEFAULT 1,
  min_withdrawal_pkr NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
  max_withdrawal_eggs INT NOT NULL DEFAULT 10000,
  referral_commission_level1 NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
  referral_commission_level2 NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  referral_commission_pkr NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  is_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_gateways JSONB NOT NULL DEFAULT '{"easypaisa":{"enabled":true,"number":"03412017923","title":"AL REHMAN META EGGS OFFICIAL"},"jazzcash":{"enabled":true,"number":"03001234567","title":"AL REHMAN ENTERPRISES"}}',
  market_rates JSONB NOT NULL DEFAULT '{"sonica":32,"usmaina":30,"syed":33}',
  community_links JSONB NOT NULL DEFAULT '{"whatsappGroup":"https://chat.whatsapp.com/alrehman-meta-eggs-official","whatsappChannel":"https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j","supportPhone":"+923412017923","popupEnabled":true}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ------------------------------------------------------------------------------
-- 8. Table: activity_logs (Platform Audit & Security Event Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT NULL,
  username VARCHAR(64) DEFAULT NULL,
  action VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'SYSTEM',
  details TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(username);
CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON public.activity_logs(timestamp);

-- ------------------------------------------------------------------------------
-- 9. Table: support_messages (VIP Support Chat & In-App Helpdesk)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_messages (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  sender_role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (sender_role IN ('farmer', 'admin', 'system')),
  sender_name VARCHAR(128) NOT NULL DEFAULT 'Farmer',
  sender_email VARCHAR(128) DEFAULT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_is_read ON public.support_messages(is_read);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select support_messages" ON public.support_messages FOR SELECT USING (true);
CREATE POLICY "Allow all insert support_messages" ON public.support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update support_messages" ON public.support_messages FOR UPDATE USING (true);
CREATE POLICY "Allow all delete support_messages" ON public.support_messages FOR DELETE USING (true);

-- Allow public read of verified stores and platform settings
CREATE POLICY "Allow public read of stores" ON public.p2p_stores FOR SELECT USING (true);
CREATE POLICY "Allow public read of platform settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Allow all update platform_settings" ON public.platform_settings FOR UPDATE USING (true);

-- Allow public / anon read and insert for users (signup/login)
CREATE POLICY "Allow anon insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anon update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete users" ON public.users FOR DELETE USING (true);

-- Allow public / anon operations for farm assets, withdrawals, transactions, logs
CREATE POLICY "Allow all select farm_assets" ON public.farm_assets FOR SELECT USING (true);
CREATE POLICY "Allow all insert farm_assets" ON public.farm_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update farm_assets" ON public.farm_assets FOR UPDATE USING (true);
CREATE POLICY "Allow all delete farm_assets" ON public.farm_assets FOR DELETE USING (true);

CREATE POLICY "Allow all select withdrawals" ON public.withdrawals FOR SELECT USING (true);
CREATE POLICY "Allow all insert withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update withdrawals" ON public.withdrawals FOR UPDATE USING (true);

CREATE POLICY "Allow all select transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow all insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete transactions" ON public.transactions FOR DELETE USING (true);

CREATE POLICY "Allow all select harvest_logs" ON public.harvest_logs FOR SELECT USING (true);
CREATE POLICY "Allow all insert harvest_logs" ON public.harvest_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all select activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow all insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete activity_logs" ON public.activity_logs FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- Seed Initial Clean Baseline Data
-- ------------------------------------------------------------------------------
-- 1. Seed Verified P2P Stores
INSERT INTO public.p2p_stores (name, tag, rate_per_egg, rating, trades_count, min_eggs, max_eggs, status)
VALUES
  ('Sonica FORM STORE', 'Fast Payout ⚡', 32.00, 4.9, 1420, 1, 10000, 'online'),
  ('Usmaina Poltry Farm', 'Instant Escrow 🛡️', 30.00, 4.8, 980, 1, 5000, 'online'),
  ('Syed poultry farm', 'Top Rate VIP 👑', 33.00, 5.0, 2350, 1, 20000, 'online')
ON CONFLICT DO NOTHING;

-- 2. Seed Default Root Admin Account (Zero initial dummy balances)
INSERT INTO public.users (account_id, username, email, password_hash, full_name, phone, referral_code, balance_pkr, egg_vault, role, status)
VALUES
  ('1197', 'mrsaqib242', 'admin@gmail.com', 'password123', 'Farmer Saqib', '03001234567', 'mrsaqib242', 0.00, 0, 'admin', 'Active')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 3. Seed Platform Settings & Dynamic Economics
INSERT INTO public.platform_settings (
  id, egg_base_price, hen_unit_price, daily_egg_yield, contract_duration_days,
  min_withdrawal_eggs, min_withdrawal_pkr, max_withdrawal_eggs,
  referral_commission_level1, referral_commission_level2, referral_commission_pkr
)
VALUES (1, 30.00, 500.00, 1, 120, 1, 30.00, 10000, 2.00, 1.00, 50.00)
ON CONFLICT (id) DO UPDATE SET
  hen_unit_price = EXCLUDED.hen_unit_price,
  egg_base_price = EXCLUDED.egg_base_price;

-- ------------------------------------------------------------------------------
-- 4. Idempotent Migration for Existing Databases (Run in Supabase SQL Editor)
-- ------------------------------------------------------------------------------
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS min_withdrawal_eggs INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS min_withdrawal_pkr NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
  ADD COLUMN IF NOT EXISTS max_withdrawal_eggs INT NOT NULL DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS referral_commission_level1 NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
  ADD COLUMN IF NOT EXISTS referral_commission_level2 NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS market_rates JSONB NOT NULL DEFAULT '{"sonica":32,"usmaina":30,"syed":33}',
  ADD COLUMN IF NOT EXISTS community_links JSONB NOT NULL DEFAULT '{"whatsappGroup":"https://chat.whatsapp.com/alrehman-meta-eggs-official","whatsappChannel":"https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j","supportPhone":"+923412017923","popupEnabled":true}';

-- ------------------------------------------------------------------------------
-- 5. Support Messages Table & Realtime Setup (Safe to re-run anytime)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_messages (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  sender_role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (sender_role IN ('farmer', 'admin', 'system')),
  sender_name VARCHAR(128) NOT NULL DEFAULT 'Farmer',
  sender_email VARCHAR(128) DEFAULT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_is_read ON public.support_messages(is_read);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Allow all select support_messages') THEN
    CREATE POLICY "Allow all select support_messages" ON public.support_messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Allow all insert support_messages') THEN
    CREATE POLICY "Allow all insert support_messages" ON public.support_messages FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Allow all update support_messages') THEN
    CREATE POLICY "Allow all update support_messages" ON public.support_messages FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Allow all delete support_messages') THEN
    CREATE POLICY "Allow all delete support_messages" ON public.support_messages FOR DELETE USING (true);
  END IF;
END $$;

-- Enable Realtime publication for support_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'support_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 6. Payment Gateways Table & Default 2 Payment Methods (Easypisa & JazzCash)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  account_title VARCHAR(128) NOT NULL,
  account_number VARCHAR(64) NOT NULL,
  instructions TEXT DEFAULT NULL,
  qr_code_url TEXT DEFAULT NULL,
  min_limit NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  max_limit NUMERIC(12, 2) NOT NULL DEFAULT 500000.00,
  fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all select payment_gateways') THEN
    CREATE POLICY "Allow all select payment_gateways" ON public.payment_gateways FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all insert payment_gateways') THEN
    CREATE POLICY "Allow all insert payment_gateways" ON public.payment_gateways FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all update payment_gateways') THEN
    CREATE POLICY "Allow all update payment_gateways" ON public.payment_gateways FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all delete payment_gateways') THEN
    CREATE POLICY "Allow all delete payment_gateways" ON public.payment_gateways FOR DELETE USING (true);
  END IF;
END $$;

-- Seed Default 2 Payment Methods
INSERT INTO public.payment_gateways (code, name, account_title, account_number, instructions, qr_code_url, min_limit, max_limit, fee_percentage, status)
VALUES
  ('1000', 'Easypisa', 'AL Rehman Meta Eggs', '03412017923', 'Send payment to official Easypisa account, copy your 3737 Trx ID (TID), and submit form below.', '/src/assets/easypisa.png', 500.00, 500000.00, 0.00, 'active'),
  ('1001', 'Jazz cash', 'AL Rehman Meta Eggs', '03412017923', 'Send payment to official JazzCash account, copy your 8558 Trx ID (TID), and submit form below.', '/src/assets/jazzcash.png', 500.00, 500000.00, 0.00, 'active')
ON CONFLICT (code) DO UPDATE SET
  account_title = EXCLUDED.account_title,
  account_number = EXCLUDED.account_number;

-- ------------------------------------------------------------------------------
-- 7. Deposit Requests Table (Manual Payment Verification by Admin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  username VARCHAR(64) NOT NULL,
  gateway VARCHAR(64) NOT NULL DEFAULT 'Easypisa',
  units INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  amount_pkr NUMERIC(12, 2) NOT NULL,
  sender_account_title VARCHAR(128) NOT NULL,
  sender_account_number VARCHAR(64) NOT NULL,
  transaction_id VARCHAR(128) NOT NULL,
  proof_screenshot TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Approved', 'Rejected')),
  admin_notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_username ON public.deposit_requests(username);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_created_at ON public.deposit_requests(created_at);

ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deposit_requests' AND policyname = 'Allow all select deposit_requests') THEN
    CREATE POLICY "Allow all select deposit_requests" ON public.deposit_requests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deposit_requests' AND policyname = 'Allow all insert deposit_requests') THEN
    CREATE POLICY "Allow all insert deposit_requests" ON public.deposit_requests FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deposit_requests' AND policyname = 'Allow all update deposit_requests') THEN
    CREATE POLICY "Allow all update deposit_requests" ON public.deposit_requests FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deposit_requests' AND policyname = 'Allow all delete deposit_requests') THEN
    CREATE POLICY "Allow all delete deposit_requests" ON public.deposit_requests FOR DELETE USING (true);
  END IF;
END $$;

-- Enable Realtime publication for deposit_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'deposit_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_requests;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- End of Schema Setup
-- ==============================================================================
