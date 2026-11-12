-- Language for alerts (English or Bangla). Run once in Supabase → SQL Editor.
alter table public.members add column if not exists lang text not null default 'en' check (lang in ('en','bn'));
