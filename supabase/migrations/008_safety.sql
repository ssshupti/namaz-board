-- Safety fixes. Run once (safe to re-run).

-- 1. Removing a member also revokes their invite and any pending request, so they can't just rejoin.
create or replace function public.admin_remove_member(uid uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
declare e text;
begin
  if not is_admin() then raise exception 'only the admin can remove members'; end if;
  select lower(email) into e from auth.users where id = uid;
  if e is not null then delete from invites where email = e; end if;
  delete from join_requests where user_id = uid;
  delete from members where id = uid;
end $$;

-- 2. Logs and excused days can only be written for recent days (stops back-filling old days to fake a streak).
--    The app already allows only today and yesterday; this makes the database enforce it too.
create or replace function public.recent_day_guard() returns trigger
language plpgsql as $$
begin
  if new.day < (now() at time zone 'utc')::date - 2 or new.day > (now() at time zone 'utc')::date + 1 then
    raise exception 'that day can no longer be changed';
  end if;
  return new;
end $$;
drop trigger if exists logs_recent on public.logs;
create trigger logs_recent before insert or update on public.logs for each row execute function public.recent_day_guard();
drop trigger if exists excused_recent on public.excused;
create trigger excused_recent before insert or update on public.excused for each row execute function public.recent_day_guard();
-- (When restoring a backup, first run:  alter table public.logs disable trigger logs_recent;  and re-enable after.)
