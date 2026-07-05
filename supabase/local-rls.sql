-- Permissive RLS for the THROWAWAY LOCALHOST instance only.
--
-- Local mode has no auth: the browser talks to this instance with the anon
-- key and writes directly (the deployed site cannot use a service-role key
-- against a user's localhost). This is a deliberate, documented exception to
-- the RLS guardrail — hosted projects are untouched.
--
-- Applied automatically as seed on `supabase db reset` (see config.toml).

do $$
declare
  t text;
begin
  foreach t in array array['users', 'profiles', 'stacks_metadata', 'user_stacks']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists local_anon_all on public.%I', t);
    execute format(
      'create policy local_anon_all on public.%I for all to anon using (true) with check (true)',
      t
    );
  end loop;
end $$;
