-- New stack types (asca / goal / collective) share stacks_metadata with the
-- original ROSCA stacks. Rows are discriminated by stack_type; the new types
-- use prefixed ids (asca:<id>, goal:<id>, collective:<id>) so the id-spaces
-- of the different contracts never collide, while existing ROSCA rows keep
-- their bare on-chain id.
alter table public.stacks_metadata
  add column if not exists stack_type text not null default 'rosca';

alter table public.stacks_metadata
  drop constraint if exists stacks_metadata_stack_type_check;
alter table public.stacks_metadata
  add constraint stacks_metadata_stack_type_check
  check (stack_type in ('rosca', 'asca', 'goal', 'collective'));
