create table public.events (
  id uuid not null default gen_random_uuid (),
  user_id text not null,
  note text not null,
  is_lunar boolean not null default true,
  lunar_day integer null,
  lunar_month integer null,
  lunar_year integer null,
  is_leap_month boolean null default false,
  solar_date timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  constraint events_pkey primary key (id),
  constraint events_user_id_fkey foreign KEY (user_id) references users (id),
  constraint chk_lunar_or_solar_date check (
    (
      (
        (is_lunar = true)
        and (
          (lunar_day >= 1)
          and (lunar_day <= 30)
        )
        and (
          (lunar_month >= 1)
          and (lunar_month <= 12)
        )
      )
      or (
        (is_lunar = false)
        and (solar_date is not null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_events_user_id on public.events using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_events_lunar_date on public.events using btree (lunar_day, lunar_month, is_leap_month) TABLESPACE pg_default;

create index IF not exists idx_events_solar_date on public.events using btree (solar_date) TABLESPACE pg_default;


create table public.notification_logs (
  id uuid not null default gen_random_uuid (),
  user_id text not null,
  event_id uuid null,
  sent_at timestamp with time zone null default now(),
  channel text null,
  message text null,
  status text null default 'sent'::text,
  response text null,
  constraint notification_logs_pkey primary key (id),
  constraint notification_logs_event_id_fkey foreign KEY (event_id) references events (id),
  constraint notification_logs_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_notilogs_user_event on public.notification_logs using btree (user_id, event_id) TABLESPACE pg_default;

create index IF not exists idx_notilogs_sent_at on public.notification_logs using btree (sent_at) TABLESPACE pg_default;


create table public.notification_settings (
  id uuid not null default gen_random_uuid (),
  user_id text not null,
  event_id uuid null,
  channel text not null,
  advance_days integer not null default 0,
  time_of_day time without time zone null default '07:00:00'::time without time zone,
  is_enabled boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint notification_settings_pkey primary key (id),
  constraint notification_settings_event_id_fkey foreign KEY (event_id) references events (id),
  constraint notification_settings_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_notiset_user_event on public.notification_settings using btree (user_id, event_id) TABLESPACE pg_default;


create table public.users (
  id text not null,
  display_name text null,
  created_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;