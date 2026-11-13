-- Flame look (unlocked by streaks) so friends can see it. Run once in SQL Editor.
alter table public.members add column if not exists flame text check (flame is null or flame in ('classic','rose','gold','moon','emerald','nur'));
