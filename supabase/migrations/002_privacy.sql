-- Public / private mode. Run once in Supabase → SQL Editor.
alter table public.members add column if not exists is_public boolean not null default true;

-- Is this member sharing publicly? (security definer so policies can use it without recursion)
create or replace function public.is_public_member(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_public from members where id = uid), false)
$$;

-- Members: you see yourself, other members see public members, the admin sees everyone's name (not their logs).
drop policy if exists mem_read on public.members;
create policy mem_read on public.members for select to authenticated
  using (id = auth.uid() or (is_member() and is_public) or is_admin());

-- Logs: your own, or a public member's. Private logs are visible to nobody else, admin included.
drop policy if exists log_read on public.logs;
create policy log_read on public.logs for select to authenticated
  using (user_id = auth.uid() or (is_member() and is_public_member(user_id)));
