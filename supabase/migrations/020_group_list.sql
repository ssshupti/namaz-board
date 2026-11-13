-- Everyone on Namaz Board can see the list of group names (not who's in them). Joining still needs the code.
-- Run once in SQL Editor (safe to re-run).
drop function if exists public.list_groups();
create function public.list_groups()
returns table(id uuid, name text, mine boolean)
language sql stable security definer set search_path = public as $$
  select g.id, g.name, in_group(g.id) from groups g where is_member() order by g.created_at
$$;
revoke execute on function public.list_groups() from public, anon;
grant execute on function public.list_groups() to authenticated;
