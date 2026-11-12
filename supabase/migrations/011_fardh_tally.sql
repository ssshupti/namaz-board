-- "Fardh since you joined" (e.g. 6/7) replaces the heart streaks. Run once in Supabase → SQL Editor.
alter table public.member_stats add column if not exists f_due int not null default 0;
alter table public.member_stats add column if not exists f_done int not null default 0;
alter table public.member_stats drop column if exists h1, drop column if exists h2, drop column if exists h3, drop column if exists h4;
