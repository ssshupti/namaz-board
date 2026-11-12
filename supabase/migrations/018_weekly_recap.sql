-- Weekly recap notification on/off (on by default). Run once in SQL Editor.
alter table public.members add column if not exists notify_recap boolean not null default true;
