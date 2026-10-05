-- Make the chain part of every stack-scoped key, so one deployment can serve
-- several chains from one Supabase project.
--
-- Why the key has to change: circle ids come from a per-deployment counter
-- (SavingCircles.sol, `_id = nextId++`), so circle 5 exists on Gnosis *and* on
-- Celo and they are unrelated stacks. `id` alone is unique only while a project
-- holds a single chain.
--
-- Written for a fresh deployment: the tables are empty, so there is nothing to
-- backfill and `chain_id` needs no default. Every writer supplies it — the app
-- through useChainConfig()/resolveChainId, and nothing older exists.

do $$
declare
  _table text;
  _rows bigint;
begin
  foreach _table in array array['stacks_metadata', 'user_stacks', 'join_requests']
  loop
    execute format('select count(*) from public.%I', _table) into _rows;

    if _rows > 0 then
      raise exception
        'public.% holds % row(s). This migration assumes a fresh deployment: it adds chain_id as NOT NULL with no default and cannot label existing rows. Labelling them needs a per-project backfill.',
        _table, _rows;
    end if;
  end loop;
end
$$;

-- Dependent foreign keys must go before the parent primary key can change.
-- Both the pre-migration names and the ones added below are dropped, so a
-- partial failure can be recovered by simply re-running this file.
alter table public.user_stacks
  drop constraint if exists user_stacks_stack_id_fkey;

alter table public.user_stacks
  drop constraint if exists user_stacks_stack_fkey;

alter table public.join_requests
  drop constraint if exists join_requests_stack_id_fkey;

alter table public.join_requests
  drop constraint if exists join_requests_stack_fkey;

alter table public.stacks_metadata
  add column if not exists chain_id int4 not null;

alter table public.user_stacks
  add column if not exists chain_id int4 not null;

alter table public.join_requests
  add column if not exists chain_id int4 not null;

-- Rekey: (chain_id, id) everywhere a stack is referenced.
alter table public.stacks_metadata
  drop constraint if exists stacks_metadata_pkey;

alter table public.stacks_metadata
  add constraint stacks_metadata_pkey primary key (chain_id, id);

alter table public.user_stacks
  drop constraint if exists user_stacks_pkey;

alter table public.user_stacks
  add constraint user_stacks_pkey primary key (user_id, chain_id, stack_id);

alter table public.user_stacks
  add constraint user_stacks_stack_fkey
  foreign key (chain_id, stack_id)
  references public.stacks_metadata (chain_id, id);

alter table public.join_requests
  drop constraint if exists join_requests_stack_id_wallet_address_key;

alter table public.join_requests
  drop constraint if exists join_requests_chain_stack_wallet_key;

alter table public.join_requests
  add constraint join_requests_chain_stack_wallet_key
  unique (chain_id, stack_id, wallet_address);

alter table public.join_requests
  add constraint join_requests_stack_fkey
  foreign key (chain_id, stack_id)
  references public.stacks_metadata (chain_id, id)
  on delete cascade;

drop index if exists join_requests_stack_status_idx;

create index if not exists join_requests_chain_stack_status_idx
  on public.join_requests (chain_id, stack_id, status);

-- chain_id joins id and created_at as immutable: it is part of the key, so
-- letting it change would silently move a stack to another chain.
create or replace function public.prevent_stacks_metadata_immutable_fields()
returns trigger language plpgsql as $$
begin
  if NEW.id <> OLD.id then
    raise exception 'stacks_metadata.id is immutable';
  end if;
  if NEW.chain_id <> OLD.chain_id then
    raise exception 'stacks_metadata.chain_id is immutable';
  end if;
  if NEW.created_at <> OLD.created_at then
    raise exception 'stacks_metadata.created_at is immutable';
  end if;
  return NEW;
end;
$$;
