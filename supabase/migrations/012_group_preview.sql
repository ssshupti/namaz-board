-- Lets someone with a group code (or invite link) see the group's name before joining.
-- Shows only the name, member count and mode. Run once in Supabase → SQL Editor.
create or replace function public.group_preview(join_code text)
returns table(name text, members int, mode text)
language sql stable security definer set search_path = public as $$
  select g.name, (select count(*)::int from group_members gm where gm.group_id = g.id), g.mode
  from groups g where g.code = upper(trim(join_code))
$$;
grant execute on function public.group_preview(text) to anon, authenticated;
