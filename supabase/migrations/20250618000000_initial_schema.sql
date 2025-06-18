-- ===================================
-- Nhắc Lịch Âm - New Database Schema
-- ===================================

-- Initial schema for Nhac Lich Am application
-- Created: 2025-06-18

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id text NOT NULL,
  display_name text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  note text NOT NULL,
  is_lunar boolean NOT NULL DEFAULT true,
  lunar_day integer NULL,
  lunar_month integer NULL,
  lunar_year integer NULL,
  is_leap_month boolean NULL DEFAULT false,
  solar_date timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT chk_lunar_or_solar_date CHECK (
    (
      (
        (is_lunar = true)
        AND (
          (lunar_day >= 1)
          AND (lunar_day <= 30)
        )
        AND (
          (lunar_month >= 1)
          AND (lunar_month <= 12)
        )
      )
      OR (
        (is_lunar = false)
        AND (solar_date IS NOT NULL)
      )
    )
  )
) TABLESPACE pg_default;

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  event_id uuid NULL,
  channel text NOT NULL,
  advance_days integer NOT NULL DEFAULT 0,
  time_of_day time without time zone NULL DEFAULT '07:00:00'::time without time zone,
  is_enabled boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT notification_settings_pkey PRIMARY KEY (id),
  CONSTRAINT notification_settings_event_id_fkey FOREIGN KEY (event_id) REFERENCES events (id),
  CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
) TABLESPACE pg_default;

-- Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  event_id uuid NULL,
  sent_at timestamp with time zone NULL DEFAULT now(),
  channel text NULL,
  message text NULL,
  status text NULL DEFAULT 'sent'::text,
  response text NULL,
  CONSTRAINT notification_logs_pkey PRIMARY KEY (id),
  CONSTRAINT notification_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES events (id),
  CONSTRAINT notification_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_events_lunar_date ON public.events USING btree (lunar_day, lunar_month, is_leap_month) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_events_solar_date ON public.events USING btree (solar_date) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notiset_user_event ON public.notification_settings USING btree (user_id, event_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notilogs_user_event ON public.notification_logs USING btree (user_id, event_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notilogs_sent_at ON public.notification_logs USING btree (sent_at) TABLESPACE pg_default;

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can only access their own data" ON public.users
FOR ALL USING (auth.uid()::text = id);

-- Policies for Events
CREATE POLICY "Users can only access their own events" ON public.events
FOR ALL USING (auth.uid()::text = user_id);

-- Policies for Notification Settings
CREATE POLICY "Users can only access their own notification settings" ON public.notification_settings
FOR ALL USING (auth.uid()::text = user_id);

-- Policies for Notification Logs
CREATE POLICY "Users can only access their own notification logs" ON public.notification_logs
FOR ALL USING (auth.uid()::text = user_id);

-- Insert a test user (use your user's UID from Supabase Auth)
-- Make sure to replace 'test-user-id' with a real user UID from your auth.users table
-- INSERT INTO public.users (id, display_name) VALUES ('test-user-id', 'Test User')
-- ON CONFLICT (id) DO NOTHING; 