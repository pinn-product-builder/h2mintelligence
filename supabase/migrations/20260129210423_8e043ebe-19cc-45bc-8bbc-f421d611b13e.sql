-- Criar enum para roles
create type public.app_role as enum ('admin', 'gestor', 'analista', 'visualizador');

-- Criar tabela user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Habilitar RLS
alter table public.user_roles enable row level security;

-- Função security definer para verificar role (evita recursão)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Função para obter role do usuário
create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = _user_id
  limit 1
$$;

-- Policy: Admins podem ver todos os roles
create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policy: Usuários podem ver seu próprio role
create policy "Users can view own role"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

-- Policy: Apenas admins podem inserir roles
create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Policy: Apenas admins podem atualizar roles
create policy "Admins can update roles"
on public.user_roles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policy: Apenas admins podem deletar roles
create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));