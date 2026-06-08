-- Alert logs table
create table public.alert_logs (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.price_alerts(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  current_price numeric not null,
  notification_sent boolean not null default false
);

-- Enable RLS
alter table public.alert_logs enable row level security;

-- Policy: alert logs can be read through the parent alert
create policy "AlertLogs: read via alert" on public.alert_logs for select 
  using (
    exists (
      select 1 from public.price_alerts 
      where price_alerts.id = alert_logs.alert_id 
      and price_alerts.user_id = auth.uid()
    )
  );
