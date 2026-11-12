-- One kind of group: members see each other's streaks and today's rings. Run once in SQL Editor.
update public.groups set mode = 'full' where mode <> 'full';
alter table public.groups alter column mode set default 'full';
create or replace function public.shares_full_group(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.shares_group(uid)
$$;
