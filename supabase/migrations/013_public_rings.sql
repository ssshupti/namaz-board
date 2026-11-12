-- Public members' daily logs are visible to everyone on the board, so their rings show.
-- Private members: still only people in a full-details group with them. Run once in SQL Editor.
drop policy if exists log_read on public.logs;
create policy log_read on public.logs for select to authenticated
  using (user_id = auth.uid() or shares_full_group(user_id) or (is_member() and is_public_member(user_id)));
