-- "Prayed as qaza": the letter q marks a missed fardh that was made up. Run once in SQL Editor.
do $$ declare c text; begin
  for c in select conname from pg_constraint where conrelid = 'public.logs'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%code%' loop
    execute format('alter table public.logs drop constraint %I', c);
  end loop;
end $$;
alter table public.logs add constraint logs_code_check check (code ~ '^[fqsbnwtida]*$');
