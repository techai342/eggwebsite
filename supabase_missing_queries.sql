-- ==============================================================================
-- AL Rehman Meta Eggs — Missing & Additional Supabase Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pootzpktmdwopbwmoxwj/sql
-- Safe to run: Contains IF NOT EXISTS checks
-- ==============================================================================

-- 1. Table: activity_logs (Platform Audit & Security Event Logs)
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

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Allow all select activity_logs'
  ) THEN
    CREATE POLICY "Allow all select activity_logs" ON public.activity_logs FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Allow all insert activity_logs'
  ) THEN
    CREATE POLICY "Allow all insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Allow all delete activity_logs'
  ) THEN
    CREATE POLICY "Allow all delete activity_logs" ON public.activity_logs FOR DELETE USING (true);
  END IF;
END $$;

-- 2. Ensure RLS Policies for UPDATE on platform_settings, withdrawals, and farm_assets
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Allow all update platform_settings'
  ) THEN
    CREATE POLICY "Allow all update platform_settings" ON public.platform_settings FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'withdrawals' AND policyname = 'Allow all update withdrawals'
  ) THEN
    CREATE POLICY "Allow all update withdrawals" ON public.withdrawals FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'farm_assets' AND policyname = 'Allow all delete farm_assets'
  ) THEN
    CREATE POLICY "Allow all delete farm_assets" ON public.farm_assets FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Allow all delete transactions'
  ) THEN
    CREATE POLICY "Allow all delete transactions" ON public.transactions FOR DELETE USING (true);
  END IF;
END $$;

-- 3. Initial Seed for Activity Logs (Pristine Audit Trail)
INSERT INTO public.activity_logs (username, action, category, details, status)
VALUES
  ('SYSTEM', 'SYSTEM_INIT', 'SYSTEM', 'AL Rehman Meta Eggs Supabase Cloud Gateway Connected', 'SUCCESS')
ON CONFLICT DO NOTHING;

-- Verification Check
SELECT count(*) AS total_tables_healthy FROM information_schema.tables WHERE table_schema = 'public';
