-- Public + groups together. Run once in Supabase → SQL Editor (safe to re-run).
--   • Public members: everyone on the board sees their name, streak, grade and points (not daily details).
--   • Private members: only people in their groups see them.
--   • Daily details (logs) still reach only people sharing a full-details group. Excused days stay private.
alter table public.members add column if not exists is_public boolean not null default true;

create or replace function public.is_public_member(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_public from members where id = uid), false)
$$;

drop policy if exists mem_read on public.members;
create policy mem_read on public.members for select to authenticated
  using (id = auth.uid() or shares_group(id) or (is_member() and is_public) or is_admin());

drop policy if exists ms_read on public.member_stats;
create policy ms_read on public.member_stats for select to authenticated
  using (user_id = auth.uid() or shares_group(user_id) or (is_member() and is_public_member(user_id)));
