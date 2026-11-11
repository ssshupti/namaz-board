-- Own location option: rounded coordinates (~10 km), time zone and a label like "Near London". Run once (safe to re-run).
alter table public.members
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists tz text,
  add column if not exists place text;
