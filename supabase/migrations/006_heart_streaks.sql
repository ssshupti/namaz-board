-- Heart streaks: h1..h4 = days in a row with at least 1..4 fardh (streak = all 5). Run once (safe to re-run).
alter table public.member_stats
  add column if not exists h1 int not null default 0,
  add column if not exists h2 int not null default 0,
  add column if not exists h3 int not null default 0,
  add column if not exists h4 int not null default 0;
