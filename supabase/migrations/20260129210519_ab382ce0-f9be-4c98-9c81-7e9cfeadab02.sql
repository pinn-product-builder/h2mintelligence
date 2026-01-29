-- Tabela de perfis de usuário
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Tabela de setores
create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default '#6366f1',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.sectors enable row level security;

-- Tabela de ciclos de OKR
create table public.okr_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default true,
  is_archived boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.okr_cycles enable row level security;

-- Tabela de objetivos (OKRs)
create table public.objectives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cycle_id uuid references public.okr_cycles(id) on delete cascade not null,
  sector_id uuid references public.sectors(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  parent_id uuid references public.objectives(id) on delete set null,
  status text default 'on-track' check (status in ('on-track', 'attention', 'critical', 'completed')),
  progress numeric default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  due_date date,
  is_archived boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.objectives enable row level security;

-- Tabela de Key Results
create table public.key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references public.objectives(id) on delete cascade not null,
  title text not null,
  description text,
  type text default 'percentage' check (type in ('numeric', 'percentage', 'boolean')),
  current_value numeric default 0,
  target_value numeric default 100,
  unit text,
  weight numeric default 1,
  owner_id uuid references auth.users(id) on delete set null,
  status text default 'on-track' check (status in ('on-track', 'attention', 'critical', 'completed')),
  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.key_results enable row level security;

-- Tabela de tarefas
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  key_result_id uuid references public.key_results(id) on delete cascade not null,
  title text not null,
  description text,
  assignee_id uuid references auth.users(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed', 'blocked')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;

-- Trigger para atualizar updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger update_sectors_updated_at before update on public.sectors for each row execute function public.update_updated_at_column();
create trigger update_okr_cycles_updated_at before update on public.okr_cycles for each row execute function public.update_updated_at_column();
create trigger update_objectives_updated_at before update on public.objectives for each row execute function public.update_updated_at_column();
create trigger update_key_results_updated_at before update on public.key_results for each row execute function public.update_updated_at_column();
create trigger update_tasks_updated_at before update on public.tasks for each row execute function public.update_updated_at_column();

-- RLS Policies para profiles
create policy "Users can view all profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (user_id = auth.uid());
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (user_id = auth.uid());

-- RLS Policies para sectors (todos podem ver, admin pode gerenciar)
create policy "Anyone can view sectors" on public.sectors for select to authenticated using (true);
create policy "Admins can manage sectors" on public.sectors for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para okr_cycles
create policy "Anyone can view cycles" on public.okr_cycles for select to authenticated using (true);
create policy "Admins and gestors can manage cycles" on public.okr_cycles for all to authenticated 
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'gestor'));

-- RLS Policies para objectives
create policy "Anyone can view objectives" on public.objectives for select to authenticated using (true);
create policy "Admins and gestors can insert objectives" on public.objectives for insert to authenticated 
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'gestor'));
create policy "Admins gestors and analysts can update objectives" on public.objectives for update to authenticated 
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'analista'));
create policy "Admins can delete objectives" on public.objectives for delete to authenticated 
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para key_results
create policy "Anyone can view key_results" on public.key_results for select to authenticated using (true);
create policy "Admins and gestors can insert key_results" on public.key_results for insert to authenticated 
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'gestor'));
create policy "Admins gestors and analysts can update key_results" on public.key_results for update to authenticated 
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'analista'));
create policy "Admins can delete key_results" on public.key_results for delete to authenticated 
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para tasks
create policy "Anyone can view tasks" on public.tasks for select to authenticated using (true);
create policy "Admins gestors and analysts can manage tasks" on public.tasks for all to authenticated 
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'analista'));