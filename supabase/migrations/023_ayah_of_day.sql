-- "Ayah of the day" alert after Maghrib (off unless turned on). Run once in SQL Editor.
alter table public.members add column if not exists notify_ayah boolean not null default false;
