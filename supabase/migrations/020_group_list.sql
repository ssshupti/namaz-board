-- Everyone on Namaz Board can see the list of group names and sizes. Joining still needs the code. Run once in SQL Editor.
create or replace function public.list_groups()
returns table(id uuid, name text, members int, mine boolean)
language sql stable security definer set search_path = public as $$
  select g.id, g.name, (select count(*)::int from group_members gm where gm.group_id = g.id), in_group(g.id)
  from groups g where is_member() order by g.created_at
$$;
revoke execute on function public.list_groups() from public, anon;
grant execute on function public.list_groups() to authenticated;
