-- The group preview (shown while typing a code) no longer reveals how many members a group has. Run once in SQL Editor.
drop function if exists public.group_preview(text);
create function public.group_preview(join_code text)
returns table(name text, mode text)
language sql stable security definer set search_path = public as $$
  select g.name, g.mode from groups g where g.code = upper(trim(join_code))
$$;
grant execute on function public.group_preview(text) to anon, authenticated;
