-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.events (
  user_id uuid NOT NULL,
  note text NOT NULL,
  lunar_day integer,
  lunar_month integer,
  lunar_year integer,
  solar_date timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_lunar boolean NOT NULL DEFAULT true,
  is_leap_month boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notification_logs (
  user_id uuid NOT NULL,
  event_id uuid,
  channel text,
  message text,
  response text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sent_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'sent'::text,
  CONSTRAINT notification_logs_pkey PRIMARY KEY (id),
  CONSTRAINT notification_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT notification_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.notification_settings (
  user_id uuid NOT NULL,
  event_id uuid,
  channel text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  advance_days integer NOT NULL DEFAULT 0,
  time_of_day time without time zone DEFAULT '07:00:00'::time without time zone,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_settings_pkey PRIMARY KEY (id),
  CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT notification_settings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);