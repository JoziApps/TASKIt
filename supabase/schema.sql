-- TASKit Phase 1 schema.
-- Paste into Supabase > SQL Editor > New query, then Run. Run it ONCE on a fresh project.

create extension if not exists pgcrypto;

-- Types ---------------------------------------------------------------
do $$ begin create type public.user_role as enum ('tasker', 'taskee');
exception when duplicate_object then null; end $$;
do $$ begin create type public.workspace_status as enum ('pending', 'active', 'paused', 'ended');
exception when duplicate_object then null; end $$;
do $$ begin create type public.kit_kind as enum ('reward', 'punishment');
exception when duplicate_object then null; end $$;
do $$ begin create type public.task_status as enum ('proposed', 'active', 'completed', 'approved', 'failed', 'declined');
exception when duplicate_object then null; end $$;

-- Tables --------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  pet_name text not null check (char_length(pet_name) between 2 and 30),
  adult_confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique default encode(gen_random_bytes(4), 'hex'),
  status public.workspace_status not null default 'pending',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- One Tasker and one Taskee per workspace. Points live here, per workspace.
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.user_role not null,
  points integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  unique (workspace_id, role)
);

create table public.task_kits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  value integer not null check (value > 0),
  kind public.kit_kind not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  tasker_id uuid not null references auth.users (id) on delete cascade,
  taskee_id uuid not null references auth.users (id) on delete cascade,
  kit_id uuid references public.task_kits (id) on delete set null,
  title text not null,
  notes text,
  status public.task_status not null default 'proposed',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (tasker_id <> taskee_id)
);

-- Every point change is a row, so balances can be audited and undone.
create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  taskee_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index on public.workspace_members (user_id);
create index on public.tasks (workspace_id, status);
create index on public.points_ledger (workspace_id, taskee_id);

-- Helper functions (security definer avoids policy recursion) ----------
create or replace function public.is_workspace_member(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_tasker(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = 'tasker'
  );
$$;

create or replace function public.shares_workspace_with(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.workspace_members a
    join public.workspace_members b on a.workspace_id = b.workspace_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;

-- Row Level Security --------------------------------------------------
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.task_kits enable row level security;
alter table public.tasks enable row level security;
alter table public.points_ledger enable row level security;

-- Profiles: read your own and your partner's; write only your own.
create policy "profiles read own or partner" on public.profiles
  for select using (id = auth.uid() or public.shares_workspace_with(id));
create policy "profiles insert own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Workspaces and members: read-only for members.
-- Creating and joining a workspace arrives in Phase 2 as secured functions.
create policy "workspaces read as member" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "members read same workspace" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));

-- Task kits: members read, only the Tasker manages.
create policy "kits read as member" on public.task_kits
  for select using (public.is_workspace_member(workspace_id));
create policy "kits insert as tasker" on public.task_kits
  for insert with check (public.is_workspace_tasker(workspace_id) and created_by = auth.uid());
create policy "kits update as tasker" on public.task_kits
  for update using (public.is_workspace_tasker(workspace_id));
create policy "kits delete as tasker" on public.task_kits
  for delete using (public.is_workspace_tasker(workspace_id));

-- Tasks: members read, only the Tasker proposes. Status changes arrive in Phase 3 as functions.
create policy "tasks read as member" on public.tasks
  for select using (public.is_workspace_member(workspace_id));
create policy "tasks insert as tasker" on public.tasks
  for insert with check (public.is_workspace_tasker(workspace_id) and tasker_id = auth.uid());

-- Points ledger: members read. No client can write; only Phase 3 functions will.
create policy "ledger read as member" on public.points_ledger
  for select using (public.is_workspace_member(workspace_id));
