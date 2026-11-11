-- Groups + private excused days. Run once in Supabase → SQL Editor.
--
-- Who sees what after this:
--   • Your logs: you, plus people who share a "full details" group with you.
--   • Your streak, weekly/monthly grade and points (member_stats): you, plus anyone who shares any group with you.
--   • Your excused days: only you. Nobody else, admin included. Streaks are computed with them, then only the numbers are shared.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  mode text not null default 'summary' check (mode in ('summary','full')),
  code text not null unique default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
  owner uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create table if not exists public.excused (
  user_id uuid not null references public.members(id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);
create table if not exists public.member_stats (
  user_id uuid primary key references public.members(id) on delete cascade,
  streak int not null default 0,
  best int not null default 0,
  wk_due int not null default 0,
  wk_done int not null default 0,
  mo_due int not null default 0,
  mo_done int not null default 0,
  mo_pts int not null default 0,
  updated_at timestamptz not null default now()
);

-- Helpers (security definer = can look across tables without leaking them).
create or replace function public.in_group(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = gid and user_id = auth.uid())
$$;
create or replace function public.shares_group(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members a join group_members b on a.group_id = b.group_id
                 where a.user_id = auth.uid() and b.user_id = uid)
$$;
create or replace function public.shares_full_group(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members a join group_members b on a.group_id = b.group_id
                 join groups g on g.id = a.group_id
                 where g.mode = 'full' and a.user_id = auth.uid() and b.user_id = uid)
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.excused enable row level security;
alter table public.member_stats enable row level security;

-- groups: members of the group see it; any board member can create one; only its owner edits/deletes it.
drop policy if exists g_read on public.groups;
create policy g_read on public.groups for select to authenticated using (in_group(id) or owner = auth.uid());
drop policy if exists g_insert on public.groups;
create policy g_insert on public.groups for insert to authenticated with check (owner = auth.uid() and is_member());
drop policy if exists g_update on public.groups;
create policy g_update on public.groups for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists g_delete on public.groups;
create policy g_delete on public.groups for delete to authenticated using (owner = auth.uid());

-- group_members: visible inside the group; join only through join_group(code); leave yourself or be removed by the owner.
drop policy if exists gm_read on public.group_members;
create policy gm_read on public.group_members for select to authenticated using (in_group(group_id));
drop policy if exists gm_delete on public.group_members;
create policy gm_delete on public.group_members for delete to authenticated
  using (user_id = auth.uid() or exists (select 1 from groups g where g.id = group_id and g.owner = auth.uid()));

-- excused: yours only.
drop policy if exists ex_own on public.excused;
create policy ex_own on public.excused for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- member_stats: you write your own; anyone sharing a group with you can read it.
drop policy if exists ms_read on public.member_stats;
create policy ms_read on public.member_stats for select to authenticated using (user_id = auth.uid() or shares_group(user_id));
drop policy if exists ms_write on public.member_stats;
create policy ms_write on public.member_stats for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ms_update on public.member_stats;
create policy ms_update on public.member_stats for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- members: yourself, anyone you share a group with, and the admin (names only, for managing the app).
drop policy if exists mem_read on public.members;
create policy mem_read on public.members for select to authenticated
  using (id = auth.uid() or shares_group(id) or is_admin());

-- logs: yours, or someone who shares a full-details group with you.
drop policy if exists log_read on public.logs;
create policy log_read on public.logs for select to authenticated
  using (user_id = auth.uid() or shares_full_group(user_id));

-- The creator is automatically in their new group.
create or replace function public.add_owner_to_group() returns trigger
language plpgsql security definer set search_path = public as $$
begin insert into group_members(group_id, user_id) values (new.id, new.owner) on conflict do nothing; return new; end $$;
drop trigger if exists groups_add_owner on public.groups;
create trigger groups_add_owner after insert on public.groups for each row execute function public.add_owner_to_group();

-- Join with a code. Returns the group id.
create or replace function public.join_group(join_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  if not is_member() then raise exception 'join the board first'; end if;
  select id into gid from groups where code = upper(trim(join_code));
  if gid is null then raise exception 'no group with that code'; end if;
  insert into group_members(group_id, user_id) values (gid, auth.uid()) on conflict do nothing;
  return gid;
end $$;

-- Move everyone on the current board into a first group, so nothing changes for them.
do $$
declare owner_id uuid; gid uuid;
begin
  select m.id into owner_id from members m join auth.users u on u.id = m.id
    join admins a on a.email = lower(u.email) limit 1;
  if owner_id is not null and not exists (select 1 from groups) then
    insert into groups(name, mode, owner) values ('Namaz Board', 'full', owner_id) returning id into gid;
    insert into group_members(group_id, user_id)
      select gid, id from members where coalesce(is_public, true) on conflict do nothing;
  end if;
end $$;

alter publication supabase_realtime add table public.groups, public.group_members, public.member_stats;
