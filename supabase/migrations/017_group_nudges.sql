-- Message the whole group (to_id empty = everyone). Run once in SQL Editor, after 015.
alter table public.nudges alter column to_id drop not null;
alter table public.nudges drop constraint if exists nudges_kind_check;
alter table public.nudges add constraint nudges_kind_check check (kind in
  ('n1','n2','n3','n4','n5','h1','h2','h3','h4','h5','r1','r2','r3','r4','g1','g2','g3','g4','g5'));
-- One group message per person, per group, per namaz.
create unique index if not exists nudges_group_once on public.nudges (from_id, group_id, day, waqt) where to_id is null;

drop policy if exists nd_insert on public.nudges;
create policy nd_insert on public.nudges for insert to authenticated with check (
  from_id = auth.uid() and pushed = false and in_group(group_id)
  and (
    (to_id is null and reply_to is null and kind like 'g%')
    or (to_id is not null and exists (select 1 from group_members gm where gm.group_id = nudges.group_id and gm.user_id = nudges.to_id))
  )
  and (reply_to is null or exists (select 1 from nudges n where n.id = nudges.reply_to and n.from_id = nudges.to_id
        and (n.to_id = auth.uid() or (n.to_id is null and n.group_id = nudges.group_id))))
);
