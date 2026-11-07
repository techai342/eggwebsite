-- ==============================================================================
-- AL REHMAN META EGGS — COMPLETE PRODUCTION SUPABASE SQL SCRIPT (VERIFIED)
-- Project URL: https://pootzpktmdwopbwmoxwj.supabase.co
-- Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- Safe to re-run multiple times (Idempotent: IF NOT EXISTS / ON CONFLICT)
-- ==============================================================================

-- Enable UUID extension
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

CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ------------------------------------------------------------------------------
-- 2. Table: farm_assets (Active Livestock Contracts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farm_assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT NULL,
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

ALTER TABLE public.farm_assets ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_user ON public.farm_assets(username);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.farm_assets(status);

-- ------------------------------------------------------------------------------
-- 3. Table: harvest_logs (Daily 24h Egg Harvest Collection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.harvest_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT NULL,
  username VARCHAR(64) NOT NULL,
  active_units INT NOT NULL DEFAULT 1,
  eggs_collected INT NOT NULL DEFAULT 1,
  harvested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_harvest_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_harvest_user ON public.harvest_logs(username, harvested_at);

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
  user_id VARCHAR(64) DEFAULT NULL,
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
  tx_hash VARCHAR(128) DEFAULT NULL,
  processed_at TIMESTAMPTZ DEFAULT NULL,
  reject_reason TEXT DEFAULT NULL,
  rejected_at TIMESTAMPTZ DEFAULT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for withdrawals table
ALTER TABLE public.withdrawals ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(128) DEFAULT NULL;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS reject_reason TEXT DEFAULT NULL;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_with_user ON public.withdrawals(username);
CREATE INDEX IF NOT EXISTS idx_with_status ON public.withdrawals(status);

-- ------------------------------------------------------------------------------
-- 6. Table: transactions (General Financial Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT NULL,
  username VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  unit VARCHAR(16) NOT NULL DEFAULT 'PKR',
  description VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Failed', 'Rejected')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.transactions ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tx_user ON public.transactions(username, date);

-- ------------------------------------------------------------------------------
-- 7. Table: platform_settings (Global Farm, Pricing Economics & Helpline Controls)
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
  deposit_gateways JSONB NOT NULL DEFAULT '{"easypaisa":{"enabled":true,"number":"03412017923","title":"AL REHMAN META EGGS OFFICIAL"},"jazzcash":{"enabled":true,"number":"03412017923","title":"AL REHMAN ENTERPRISES"}}',
  market_rates JSONB NOT NULL DEFAULT '{"sonica":32,"usmaina":30,"syed":33}',
  community_links JSONB NOT NULL DEFAULT '{"whatsappGroup":"https://chat.whatsapp.com/alrehman-meta-eggs-official","whatsappChannel":"https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j","supportPhone":"+923412017923","callNumber":"+923412017923","popupEnabled":true}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Idempotent column additions for existing settings table
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS min_withdrawal_eggs INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS min_withdrawal_pkr NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
  ADD COLUMN IF NOT EXISTS max_withdrawal_eggs INT NOT NULL DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS referral_commission_level1 NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
  ADD COLUMN IF NOT EXISTS referral_commission_level2 NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS market_rates JSONB NOT NULL DEFAULT '{"sonica":32,"usmaina":30,"syed":33}',
  ADD COLUMN IF NOT EXISTS community_links JSONB NOT NULL DEFAULT '{"whatsappGroup":"https://chat.whatsapp.com/alrehman-meta-eggs-official","whatsappChannel":"https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j","supportPhone":"+923412017923","callNumber":"+923412017923","popupEnabled":true}';

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

-- ------------------------------------------------------------------------------
-- 10. Table: payment_gateways (Official Deposit Accounts)
-- Matches exact Supabase column names: limit_min, limit_max, currency
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  account_title VARCHAR(128) NOT NULL,
  account_number VARCHAR(64) NOT NULL,
  currency VARCHAR(16) NOT NULL DEFAULT 'PKR',
  limit_min NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  limit_max NUMERIC(12, 2) NOT NULL DEFAULT 500000.00,
  instructions TEXT DEFAULT NULL,
  qr_code_url TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist even if table was created in an older schema
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS limit_min NUMERIC(10, 2) DEFAULT 500.00;
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS limit_max NUMERIC(12, 2) DEFAULT 500000.00;
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS currency VARCHAR(16) DEFAULT 'PKR';
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS instructions TEXT DEFAULT NULL;
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS qr_code_url TEXT DEFAULT NULL;
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- ------------------------------------------------------------------------------
-- 11. Table: deposit_requests (Manual Payment Verification & Hen Approval)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  username VARCHAR(64) NOT NULL,
  gateway VARCHAR(64) NOT NULL DEFAULT 'Easypaisa',
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

-- ------------------------------------------------------------------------------
-- 12. Enable Row Level Security (RLS) & Create Permissive Policies
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
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow all users') THEN
    CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'farm_assets' AND policyname = 'Allow all farm_assets') THEN
    CREATE POLICY "Allow all farm_assets" ON public.farm_assets FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'harvest_logs' AND policyname = 'Allow all harvest_logs') THEN
    CREATE POLICY "Allow all harvest_logs" ON public.harvest_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'p2p_stores' AND policyname = 'Allow all p2p_stores') THEN
    CREATE POLICY "Allow all p2p_stores" ON public.p2p_stores FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'withdrawals' AND policyname = 'Allow all withdrawals') THEN
    CREATE POLICY "Allow all withdrawals" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Allow all transactions') THEN
    CREATE POLICY "Allow all transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Allow all platform_settings') THEN
    CREATE POLICY "Allow all platform_settings" ON public.platform_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Allow all activity_logs') THEN
    CREATE POLICY "Allow all activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Allow all support_messages') THEN
    CREATE POLICY "Allow all support_messages" ON public.support_messages FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all payment_gateways') THEN
    CREATE POLICY "Allow all payment_gateways" ON public.payment_gateways FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deposit_requests' AND policyname = 'Allow all deposit_requests') THEN
    CREATE POLICY "Allow all deposit_requests" ON public.deposit_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 13. Enable Supabase Realtime for live instant updates
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'deposit_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_requests;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'withdrawals') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'support_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'platform_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 14. Seed Initial Clean Production Baseline
-- ------------------------------------------------------------------------------
-- 1. Default Super Admin User
INSERT INTO public.users (account_id, username, email, password_hash, full_name, phone, referral_code, balance_pkr, egg_vault, role, status)
VALUES
  ('1197', 'mrsaqib242', 'admin@gmail.com', 'password123', 'Farmer Saqib', '03412017923', 'mrsaqib242', 0.00, 0, 'admin', 'Active')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 2. Verified P2P Stores
