-- Join requests: people sign in with Google and ask to join; the admin approves or declines.
-- Run once in Supabase → SQL Editor.

create table if not exists public.join_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null check (char_length(name) between 1 and 40),
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now(),
  notified boolean not null default false
);
alter table public.join_requests enable row level security;

drop policy if exists jr_insert on public.join_requests;
create policy jr_insert on public.join_requests for insert to authenticated
  with check (user_id = auth.uid() and email = my_email());
drop policy if exists jr_read on public.join_requests;
create policy jr_read on public.join_requests for select to authenticated
  using (user_id = auth.uid() or is_admin());
drop policy if exists jr_delete on public.join_requests;
create policy jr_delete on public.join_requests for delete to authenticated
  using (user_id = auth.uid() or is_admin());

-- Approve = add their email to invites and clear the request. Admin only.
create or replace function public.approve_request(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare e text;
begin
  if not is_admin() then raise exception 'only the admin can approve'; end if;
  select email into e from join_requests where user_id = uid;
  if e is null then raise exception 'request not found'; end if;
  insert into invites(email) values (lower(e)) on conflict do nothing;
  delete from join_requests where user_id = uid;
end $$;

-- Used by the notify function to ping the admin about new requests. Server only.
create or replace function public.admin_user_ids() returns setof uuid
language sql stable security definer set search_path = public, auth as $$
  select u.id from auth.users u join public.admins a on lower(u.email) = a.email
$$;
revoke execute on function public.admin_user_ids() from public, anon, authenticated;
grant execute on function public.admin_user_ids() to service_role;

-- The server sets updated_at, so the app can fetch only what changed since it last looked.
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists logs_touch on public.logs;
create trigger logs_touch before insert or update on public.logs
  for each row execute function public.touch_updated_at();
create index if not exists logs_updated_at_idx on public.logs (updated_at);

alter publication supabase_realtime add table public.join_requests;