INSERT INTO public.p2p_stores (name, tag, rate_per_egg, rating, trades_count, min_eggs, max_eggs, status)
VALUES
  ('Sonica FORM STORE', 'Fast Payout ⚡', 32.00, 4.9, 1420, 1, 10000, 'online'),
  ('Usmaina Poltry Farm', 'Instant Escrow 🛡️', 30.00, 4.8, 980, 1, 5000, 'online'),
  ('Syed poultry farm', 'Top Rate VIP 👑', 33.00, 5.0, 2350, 1, 20000, 'online')
ON CONFLICT DO NOTHING;

-- 3. Payment Gateways (Using limit_min, limit_max, currency)
INSERT INTO public.payment_gateways (code, name, account_title, account_number, currency, limit_min, limit_max, instructions, qr_code_url, status)
VALUES
  ('1000', 'Easypisa', 'AL Rehman Meta Eggs', '03412017923', 'PKR', 500.00, 500000.00, 'Send payment to official Easypisa account, copy your 3737 Trx ID (TID), and submit form below.', '/src/assets/easypisa.png', 'active'),
  ('1001', 'Jazz cash', 'AL Rehman Meta Eggs', '03412017923', 'PKR', 500.00, 500000.00, 'Send payment to official JazzCash account, copy your 8558 Trx ID (TID), and submit form below.', '/src/assets/jazzcash.png', 'active')
ON CONFLICT (code) DO UPDATE SET
  account_title = EXCLUDED.account_title,
  account_number = EXCLUDED.account_number;

-- 4. Platform Settings
INSERT INTO public.platform_settings (
  id, egg_base_price, hen_unit_price, daily_egg_yield, contract_duration_days,
  min_withdrawal_eggs, min_withdrawal_pkr, max_withdrawal_eggs,
  referral_commission_level1, referral_commission_level2, referral_commission_pkr,
  community_links
)
VALUES (
  1, 30.00, 500.00, 1, 120, 1, 30.00, 10000, 2.00, 1.00, 50.00,
  '{"whatsappGroup":"https://chat.whatsapp.com/alrehman-meta-eggs-official","whatsappChannel":"https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j","supportPhone":"+923412017923","callNumber":"+923412017923","popupEnabled":true}'
)
ON CONFLICT (id) DO UPDATE SET
  hen_unit_price = EXCLUDED.hen_unit_price,
  egg_base_price = EXCLUDED.egg_base_price,
  community_links = EXCLUDED.community_links,
  updated_at = NOW();

-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 15. Automatic Referral Hen Purchase Reward Trigger
-- Rule:
-- 1. Joining alone gives 0 eggs to upliner.
-- 2. When a referred user acquires Hens (active farm_assets):
--    - 1 Hen = 1 Free Egg credited to upliner's egg_vault!
--    - 2 Hens = 2 Free Eggs, 5 Hens = 5 Free Eggs, 10 Hens = 10 Free Eggs
--    - Automatically logs a REWARD transaction
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reward_upliner_on_hen_purchase()
RETURNS TRIGGER AS $
DECLARE
  v_upliner_code VARCHAR(32);
  v_upliner_username VARCHAR(64);
BEGIN
  -- 1. Get the buyer's upliner from users table
  SELECT upliner_code INTO v_upliner_code
  FROM public.users
  WHERE username = NEW.username;

  -- 2. If valid upliner exists (not SYSTEM / not N/A / not empty)
  IF v_upliner_code IS NOT NULL AND v_upliner_code <> 'SYSTEM' AND v_upliner_code <> 'N/A' AND v_upliner_code <> '' THEN
    -- Resolve upliner's username
    SELECT username INTO v_upliner_username
    FROM public.users
    WHERE referral_code = v_upliner_code OR username = v_upliner_code
    LIMIT 1;

    IF v_upliner_username IS NOT NULL THEN
      -- Credit +NEW.units (1 Hen = 1 Free Egg) to upliner's egg_vault
      UPDATE public.users
      SET egg_vault = COALESCE(egg_vault, 0) + NEW.units,
          updated_at = NOW()
      WHERE username = v_upliner_username;

      -- Insert transaction ledger entry for the upliner
      INSERT INTO public.transactions (username, type, amount, unit, description, status, date)
      VALUES (
        v_upliner_username,
        'REWARD',
        NEW.units,
        'EGG',
        'Referral Hen Reward: +' || NEW.units || ' Free Eggs (@' || NEW.username || ' purchased ' || NEW.units || ' Hens)',
        'Completed',
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reward_upliner_on_farm_asset ON public.farm_assets;
CREATE TRIGGER trg_reward_upliner_on_farm_asset
AFTER INSERT ON public.farm_assets
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION public.reward_upliner_on_hen_purchase();

-- End of Script
-- ==============================================================================
